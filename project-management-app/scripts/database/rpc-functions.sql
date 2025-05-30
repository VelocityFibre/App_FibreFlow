-- Supabase RPC Functions for FibreFlow Project Management
-- These functions provide efficient database operations for the project hierarchy

-- ============================================
-- 1. get_project_hierarchy
-- ============================================
-- Retrieves the complete project hierarchy with all phases, steps, and tasks
-- Excludes archived records and includes assignee information

CREATE OR REPLACE FUNCTION get_project_hierarchy(p_project_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'id', p.id,
        'name', p.name,
        'client_id', p.client_id,
        'project_manager_id', p.project_manager_id,
        'start_date', p.start_date,
        'end_date', p.end_date,
        'budget', p.budget,
        'status', p.status,
        'progress_percentage', p.progress_percentage,
        'created_at', p.created_at,
        'updated_at', p.updated_at,
        'phases', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', ph.id,
                    'name', ph.name,
                    'phase_type', ph.phase_type,
                    'order_index', ph.order_index,
                    'status', ph.status,
                    'created_at', ph.created_at,
                    'updated_at', ph.updated_at,
                    'steps', (
                        SELECT COALESCE(json_agg(
                            json_build_object(
                                'id', s.id,
                                'name', s.name,
                                'order_index', s.order_index,
                                'status', s.status,
                                'created_at', s.created_at,
                                'updated_at', s.updated_at,
                                'tasks', (
                                    SELECT COALESCE(json_agg(
                                        json_build_object(
                                            'id', t.id,
                                            'title', t.title,
                                            'description', t.description,
                                            'assigned_to', t.assigned_to,
                                            'secondary_assignee', t.secondary_assignee,
                                            'status', t.status,
                                            'progress_percentage', t.progress_percentage,
                                            'priority', t.priority,
                                            'start_date', t.start_date,
                                            'due_date', t.due_date,
                                            'completed_at', t.completed_at,
                                            'order_index', t.order_index,
                                            'created_at', t.created_at,
                                            'updated_at', t.updated_at,
                                            'assignee_info', (
                                                SELECT json_build_object(
                                                    'id', st.id,
                                                    'name', st.name,
                                                    'email', st.email,
                                                    'role', st.role
                                                )
                                                FROM staff st
                                                WHERE st.id = t.assigned_to
                                                AND st.archived_at IS NULL
                                            ),
                                            'secondary_assignee_info', (
                                                SELECT json_build_object(
                                                    'id', st2.id,
                                                    'name', st2.name,
                                                    'email', st2.email,
                                                    'role', st2.role
                                                )
                                                FROM staff st2
                                                WHERE st2.id = t.secondary_assignee
                                                AND st2.archived_at IS NULL
                                            ),
                                            'dependencies', (
                                                SELECT COALESCE(json_agg(
                                                    json_build_object(
                                                        'id', td.id,
                                                        'depends_on_task_id', td.depends_on_task_id,
                                                        'depends_on_task_title', dt.title
                                                    )
                                                    ORDER BY dt.order_index
                                                ), '[]'::json)
                                                FROM task_dependencies td
                                                JOIN tasks dt ON dt.id = td.depends_on_task_id
                                                WHERE td.task_id = t.id
                                                AND dt.archived_at IS NULL
                                            )
                                        )
                                        ORDER BY t.order_index, t.created_at
                                    ), '[]'::json)
                                    FROM tasks t
                                    WHERE t.step_id = s.id
                                    AND t.archived_at IS NULL
                                )
                            )
                            ORDER BY s.order_index, s.created_at
                        ), '[]'::json)
                        FROM steps s
                        WHERE s.phase_id = ph.id
                        AND s.archived_at IS NULL
                    )
                )
                ORDER BY ph.order_index, ph.created_at
            ), '[]'::json)
            FROM phases ph
            WHERE ph.project_id = p.id
            AND ph.archived_at IS NULL
        )
    ) INTO result
    FROM projects p
    WHERE p.id = p_project_id
    AND p.archived_at IS NULL;
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_project_hierarchy(uuid) TO authenticated;

-- ============================================
-- 2. reorder_tasks
-- ============================================
-- Reorders tasks within a step by updating their order_index values
-- Handles the complex logic of maintaining order consistency

CREATE OR REPLACE FUNCTION reorder_tasks(
    p_task_ids uuid[],
    p_new_positions integer[]
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    i integer;
    task_count integer;
    step_id uuid;
    result json;
BEGIN
    -- Validate input arrays have the same length
    IF array_length(p_task_ids, 1) != array_length(p_new_positions, 1) THEN
        RAISE EXCEPTION 'Task IDs and positions arrays must have the same length';
    END IF;
    
    task_count := array_length(p_task_ids, 1);
    
    -- Get the step_id from the first task to ensure all tasks are in the same step
    SELECT t.step_id INTO step_id
    FROM tasks t
    WHERE t.id = p_task_ids[1]
    AND t.archived_at IS NULL;
    
    IF step_id IS NULL THEN
        RAISE EXCEPTION 'Task not found or is archived';
    END IF;
    
    -- Verify all tasks belong to the same step
    FOR i IN 1..task_count LOOP
        IF NOT EXISTS (
            SELECT 1 FROM tasks 
            WHERE id = p_task_ids[i] 
            AND step_id = step_id 
            AND archived_at IS NULL
        ) THEN
            RAISE EXCEPTION 'All tasks must belong to the same step and not be archived';
        END IF;
    END LOOP;
    
    -- Start transaction block
    BEGIN
        -- Temporarily set all affected tasks to negative order_index to avoid conflicts
        UPDATE tasks
        SET order_index = -order_index - 1000
        WHERE id = ANY(p_task_ids);
        
        -- Update each task with its new position
        FOR i IN 1..task_count LOOP
            UPDATE tasks
            SET order_index = p_new_positions[i],
                updated_at = now()
            WHERE id = p_task_ids[i];
        END LOOP;
        
        -- Create audit log entry
        INSERT INTO audit_logs (
            action,
            resource_type,
            resource_id,
            details,
            created_at
        ) VALUES (
            'UPDATE',
            'TASK',
            step_id::text,
            jsonb_build_object(
                'action', 'reorder_tasks',
                'task_count', task_count,
                'step_id', step_id
            ),
            now()
        );
        
        result := json_build_object(
            'success', true,
            'message', format('Successfully reordered %s tasks', task_count),
            'step_id', step_id
        );
        
        RETURN result;
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback will happen automatically
            RAISE;
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reorder_tasks(uuid[], integer[]) TO authenticated;

-- ============================================
-- 3. check_circular_dependency
-- ============================================
-- Checks if adding a dependency would create a circular dependency chain
-- Uses recursive CTE to traverse the dependency graph

CREATE OR REPLACE FUNCTION check_circular_dependency(
    p_task_id uuid,
    p_depends_on_task_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    has_circular_dependency boolean;
BEGIN
    -- Check if adding this dependency would create a circular reference
    WITH RECURSIVE dependency_chain AS (
        -- Start with the task that would be depended upon
        SELECT 
            t.id,
            t.title,
            0 as depth
        FROM tasks t
        WHERE t.id = p_depends_on_task_id
        AND t.archived_at IS NULL
        
        UNION ALL
        
        -- Recursively follow all dependencies
        SELECT 
            t.id,
            t.title,
            dc.depth + 1
        FROM tasks t
        INNER JOIN task_dependencies td ON td.task_id = t.id
        INNER JOIN dependency_chain dc ON dc.id = td.depends_on_task_id
        WHERE t.archived_at IS NULL
        AND dc.depth < 100  -- Prevent infinite recursion
    )
    SELECT EXISTS (
        SELECT 1 
        FROM dependency_chain 
        WHERE id = p_task_id
    ) INTO has_circular_dependency;
    
    RETURN has_circular_dependency;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_circular_dependency(uuid, uuid) TO authenticated;

-- ============================================
-- 4. bulk_update_status
-- ============================================
-- Updates the status of multiple tasks in a single operation
-- Includes validation and audit logging

CREATE OR REPLACE FUNCTION bulk_update_status(
    p_task_ids uuid[],
    p_new_status text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    task_count integer;
    updated_count integer;
    valid_statuses text[] := ARRAY['not_started', 'in_progress', 'completed', 'blocked', 'cancelled'];
    result json;
BEGIN
    -- Validate the new status
    IF NOT (p_new_status = ANY(valid_statuses)) THEN
        RAISE EXCEPTION 'Invalid status: %. Valid statuses are: %', 
            p_new_status, array_to_string(valid_statuses, ', ');
    END IF;
    
    -- Validate input
    IF p_task_ids IS NULL OR array_length(p_task_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Task IDs array cannot be null or empty';
    END IF;
    
    task_count := array_length(p_task_ids, 1);
    
    -- Enforce bulk operation limit
    IF task_count > 100 THEN
        RAISE EXCEPTION 'Bulk operations are limited to 100 tasks at a time for safety';
    END IF;
    
    -- Perform the bulk update
    WITH updated AS (
        UPDATE tasks
        SET 
            status = p_new_status,
            updated_at = now(),
            completed_at = CASE 
                WHEN p_new_status = 'completed' THEN now()
                WHEN p_new_status != 'completed' THEN NULL
                ELSE completed_at
            END,
            progress_percentage = CASE
                WHEN p_new_status = 'completed' THEN 100
                WHEN p_new_status = 'not_started' THEN 0
                ELSE progress_percentage
            END
        WHERE id = ANY(p_task_ids)
        AND archived_at IS NULL
        RETURNING id
    )
    SELECT COUNT(*) INTO updated_count FROM updated;
    
    -- Log the bulk operation
    INSERT INTO audit_logs (
        action,
        resource_type,
        resource_id,
        details,
        created_at
    ) VALUES (
        'UPDATE',
        'TASK',
        'bulk-operation',
        jsonb_build_object(
            'action', 'bulk_update_status',
            'new_status', p_new_status,
            'requested_count', task_count,
            'updated_count', updated_count,
            'task_ids', p_task_ids
        ),
        now()
    );
    
    -- Return result
    result := json_build_object(
        'success', true,
        'requested_count', task_count,
        'updated_count', updated_count,
        'new_status', p_new_status,
        'message', format('Successfully updated %s out of %s tasks', updated_count, task_count)
    );
    
    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION bulk_update_status(uuid[], text) TO authenticated;

-- ============================================
-- Additional Helper Functions
-- ============================================

-- Function to get task dependency tree
CREATE OR REPLACE FUNCTION get_task_dependency_tree(p_task_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    WITH RECURSIVE dependency_tree AS (
        -- Base case: the task itself
        SELECT 
            t.id,
            t.title,
            t.status,
            0 as depth,
            ARRAY[t.id] as path
        FROM tasks t
        WHERE t.id = p_task_id
        AND t.archived_at IS NULL
        
        UNION ALL
        
        -- Recursive case: tasks this task depends on
        SELECT 
            t.id,
            t.title,
            t.status,
            dt.depth + 1,
            dt.path || t.id
        FROM tasks t
        INNER JOIN task_dependencies td ON td.depends_on_task_id = t.id
        INNER JOIN dependency_tree dt ON dt.id = td.task_id
        WHERE t.archived_at IS NULL
        AND NOT t.id = ANY(dt.path)  -- Prevent cycles
        AND dt.depth < 10  -- Limit depth
    )
    SELECT json_agg(
        json_build_object(
            'id', id,
            'title', title,
            'status', status,
            'depth', depth
        )
        ORDER BY depth, title
    ) INTO result
    FROM dependency_tree;
    
    RETURN COALESCE(result, '[]'::json);
END;
$$;

GRANT EXECUTE ON FUNCTION get_task_dependency_tree(uuid) TO authenticated;

-- Function to calculate project progress
CREATE OR REPLACE FUNCTION calculate_project_progress(p_project_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_tasks integer;
    completed_tasks integer;
    progress integer;
BEGIN
    -- Count total non-archived tasks
    SELECT COUNT(*)
    INTO total_tasks
    FROM tasks t
    JOIN steps s ON s.id = t.step_id
    JOIN phases p ON p.id = s.phase_id
    WHERE p.project_id = p_project_id
    AND t.archived_at IS NULL
    AND s.archived_at IS NULL
    AND p.archived_at IS NULL;
    
    -- Count completed tasks
    SELECT COUNT(*)
    INTO completed_tasks
    FROM tasks t
    JOIN steps s ON s.id = t.step_id
    JOIN phases p ON p.id = s.phase_id
    WHERE p.project_id = p_project_id
    AND t.status = 'completed'
    AND t.archived_at IS NULL
    AND s.archived_at IS NULL
    AND p.archived_at IS NULL;
    
    -- Calculate percentage
    IF total_tasks > 0 THEN
        progress := ROUND((completed_tasks::numeric / total_tasks::numeric) * 100);
    ELSE
        progress := 0;
    END IF;
    
    -- Update the project's progress_percentage
    UPDATE projects
    SET 
        progress_percentage = progress,
        updated_at = now()
    WHERE id = p_project_id;
    
    RETURN progress;
END;
$$;

GRANT EXECUTE ON FUNCTION calculate_project_progress(uuid) TO authenticated;
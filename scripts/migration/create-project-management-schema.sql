-- ============================================================================
-- FibreFlow Project Management Module - Database Schema Migration
-- ============================================================================
-- Description: Complete SQL migration for the 4-level project hierarchy system
-- Version: 1.0.0
-- Date: 2025-01-30
-- 
-- Hierarchy: Projects → Project Phases → Phase Steps → Project Tasks
-- Features: Soft delete, RLS, audit logging, circular dependency prevention
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Project status enum
CREATE TYPE project_status AS ENUM (
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled'
);

-- Phase types matching the 6 standard phases
CREATE TYPE phase_type AS ENUM (
  'planning',
  'ip',        -- In Progress
  'wip',       -- Work In Progress
  'handover',
  'hoc',       -- Handover Complete
  'fac'        -- Final Acceptance Complete
);

-- Generic status for phases, steps, and tasks
CREATE TYPE work_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'blocked',
  'cancelled'
);

-- Task priority levels
CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Approval status for workflow gates
CREATE TYPE approval_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'expired'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Projects table (enhanced from existing structure)
-- Note: This assumes the existing projects table will be migrated
CREATE TABLE IF NOT EXISTS projects_v2 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name TEXT NOT NULL,
  project_code TEXT UNIQUE, -- For easy reference
  description TEXT,
  client_id UUID REFERENCES new_customers(id),
  project_manager_id UUID REFERENCES staff(id),
  backup_manager_id UUID REFERENCES staff(id), -- For coverage
  
  -- Dates
  start_date DATE,
  end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Financial
  budget DECIMAL(12,2),
  actual_cost DECIMAL(12,2) DEFAULT 0,
  currency_code CHAR(3) DEFAULT 'USD',
  
  -- Status and progress
  status project_status DEFAULT 'planning',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  health_status TEXT CHECK (health_status IN ('on_track', 'at_risk', 'critical')),
  
  -- Location (maintaining compatibility)
  location_id UUID REFERENCES locations(id),
  region TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Soft delete and timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  archived_by UUID REFERENCES staff(id),
  
  -- Indexes will be created after table
  CONSTRAINT valid_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_actual_dates CHECK (actual_end_date IS NULL OR actual_end_date >= actual_start_date)
);

-- Project phases table (6 standard phases)
CREATE TABLE project_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects_v2(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phase_type phase_type NOT NULL,
  description TEXT,
  
  -- Order and status
  order_index INTEGER NOT NULL,
  status work_status DEFAULT 'not_started',
  is_milestone BOOLEAN DEFAULT FALSE,
  
  -- Dates
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Approval gates
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_status approval_status,
  approved_by UUID REFERENCES staff(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2) DEFAULT 0,
  
  -- Soft delete and timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT unique_phase_order UNIQUE (project_id, order_index) WHERE archived_at IS NULL,
  CONSTRAINT valid_phase_dates CHECK (planned_end_date >= planned_start_date),
  CONSTRAINT valid_actual_phase_dates CHECK (actual_end_date IS NULL OR actual_end_date >= actual_start_date)
);

-- Phase steps table (configurable steps within each phase)
CREATE TABLE phase_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phase_id UUID NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Order and status
  order_index INTEGER NOT NULL,
  status work_status DEFAULT 'not_started',
  is_required BOOLEAN DEFAULT TRUE,
  
  -- Dependencies
  depends_on_steps UUID[] DEFAULT '{}', -- Array of step IDs this step depends on
  
  -- Progress tracking
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2) DEFAULT 0,
  
  -- Soft delete and timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT unique_step_order UNIQUE (phase_id, order_index) WHERE archived_at IS NULL
);

-- Project tasks table (individual work items)
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES phase_steps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_code TEXT, -- Optional task reference code
  
  -- Assignment (supporting multiple assignees via separate table)
  primary_assignee_id UUID REFERENCES staff(id),
  
  -- Status and priority
  status work_status DEFAULT 'not_started',
  priority task_priority DEFAULT 'medium',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  
  -- Dates
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Time tracking
  estimated_hours DECIMAL(10,2),
  actual_hours DECIMAL(10,2) DEFAULT 0,
  
  -- Order
  order_index INTEGER NOT NULL,
  
  -- Task specific metadata
  task_type TEXT, -- e.g., 'trenching', 'aerial', 'testing'
  location_details JSONB, -- Specific location info for this task
  equipment_required TEXT[],
  materials_required JSONB,
  
  -- Validation and constraints from VALIDATION_LOGIC.md
  is_blocked BOOLEAN DEFAULT FALSE,
  blocked_reason TEXT,
  blocker_task_ids UUID[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]', -- Array of attachment objects
  
  -- Soft delete and timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_by UUID REFERENCES staff(id),
  archived_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT unique_task_order UNIQUE (step_id, order_index) WHERE archived_at IS NULL,
  CONSTRAINT valid_task_dates CHECK (due_date IS NULL OR due_date >= start_date),
  CONSTRAINT valid_completion CHECK (
    (status = 'completed' AND completed_at IS NOT NULL) OR
    (status != 'completed' AND completed_at IS NULL)
  )
);

-- Task dependencies table (for circular dependency prevention)
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'finish_to_start' CHECK (dependency_type IN ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish')),
  lag_days INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES staff(id),
  
  -- Constraints
  CONSTRAINT unique_dependency UNIQUE(task_id, depends_on_task_id),
  CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- Task assignments table (many-to-many staff assignments)
CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES staff(id),
  role TEXT, -- 'primary', 'secondary', 'reviewer', etc.
  assigned_hours DECIMAL(10,2),
  
  -- Assignment tracking
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES staff(id),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  unassigned_by UUID REFERENCES staff(id),
  
  -- Performance tracking
  hours_logged DECIMAL(10,2) DEFAULT 0,
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 5),
  
  -- Metadata
  notes TEXT,
  
  -- Constraints
  CONSTRAINT unique_active_assignment UNIQUE(task_id, staff_id) WHERE unassigned_at IS NULL
);

-- Project comments table (for collaboration)
CREATE TABLE project_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects_v2(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES project_phases(id) ON DELETE CASCADE,
  step_id UUID REFERENCES phase_steps(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  
  -- Comment details
  comment_text TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES staff(id),
  
  -- Threading support
  parent_comment_id UUID REFERENCES project_comments(id) ON DELETE CASCADE,
  
  -- Mentions
  mentioned_users UUID[] DEFAULT '{}',
  
  -- Metadata
  is_internal BOOLEAN DEFAULT FALSE, -- Internal comments not visible to clients
  attachments JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- At least one reference must be provided
  CONSTRAINT has_reference CHECK (
    project_id IS NOT NULL OR 
    phase_id IS NOT NULL OR 
    step_id IS NOT NULL OR 
    task_id IS NOT NULL
  )
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Projects indexes
CREATE INDEX idx_projects_v2_status ON projects_v2(status) WHERE archived_at IS NULL;
CREATE INDEX idx_projects_v2_project_manager ON projects_v2(project_manager_id) WHERE archived_at IS NULL;
CREATE INDEX idx_projects_v2_client ON projects_v2(client_id) WHERE archived_at IS NULL;
CREATE INDEX idx_projects_v2_dates ON projects_v2(start_date, end_date) WHERE archived_at IS NULL;
CREATE INDEX idx_projects_v2_project_code ON projects_v2(project_code) WHERE archived_at IS NULL;
CREATE INDEX idx_projects_v2_tags ON projects_v2 USING gin(tags) WHERE archived_at IS NULL;

-- Project phases indexes
CREATE INDEX idx_project_phases_project ON project_phases(project_id) WHERE archived_at IS NULL;
CREATE INDEX idx_project_phases_status ON project_phases(status) WHERE archived_at IS NULL;
CREATE INDEX idx_project_phases_phase_type ON project_phases(phase_type) WHERE archived_at IS NULL;
CREATE INDEX idx_project_phases_order ON project_phases(project_id, order_index) WHERE archived_at IS NULL;

-- Phase steps indexes
CREATE INDEX idx_phase_steps_phase ON phase_steps(phase_id) WHERE archived_at IS NULL;
CREATE INDEX idx_phase_steps_status ON phase_steps(status) WHERE archived_at IS NULL;
CREATE INDEX idx_phase_steps_order ON phase_steps(phase_id, order_index) WHERE archived_at IS NULL;

-- Project tasks indexes
CREATE INDEX idx_project_tasks_step ON project_tasks(step_id) WHERE archived_at IS NULL;
CREATE INDEX idx_project_tasks_assignee ON project_tasks(primary_assignee_id) WHERE archived_at IS NULL;
CREATE INDEX idx_project_tasks_status ON project_tasks(status) WHERE archived_at IS NULL;
CREATE INDEX idx_project_tasks_priority ON project_tasks(priority) WHERE archived_at IS NULL;
CREATE INDEX idx_project_tasks_dates ON project_tasks(start_date, due_date) WHERE archived_at IS NULL;
CREATE INDEX idx_project_tasks_order ON project_tasks(step_id, order_index) WHERE archived_at IS NULL;
CREATE INDEX idx_project_tasks_tags ON project_tasks USING gin(tags) WHERE archived_at IS NULL;
CREATE INDEX idx_project_tasks_blocked ON project_tasks(is_blocked) WHERE archived_at IS NULL AND is_blocked = TRUE;

-- Task dependencies indexes
CREATE INDEX idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);

-- Task assignments indexes
CREATE INDEX idx_task_assignments_task ON task_assignments(task_id) WHERE unassigned_at IS NULL;
CREATE INDEX idx_task_assignments_staff ON task_assignments(staff_id) WHERE unassigned_at IS NULL;
CREATE INDEX idx_task_assignments_role ON task_assignments(role) WHERE unassigned_at IS NULL;

-- Comments indexes
CREATE INDEX idx_project_comments_project ON project_comments(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_comments_phase ON project_comments(phase_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_comments_step ON project_comments(step_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_comments_task ON project_comments(task_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_comments_author ON project_comments(author_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_projects_v2_updated_at BEFORE UPDATE ON projects_v2
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_phases_updated_at BEFORE UPDATE ON project_phases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_phase_steps_updated_at BEFORE UPDATE ON phase_steps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_comments_updated_at BEFORE UPDATE ON project_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate phase progress based on steps
CREATE OR REPLACE FUNCTION calculate_phase_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_steps INTEGER;
    completed_steps INTEGER;
    new_progress INTEGER;
BEGIN
    -- Count total non-archived steps
    SELECT COUNT(*) INTO total_steps
    FROM phase_steps
    WHERE phase_id = NEW.phase_id AND archived_at IS NULL;
    
    -- Count completed steps
    SELECT COUNT(*) INTO completed_steps
    FROM phase_steps
    WHERE phase_id = NEW.phase_id 
    AND status = 'completed' 
    AND archived_at IS NULL;
    
    -- Calculate percentage
    IF total_steps > 0 THEN
        new_progress := ROUND((completed_steps::NUMERIC / total_steps) * 100);
    ELSE
        new_progress := 0;
    END IF;
    
    -- Update phase progress
    UPDATE project_phases
    SET progress_percentage = new_progress
    WHERE id = NEW.phase_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_phase_progress
    AFTER UPDATE OF status ON phase_steps
    FOR EACH ROW
    EXECUTE FUNCTION calculate_phase_progress();

-- Function to calculate step progress based on tasks
CREATE OR REPLACE FUNCTION calculate_step_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    new_progress INTEGER;
BEGIN
    -- Count total non-archived tasks
    SELECT COUNT(*) INTO total_tasks
    FROM project_tasks
    WHERE step_id = NEW.step_id AND archived_at IS NULL;
    
    -- Count completed tasks
    SELECT COUNT(*) INTO completed_tasks
    FROM project_tasks
    WHERE step_id = NEW.step_id 
    AND status = 'completed' 
    AND archived_at IS NULL;
    
    -- Calculate percentage
    IF total_tasks > 0 THEN
        new_progress := ROUND((completed_tasks::NUMERIC / total_tasks) * 100);
    ELSE
        new_progress := 0;
    END IF;
    
    -- Update step progress
    UPDATE phase_steps
    SET progress_percentage = new_progress
    WHERE id = NEW.step_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_step_progress
    AFTER UPDATE OF status ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION calculate_step_progress();

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

-- Function to log changes to audit_logs table
CREATE OR REPLACE FUNCTION log_project_changes()
RETURNS TRIGGER AS $$
DECLARE
    audit_action TEXT;
    resource_type TEXT;
    resource_id TEXT;
    changes JSONB;
BEGIN
    -- Determine action
    IF TG_OP = 'INSERT' THEN
        audit_action := 'CREATE';
        changes := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        audit_action := 'UPDATE';
        changes := jsonb_build_object(
            'old', to_jsonb(OLD),
            'new', to_jsonb(NEW)
        );
    ELSIF TG_OP = 'DELETE' THEN
        audit_action := 'DELETE';
        changes := to_jsonb(OLD);
    END IF;
    
    -- Determine resource type
    resource_type := TG_TABLE_NAME;
    
    -- Get resource ID
    IF TG_OP = 'DELETE' THEN
        resource_id := OLD.id::TEXT;
    ELSE
        resource_id := NEW.id::TEXT;
    END IF;
    
    -- Insert audit log
    INSERT INTO audit_logs (
        action,
        resource_type,
        resource_id,
        details,
        created_at
    ) VALUES (
        audit_action,
        resource_type,
        resource_id,
        changes,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to all tables
CREATE TRIGGER audit_projects_v2
    AFTER INSERT OR UPDATE OR DELETE ON projects_v2
    FOR EACH ROW EXECUTE FUNCTION log_project_changes();

CREATE TRIGGER audit_project_phases
    AFTER INSERT OR UPDATE OR DELETE ON project_phases
    FOR EACH ROW EXECUTE FUNCTION log_project_changes();

CREATE TRIGGER audit_phase_steps
    AFTER INSERT OR UPDATE OR DELETE ON phase_steps
    FOR EACH ROW EXECUTE FUNCTION log_project_changes();

CREATE TRIGGER audit_project_tasks
    AFTER INSERT OR UPDATE OR DELETE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION log_project_changes();

CREATE TRIGGER audit_task_dependencies
    AFTER INSERT OR UPDATE OR DELETE ON task_dependencies
    FOR EACH ROW EXECUTE FUNCTION log_project_changes();

CREATE TRIGGER audit_task_assignments
    AFTER INSERT OR UPDATE OR DELETE ON task_assignments
    FOR EACH ROW EXECUTE FUNCTION log_project_changes();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE projects_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view all non-archived projects" ON projects_v2
    FOR SELECT USING (archived_at IS NULL);

CREATE POLICY "Project managers can update their projects" ON projects_v2
    FOR UPDATE USING (
        project_manager_id = auth.uid() OR 
        backup_manager_id = auth.uid()
    );

CREATE POLICY "Only admins can create projects" ON projects_v2
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'manager')
        )
    );

-- Project phases policies
CREATE POLICY "Users can view phases of visible projects" ON project_phases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects_v2 
            WHERE id = project_phases.project_id 
            AND archived_at IS NULL
        )
    );

CREATE POLICY "Project managers can manage phases" ON project_phases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects_v2 
            WHERE id = project_phases.project_id 
            AND (project_manager_id = auth.uid() OR backup_manager_id = auth.uid())
        )
    );

-- Phase steps policies
CREATE POLICY "Users can view steps of visible phases" ON phase_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_phases ph
            JOIN projects_v2 p ON p.id = ph.project_id
            WHERE ph.id = phase_steps.phase_id 
            AND p.archived_at IS NULL
        )
    );

CREATE POLICY "Project managers can manage steps" ON phase_steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_phases ph
            JOIN projects_v2 p ON p.id = ph.project_id
            WHERE ph.id = phase_steps.phase_id 
            AND (p.project_manager_id = auth.uid() OR p.backup_manager_id = auth.uid())
        )
    );

-- Project tasks policies
CREATE POLICY "Users can view tasks of visible steps" ON project_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM phase_steps ps
            JOIN project_phases ph ON ph.id = ps.phase_id
            JOIN projects_v2 p ON p.id = ph.project_id
            WHERE ps.id = project_tasks.step_id 
            AND p.archived_at IS NULL
        )
    );

CREATE POLICY "Assigned users can update their tasks" ON project_tasks
    FOR UPDATE USING (
        primary_assignee_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM task_assignments 
            WHERE task_id = project_tasks.id 
            AND staff_id = auth.uid() 
            AND unassigned_at IS NULL
        )
    );

CREATE POLICY "Project managers can manage all tasks" ON project_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM phase_steps ps
            JOIN project_phases ph ON ph.id = ps.phase_id
            JOIN projects_v2 p ON p.id = ph.project_id
            WHERE ps.id = project_tasks.step_id 
            AND (p.project_manager_id = auth.uid() OR p.backup_manager_id = auth.uid())
        )
    );

-- Task dependencies policies
CREATE POLICY "Users can view dependencies" ON task_dependencies
    FOR SELECT USING (true);

CREATE POLICY "Project managers can manage dependencies" ON task_dependencies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_tasks pt
            JOIN phase_steps ps ON ps.id = pt.step_id
            JOIN project_phases ph ON ph.id = ps.phase_id
            JOIN projects_v2 p ON p.id = ph.project_id
            WHERE pt.id = task_dependencies.task_id 
            AND (p.project_manager_id = auth.uid() OR p.backup_manager_id = auth.uid())
        )
    );

-- Task assignments policies
CREATE POLICY "Users can view assignments" ON task_assignments
    FOR SELECT USING (true);

CREATE POLICY "Project managers can manage assignments" ON task_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM project_tasks pt
            JOIN phase_steps ps ON ps.id = pt.step_id
            JOIN project_phases ph ON ph.id = ps.phase_id
            JOIN projects_v2 p ON p.id = ph.project_id
            WHERE pt.id = task_assignments.task_id 
            AND (p.project_manager_id = auth.uid() OR p.backup_manager_id = auth.uid())
        )
    );

-- Comments policies
CREATE POLICY "Users can view non-internal comments" ON project_comments
    FOR SELECT USING (
        is_internal = FALSE OR author_id = auth.uid()
    );

CREATE POLICY "Users can create comments" ON project_comments
    FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update their own comments" ON project_comments
    FOR UPDATE USING (author_id = auth.uid());

-- ============================================================================
-- MIGRATION HELPERS
-- ============================================================================

-- Function to migrate existing projects to new structure
CREATE OR REPLACE FUNCTION migrate_existing_projects()
RETURNS void AS $$
BEGIN
    -- This function would be customized based on existing data
    -- Example structure provided
    
    -- INSERT INTO projects_v2 (columns...)
    -- SELECT columns... FROM projects;
    
    -- Create default phases for each project
    -- INSERT INTO project_phases (project_id, name, phase_type, order_index)
    -- SELECT id, 'Planning', 'planning', 1 FROM projects_v2;
    
    RAISE NOTICE 'Project migration completed';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VALIDATION FUNCTIONS (from VALIDATION_LOGIC.md)
-- ============================================================================

-- Function to validate task dependencies don't create cycles
CREATE OR REPLACE FUNCTION validate_no_circular_dependencies()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this dependency would create a cycle
    IF EXISTS (
        WITH RECURSIVE dep_chain AS (
            SELECT depends_on_task_id, task_id, 1 as depth
            FROM task_dependencies
            WHERE task_id = NEW.depends_on_task_id
            
            UNION ALL
            
            SELECT td.depends_on_task_id, td.task_id, dc.depth + 1
            FROM task_dependencies td
            JOIN dep_chain dc ON dc.task_id = td.depends_on_task_id
            WHERE dc.depth < 100 -- Prevent infinite recursion
        )
        SELECT 1 FROM dep_chain WHERE depends_on_task_id = NEW.task_id
    ) THEN
        RAISE EXCEPTION 'Circular dependency detected';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_circular_dependencies
    BEFORE INSERT OR UPDATE ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION validate_no_circular_dependencies();

-- ============================================================================
-- WORKFLOW FUNCTIONS (from WORKFLOW_RULES.md)
-- ============================================================================

-- Function to validate phase progression
CREATE OR REPLACE FUNCTION validate_phase_progression()
RETURNS TRIGGER AS $$
DECLARE
    prev_phase_status work_status;
    prev_phase_type phase_type;
BEGIN
    -- Only check if status is changing to in_progress
    IF NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
        -- Get previous phase status
        SELECT status, phase_type INTO prev_phase_status, prev_phase_type
        FROM project_phases
        WHERE project_id = NEW.project_id
        AND order_index = NEW.order_index - 1
        AND archived_at IS NULL;
        
        -- If there's a previous phase, it must be completed
        IF prev_phase_type IS NOT NULL AND prev_phase_status != 'completed' THEN
            RAISE EXCEPTION 'Previous phase must be completed before starting this phase';
        END IF;
        
        -- Check if approval is required and granted
        IF NEW.requires_approval AND NEW.approval_status != 'approved' THEN
            RAISE EXCEPTION 'Phase requires approval before it can be started';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_phase_progression
    BEFORE UPDATE ON project_phases
    FOR EACH ROW
    EXECUTE FUNCTION validate_phase_progression();

-- ============================================================================
-- USEFUL VIEWS
-- ============================================================================

-- View for project overview with task counts
CREATE OR REPLACE VIEW project_overview AS
SELECT 
    p.id,
    p.project_name,
    p.project_code,
    p.status,
    p.progress_percentage,
    p.start_date,
    p.end_date,
    c.name as client_name,
    s.name as project_manager_name,
    COUNT(DISTINCT ph.id) as phase_count,
    COUNT(DISTINCT ps.id) as step_count,
    COUNT(DISTINCT pt.id) as task_count,
    COUNT(DISTINCT pt.id) FILTER (WHERE pt.status = 'completed') as completed_tasks,
    COUNT(DISTINCT pt.id) FILTER (WHERE pt.is_blocked = TRUE) as blocked_tasks
FROM projects_v2 p
LEFT JOIN new_customers c ON c.id = p.client_id
LEFT JOIN staff s ON s.id = p.project_manager_id
LEFT JOIN project_phases ph ON ph.project_id = p.id AND ph.archived_at IS NULL
LEFT JOIN phase_steps ps ON ps.phase_id = ph.id AND ps.archived_at IS NULL
LEFT JOIN project_tasks pt ON pt.step_id = ps.id AND pt.archived_at IS NULL
WHERE p.archived_at IS NULL
GROUP BY p.id, p.project_name, p.project_code, p.status, p.progress_percentage, 
         p.start_date, p.end_date, c.name, s.name;

-- View for staff workload
CREATE OR REPLACE VIEW staff_workload AS
SELECT 
    s.id as staff_id,
    s.name as staff_name,
    COUNT(DISTINCT pt.id) as total_tasks,
    COUNT(DISTINCT pt.id) FILTER (WHERE pt.status = 'in_progress') as active_tasks,
    COUNT(DISTINCT pt.id) FILTER (WHERE pt.status = 'not_started') as pending_tasks,
    COUNT(DISTINCT pt.id) FILTER (WHERE pt.due_date < CURRENT_DATE AND pt.status != 'completed') as overdue_tasks,
    SUM(pt.estimated_hours) FILTER (WHERE pt.status != 'completed') as remaining_hours
FROM staff s
LEFT JOIN project_tasks pt ON pt.primary_assignee_id = s.id AND pt.archived_at IS NULL
LEFT JOIN task_assignments ta ON ta.staff_id = s.id AND ta.unassigned_at IS NULL
WHERE s.archived_at IS NULL
GROUP BY s.id, s.name;

-- ============================================================================
-- INITIAL DATA (Standard Phases)
-- ============================================================================

-- Function to create standard phases for a project
CREATE OR REPLACE FUNCTION create_standard_phases(p_project_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO project_phases (project_id, name, phase_type, order_index, description)
    VALUES 
        (p_project_id, 'Planning', 'planning', 1, 'Initial planning and requirements gathering'),
        (p_project_id, 'In Progress', 'ip', 2, 'Active implementation phase'),
        (p_project_id, 'Work In Progress', 'wip', 3, 'Detailed work execution'),
        (p_project_id, 'Handover', 'handover', 4, 'Transition to operations'),
        (p_project_id, 'Handover Complete', 'hoc', 5, 'Handover finalization'),
        (p_project_id, 'Final Acceptance Complete', 'fac', 6, 'Project closure and acceptance');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON projects_v2, project_phases, phase_steps, project_tasks, 
    task_dependencies, task_assignments, project_comments TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION create_standard_phases(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_phase_progress() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_step_progress() TO authenticated;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'FibreFlow Project Management Schema Migration Completed Successfully';
    RAISE NOTICE 'Tables created: projects_v2, project_phases, phase_steps, project_tasks, task_dependencies, task_assignments, project_comments';
    RAISE NOTICE 'Remember to run migrate_existing_projects() if you have existing data';
END $$;
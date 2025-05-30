-- Migration to fix the foreign key constraint issue with project_tasks.assigned_to
-- This migration changes the assigned_to column from INTEGER to TEXT/UUID to match staff.id

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE project_tasks 
DROP CONSTRAINT IF EXISTS fk_project_tasks_assigned_to_staff;

-- Change the column type from INTEGER to TEXT (or UUID if staff.id is UUID)
ALTER TABLE project_tasks 
ALTER COLUMN assigned_to TYPE TEXT USING assigned_to::TEXT;

-- Re-add the foreign key constraint with the correct reference
ALTER TABLE project_tasks 
ADD CONSTRAINT fk_project_tasks_assigned_to_staff 
FOREIGN KEY (assigned_to) 
REFERENCES staff(id) 
ON DELETE SET NULL;

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);
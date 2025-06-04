-- Migration to add archived_at timestamp to all tables for soft delete functionality
-- This follows the project rule to never delete records but use soft delete with archived_at timestamp

-- Add archived_at to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add archived_at to new_customers table
ALTER TABLE new_customers 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add archived_at to phases table
ALTER TABLE phases 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add archived_at to project_phases table
ALTER TABLE project_phases 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add archived_at to project_tasks table
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add archived_at to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add archived_at to locations table
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add archived_at to staff table
ALTER TABLE staff 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Add archived_at to audit_logs table
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ DEFAULT NULL;

-- Create indexes on archived_at columns for better query performance when filtering
CREATE INDEX IF NOT EXISTS idx_projects_archived_at ON projects(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_new_customers_archived_at ON new_customers(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_phases_archived_at ON phases(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_phases_archived_at ON project_phases(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_tasks_archived_at ON project_tasks(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON tasks(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_locations_archived_at ON locations(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_staff_archived_at ON staff(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_archived_at ON audit_logs(archived_at) WHERE archived_at IS NOT NULL;

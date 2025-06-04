-- STEP 1: Add customer_id column to the main projects table if it doesn't exist
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES new_customers(id);

-- STEP 2: Create an index on customer_id for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);

-- STEP 3: Migrate data from new_projects to projects
-- First, update existing projects with customer_id from new_projects where IDs match
UPDATE projects p
SET customer_id = np.customer_id
FROM new_projects np
WHERE p.id = np.id AND np.customer_id IS NOT NULL;

-- STEP 4: Insert any projects from new_projects that don't exist in projects
INSERT INTO projects (
  id, 
  project_name, 
  customer_id, 
  province, 
  region, 
  start_date, 
  location_id,
  created_at,
  updated_at
)
SELECT 
  np.id, 
  np.name, 
  np.customer_id, 
  np.province, 
  np.region, 
  np.start_date, 
  np.location_id,
  np.created_at,
  CURRENT_TIMESTAMP
FROM new_projects np
WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = np.id)
ON CONFLICT (id) DO NOTHING;

-- STEP 5: Create a backup of new_projects before dropping it
CREATE TABLE IF NOT EXISTS new_projects_backup AS
SELECT * FROM new_projects;

-- STEP 6: Drop the new_projects table (COMMENT THIS OUT UNTIL VERIFIED)
-- DROP TABLE new_projects;
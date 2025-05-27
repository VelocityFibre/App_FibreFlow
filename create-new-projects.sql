-- Create a new projects table with our desired structure
CREATE TABLE IF NOT EXISTS new_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  customer_id UUID REFERENCES new_customers(id),
  province TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Get the customer_id for fibertime™
DO $$
DECLARE
  customer_id UUID;
BEGIN
  SELECT id INTO customer_id FROM new_customers WHERE name = 'fibertime™';
  
  -- Insert the projects
  INSERT INTO new_projects (name, customer_id, province, region) VALUES
  ('Lawley', customer_id, 'Gauteng', 'Vereeniging'),
  ('Mohadin', customer_id, 'North West', 'Potchefstroom'),
  ('Kuruman', customer_id, 'Northern Cape', 'Northern Cape'),
  ('Ivory Park', customer_id, 'Gauteng', 'East Rand'),
  ('Mamelodi', customer_id, 'Gauteng', 'Pretoria');
END $$;

-- Verify the data
SELECT p.name as project_name, c.name as customer_name, p.province, p.region
FROM new_projects p
JOIN new_customers c ON p.customer_id = c.id;

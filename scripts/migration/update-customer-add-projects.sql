-- 1. Update the new_customers table to include address fields
ALTER TABLE new_customers
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- 2. Update the fibertime™ customer with their address
UPDATE new_customers
SET 
  address_line1 = '1st Floor Oude Bank Building',
  address_line2 = '8 Bird St, Stellenbosch Central',
  city = 'Stellenbosch',
  postal_code = '7600'
WHERE name = 'fibertime™';

-- 3. Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  customer_id UUID REFERENCES new_customers(id),
  province TEXT,
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Get the customer_id for fibertime™
DO $$
DECLARE
  customer_id UUID;
BEGIN
  SELECT id INTO customer_id FROM new_customers WHERE name = 'fibertime™';
  
  -- 5. Insert the projects
  INSERT INTO projects (name, customer_id, province, region) VALUES
  ('Lawley', customer_id, 'Gauteng', 'Vereeniging'),
  ('Mohadin', customer_id, 'North West', 'Potchefstroom'),
  ('Kuruman', customer_id, 'Northern Cape', 'Northern Cape'),
  ('Ivory Park', customer_id, 'Gauteng', 'East Rand'),
  ('Mamelodi', customer_id, 'Gauteng', 'Pretoria');
END $$;

-- 6. Verify the data
SELECT p.name as project_name, c.name as customer_name, p.province, p.region
FROM projects p
JOIN new_customers c ON p.customer_id = c.id;

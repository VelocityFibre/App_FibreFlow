-- Create a new table with the structure we want
CREATE TABLE IF NOT EXISTS new_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT
);

-- Insert our test customer
INSERT INTO new_customers (name, email, phone, status)
VALUES ('fibertime™', 'info@fibertime.com', '+27123456789', 'Active');

-- Now update our dashboard page to use this table instead

-- Drop the existing customers table if it's causing problems
DROP TABLE IF EXISTS customers;

-- Create a new customers table with the proper structure
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT
);

-- Insert the fibertime™ customer
INSERT INTO customers (name, email, phone, status)
VALUES ('fibertime™', 'info@fibertime.com', '+27123456789', 'Active');

-- Verify the customer was added
SELECT * FROM customers;

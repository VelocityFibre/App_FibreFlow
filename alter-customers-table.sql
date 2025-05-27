-- First, let's check the structure of the customers table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- Add the columns we need if they don't exist
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS status TEXT;

-- Insert fibertime™ customer (if the table has an id column with a default value)
INSERT INTO customers (name, email, phone, status)
VALUES ('fibertime™', 'info@fibertime.com', '+27123456789', 'Active');

-- Verify the customer was added
SELECT * FROM customers;

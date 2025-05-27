-- First, let's check the structure of the customers table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- Insert fibertime™ customer with an explicit ID value
INSERT INTO customers (id, name, email, phone, status)
VALUES (
  gen_random_uuid(), -- Generate a UUID for the ID
  'fibertime™', 
  'info@fibertime.com', 
  '+27123456789', 
  'Active'
);

-- Verify the customer was added
SELECT * FROM customers;

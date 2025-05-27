-- SQL to check the structure of the customers table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- SQL to add an ID column with a default value if it doesn't have one
DO $$
BEGIN
    -- Check if id column has a default value
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' 
        AND column_name = 'id' 
        AND column_default IS NULL
    ) THEN
        -- Add a default value using UUID generation
        ALTER TABLE customers 
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
END $$;

-- Insert fibertime™ customer with explicit ID
INSERT INTO customers (id, name, email, phone, status)
VALUES (gen_random_uuid(), 'fibertime™', 'info@fibertime.com', '+27123456789', 'Active');

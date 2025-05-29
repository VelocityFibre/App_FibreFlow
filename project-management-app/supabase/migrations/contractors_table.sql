-- Create the contractors table
CREATE TABLE contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  specialization TEXT,
  rating INTEGER,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX contractors_name_idx ON contractors (name);
CREATE INDEX contractors_active_idx ON contractors (active);

-- Create a function to update the updated_at timestamp (if it doesn't already exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_contractors_updated_at
BEFORE UPDATE ON contractors
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read contractors"
  ON contractors
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert contractors"
  ON contractors
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update contractors"
  ON contractors
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete contractors"
  ON contractors
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comments to the table and columns for better documentation
COMMENT ON TABLE contractors IS 'Stores information about contractors working on projects';
COMMENT ON COLUMN contractors.name IS 'Name of the contractor company';
COMMENT ON COLUMN contractors.contact_person IS 'Primary contact person at the contractor';
COMMENT ON COLUMN contractors.email IS 'Email address of the contractor';
COMMENT ON COLUMN contractors.phone IS 'Phone number of the contractor';
COMMENT ON COLUMN contractors.address IS 'Street address of the contractor';
COMMENT ON COLUMN contractors.city IS 'City where the contractor is located';
COMMENT ON COLUMN contractors.province IS 'Province where the contractor is located';
COMMENT ON COLUMN contractors.postal_code IS 'Postal code of the contractor';
COMMENT ON COLUMN contractors.specialization IS 'Area of specialization for the contractor';
COMMENT ON COLUMN contractors.rating IS 'Rating of the contractor (1-5)';
COMMENT ON COLUMN contractors.active IS 'Whether the contractor is currently active';
COMMENT ON COLUMN contractors.notes IS 'Additional notes about the contractor';

-- Insert some initial sample data
INSERT INTO contractors (name, contact_person, email, phone, specialization, active)
VALUES 
  ('Contractor 1', 'John Smith', 'john@contractor1.com', '555-1234', 'Pole Installation', true),
  ('Contractor 2', 'Jane Doe', 'jane@contractor2.com', '555-5678', 'Trenching', true),
  ('Contractor 3', 'Bob Johnson', 'bob@contractor3.com', '555-9012', 'Fiber Splicing', true);

-- Create the contacts table
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'supplier', 'contractor', 'staff')),
  entity_id UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX contacts_entity_type_idx ON contacts (entity_type);
CREATE INDEX contacts_entity_id_idx ON contacts (entity_id);
CREATE INDEX contacts_name_idx ON contacts (first_name, last_name);
CREATE INDEX contacts_email_idx ON contacts (email);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read contacts"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert contacts"
  ON contacts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their contacts"
  ON contacts
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete their contacts"
  ON contacts
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comments to the table and columns for better documentation
COMMENT ON TABLE contacts IS 'Stores contact information for customers, suppliers, contractors, and staff';
COMMENT ON COLUMN contacts.first_name IS 'First name of the contact';
COMMENT ON COLUMN contacts.last_name IS 'Last name of the contact';
COMMENT ON COLUMN contacts.email IS 'Email address of the contact';
COMMENT ON COLUMN contacts.phone IS 'Phone number of the contact';
COMMENT ON COLUMN contacts.position IS 'Job position or title of the contact';
COMMENT ON COLUMN contacts.entity_type IS 'Type of entity this contact is associated with (customer, supplier, contractor, staff)';
COMMENT ON COLUMN contacts.entity_id IS 'ID of the entity this contact is associated with';
COMMENT ON COLUMN contacts.notes IS 'Additional notes about the contact';

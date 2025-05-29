-- Create the daily_tracker table
CREATE TABLE daily_tracker (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  project_id UUID NOT NULL REFERENCES new_projects(id) ON DELETE CASCADE,
  contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
  pole_permissions INTEGER DEFAULT 0,
  missing_status INTEGER DEFAULT 0,
  declines INTEGER DEFAULT 0,
  home_signups INTEGER DEFAULT 0,
  poles_planted INTEGER DEFAULT 0,
  stringing_meters NUMERIC(10, 2) DEFAULT 0,
  trenching_meters NUMERIC(10, 2) DEFAULT 0,
  homes_connected INTEGER DEFAULT 0,
  key_issues TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX daily_tracker_project_id_idx ON daily_tracker (project_id);
CREATE INDEX daily_tracker_contractor_id_idx ON daily_tracker (contractor_id);
CREATE INDEX daily_tracker_date_idx ON daily_tracker (date);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_daily_tracker_updated_at
BEFORE UPDATE ON daily_tracker
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS)
ALTER TABLE daily_tracker ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read daily_tracker"
  ON daily_tracker
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert daily_tracker"
  ON daily_tracker
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their daily_tracker"
  ON daily_tracker
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to delete their daily_tracker"
  ON daily_tracker
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comments to the table and columns for better documentation
COMMENT ON TABLE daily_tracker IS 'Stores daily KPIs and reports from project sites';
COMMENT ON COLUMN daily_tracker.date IS 'Date of the daily report';
COMMENT ON COLUMN daily_tracker.project_id IS 'Reference to the project';
COMMENT ON COLUMN daily_tracker.contractor_id IS 'Reference to the contractor working on the project';
COMMENT ON COLUMN daily_tracker.pole_permissions IS 'Number of pole permissions obtained for the day';
COMMENT ON COLUMN daily_tracker.missing_status IS 'Number of missing status for the day';
COMMENT ON COLUMN daily_tracker.declines IS 'Number of declines for the day';
COMMENT ON COLUMN daily_tracker.home_signups IS 'Number of home sign-ups for the day';
COMMENT ON COLUMN daily_tracker.poles_planted IS 'Number of poles planted for the day';
COMMENT ON COLUMN daily_tracker.stringing_meters IS 'Meters of stringing completed for the day';
COMMENT ON COLUMN daily_tracker.trenching_meters IS 'Meters of trenching completed for the day';
COMMENT ON COLUMN daily_tracker.homes_connected IS 'Number of homes connected for the day';
COMMENT ON COLUMN daily_tracker.key_issues IS 'Key issues encountered during the day';
COMMENT ON COLUMN daily_tracker.notes IS 'Additional notes for the day';

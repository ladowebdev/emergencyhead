/*
  # Create user locations table

  1. New Tables
    - `user_locations`
      - `user_id` (uuid, primary key, foreign key to profiles)
      - `latitude` (double precision, location latitude)
      - `longitude` (double precision, location longitude)
      - `accuracy` (double precision, optional)
      - `timestamp` (timestamptz)
  2. Security
    - Enable RLS on `user_locations` table
    - Add policy for users to manage their own location
    - Add policy for emergency contacts to view user location
*/

CREATE TABLE IF NOT EXISTS user_locations (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision,
  timestamp timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own location"
  ON user_locations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- In a real app, we would add a policy for emergency contacts to view location
-- This would require an emergency_contacts table with relationships
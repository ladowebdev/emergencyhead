/*
  # Create blood requests table

  1. New Tables
    - `blood_requests`
      - `id` (uuid, primary key)
      - `requester_id` (uuid, foreign key to profiles)
      - `blood_type` (text, blood type needed)
      - `units_needed` (integer, number of units needed)
      - `hospital_name` (text, optional)
      - `urgency` (text, level of urgency)
      - `status` (text, request status)
      - `latitude` (double precision, location latitude)
      - `longitude` (double precision, location longitude)
      - `description` (text, optional)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz)
  2. Security
    - Enable RLS on `blood_requests` table
    - Add policies for authenticated users to read all active requests
    - Add policy for users to manage their own requests
*/

CREATE TABLE IF NOT EXISTS blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blood_type text CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')) NOT NULL,
  units_needed integer DEFAULT 1 NOT NULL,
  hospital_name text,
  urgency text CHECK (urgency IN ('low', 'medium', 'high', 'critical')) NOT NULL DEFAULT 'medium',
  status text CHECK (status IN ('active', 'fulfilled', 'cancelled')) NOT NULL DEFAULT 'active',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz NOT NULL
);

ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to read all active blood requests
CREATE POLICY "Anyone can view active blood requests"
  ON blood_requests
  FOR SELECT
  TO authenticated
  USING (status = 'active');

-- Allow users to manage their own blood requests
CREATE POLICY "Users can manage their own blood requests"
  ON blood_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() = requester_id);
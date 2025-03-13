/*
  # Initial Schema for Emergency Response App

  1. New Tables
    - `profiles` - User profiles with personal information
    - `emergency_alerts` - Emergency alerts sent by users
    - `emergency_contacts` - User's emergency contacts
    - `user_locations` - User location tracking data
    - `blood_requests` - Blood donation requests
    - `blood_banks` - Blood bank information
    - `blood_inventory` - Blood inventory at blood banks
    - `notifications` - User notifications
    - `donation_history` - Blood donation history

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their own data
    - Add policies for public access to blood bank information
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  phone text,
  blood_type text CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  is_donor boolean DEFAULT false,
  last_donation_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Emergency alerts table
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text CHECK (type IN ('medical', 'fire', 'police', 'blood_request', 'other')) NOT NULL,
  status text CHECK (status IN ('active', 'responded', 'resolved')) NOT NULL DEFAULT 'active',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy double precision,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON emergency_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
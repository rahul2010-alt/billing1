/*
  # Create backups table for database backup management

  1. New Tables
    - `backups`
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `size` (numeric)
      - `status` (text, constrained to 'completed' or 'in_progress')
      - `download_url` (text)

  2. Security
    - Enable RLS on `backups` table
    - Add policy for authenticated users to read all backups
    - Add policy for authenticated users to create backups
*/

-- Create backups table
CREATE TABLE IF NOT EXISTS backups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  size numeric NOT NULL,
  status text NOT NULL CHECK (status IN ('completed', 'in_progress')),
  download_url text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read backups"
  ON backups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create backups"
  ON backups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create index on created_at for efficient ordering
CREATE INDEX idx_backups_created_at ON backups(created_at);
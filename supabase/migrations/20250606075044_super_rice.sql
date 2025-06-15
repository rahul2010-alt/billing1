/*
  # Fix customers table RLS policies and schema

  1. Schema Changes
    - Remove duplicate stateCode column that conflicts with state_code
    - Ensure proper column structure

  2. Security Updates
    - Drop existing RLS policies that may be conflicting
    - Create new, properly structured RLS policies for all CRUD operations
    - Ensure authenticated users can perform all necessary operations

  3. Important Notes
    - This migration fixes the "new row violates row-level security policy" error
    - Ensures proper access control for customer management
*/

-- First, drop the duplicate stateCode column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'stateCode'
  ) THEN
    ALTER TABLE customers DROP COLUMN "stateCode";
  END IF;
END $$;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON customers;

-- Create comprehensive RLS policies for customers table
CREATE POLICY "Allow authenticated users to read customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
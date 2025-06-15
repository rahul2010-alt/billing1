/*
  # Comprehensive fix for customers table RLS issues
  
  1. Disable RLS temporarily to clean up
  2. Drop all existing policies
  3. Recreate policies with proper permissions
  4. Re-enable RLS
  5. Grant necessary permissions to authenticated role
*/

-- Temporarily disable RLS to clean up
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for customers
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to read customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to update customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to delete customers" ON customers;

-- Grant necessary table permissions to authenticated role
GRANT ALL ON customers TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Re-enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create new comprehensive policies
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
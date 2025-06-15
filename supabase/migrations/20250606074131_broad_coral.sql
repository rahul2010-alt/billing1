/*
  # Add CRUD policies for customers table

  1. Security Changes
    - Add INSERT policy for authenticated users to create customers
    - Add UPDATE policy for authenticated users to modify customers  
    - Add DELETE policy for authenticated users to remove customers
    
  2. Notes
    - Maintains existing SELECT policy for authenticated users
    - Allows full CRUD operations for any authenticated user
    - Ensures data security while enabling proper functionality
*/

-- Add INSERT policy for customers
CREATE POLICY "Enable insert access for authenticated users"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for customers  
CREATE POLICY "Enable update access for authenticated users"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for customers
CREATE POLICY "Enable delete access for authenticated users"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);
/*
  # Add missing RLS policies for products table

  1. Security Updates
    - Add INSERT policy for authenticated users to create products
    - Add UPDATE policy for authenticated users to modify products  
    - Add DELETE policy for authenticated users to remove products

  The products table already has RLS enabled and a SELECT policy, but is missing
  the other CRUD operation policies which is causing the "new row violates row-level 
  security policy" error when trying to insert products.
*/

-- Add INSERT policy for products
CREATE POLICY "Enable insert access for authenticated users"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for products
CREATE POLICY "Enable update access for authenticated users"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for products
CREATE POLICY "Enable delete access for authenticated users"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);
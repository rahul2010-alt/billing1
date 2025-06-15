/*
  # Add INSERT policy for customers table

  1. Changes
    - Add INSERT policy for authenticated users on customers table
    - Use DO block to safely create policy only if it doesn't exist

  2. Security
    - Allows authenticated users to insert new customer records
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'customers' 
    AND policyname = 'Allow authenticated users to insert customers'
  ) THEN
    CREATE POLICY "Allow authenticated users to insert customers"
      ON customers
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;
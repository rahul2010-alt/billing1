/*
  # Add state_code column to customers table

  1. Changes
    - Add state_code column to customers table
    - Make state_code NOT NULL to match existing state column constraint
    - Add default value to prevent issues with existing records

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' 
    AND column_name = 'state_code'
  ) THEN
    ALTER TABLE customers 
    ADD COLUMN state_code text NOT NULL DEFAULT '00';
  END IF;
END $$;
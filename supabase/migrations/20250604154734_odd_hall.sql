/*
  # Fix state code column name mismatch

  1. Changes
    - Add computed column 'stateCode' that references 'state_code'
    - This maintains backward compatibility while fixing the frontend query

  2. Security
    - Inherits RLS policies from the customers table
*/

ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS "stateCode" text 
GENERATED ALWAYS AS (state_code) STORED;
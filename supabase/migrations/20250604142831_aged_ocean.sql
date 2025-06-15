/*
  # Add batch_number column to products table

  1. Changes
    - Add `batch_number` column to `products` table
    - Make it required (NOT NULL)
    - Add index for faster lookups

  2. Notes
    - Using DO block to safely add column if it doesn't exist
    - Adding index to optimize queries that filter or sort by batch number
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'batch_number'
  ) THEN
    ALTER TABLE products ADD COLUMN batch_number text NOT NULL;
    CREATE INDEX idx_products_batch_number ON products(batch_number);
  END IF;
END $$;
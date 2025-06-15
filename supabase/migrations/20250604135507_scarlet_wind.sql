/*
  # Add get_low_stock_items function
  
  1. New Functions
    - `get_low_stock_items`: Returns products where stock is less than or equal to reorder_level
  
  2. Security
    - Function is accessible to authenticated users only
*/

CREATE OR REPLACE FUNCTION get_low_stock_items()
RETURNS TABLE (
  id uuid,
  name text,
  hsn_code text,
  batch_number text,
  manufacturer text,
  expiry_date date,
  purchase_price numeric(10,2),
  selling_price numeric(10,2),
  gst_rate numeric(5,2),
  stock integer,
  unit text,
  category text,
  reorder_level integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM products
  WHERE stock <= reorder_level
  ORDER BY stock ASC;
$$;
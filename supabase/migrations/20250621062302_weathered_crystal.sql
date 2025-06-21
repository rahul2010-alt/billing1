/*
  # Stock Update Functions and Triggers

  1. Tables
    - `stock_movements` - Track all stock changes with reference to source transactions

  2. Functions
    - `update_stock_on_purchase()` - Increases product stock when purchase items are added
    - `update_stock_on_invoice()` - Decreases product stock when invoice items are added

  3. Triggers
    - Trigger on purchase_items table to update stock on INSERT
    - Trigger on invoice_items table to update stock on INSERT

  4. Security
    - Functions are security definer to ensure they can update stock
    - RLS policies for stock_movements table
*/

-- Create stock_movements table first
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('purchase', 'sale', 'adjustment')),
  quantity integer NOT NULL,
  reference_type text,
  reference_id uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on stock_movements
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for stock_movements
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stock_movements' 
    AND policyname = 'Enable read access for authenticated users'
  ) THEN
    CREATE POLICY "Enable read access for authenticated users"
      ON stock_movements
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'stock_movements' 
    AND policyname = 'Enable insert access for authenticated users'
  ) THEN
    CREATE POLICY "Enable insert access for authenticated users"
      ON stock_movements
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Function to update stock when purchase items are added
CREATE OR REPLACE FUNCTION update_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Increase stock when purchase item is added
  UPDATE products 
  SET stock = stock + NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  -- Log the stock update (with error handling)
  BEGIN
    INSERT INTO stock_movements (
      product_id,
      movement_type,
      quantity,
      reference_type,
      reference_id,
      notes
    ) VALUES (
      NEW.product_id,
      'purchase',
      NEW.quantity,
      'purchase_item',
      NEW.id,
      'Stock increased from purchase'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- If stock_movements insert fails, don't block the trigger
      NULL;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update stock when invoice items are added
CREATE OR REPLACE FUNCTION update_stock_on_invoice()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease stock when invoice item is added
  UPDATE products 
  SET stock = stock - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.product_id;
  
  -- Log the stock update (with error handling)
  BEGIN
    INSERT INTO stock_movements (
      product_id,
      movement_type,
      quantity,
      reference_type,
      reference_id,
      notes
    ) VALUES (
      NEW.product_id,
      'sale',
      -NEW.quantity,
      'invoice_item',
      NEW.id,
      'Stock decreased from sale'
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- If stock_movements insert fails, don't block the trigger
      NULL;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safely create triggers only if the target tables exist
DO $$
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS tr_purchase_items_stock ON purchase_items;
  DROP TRIGGER IF EXISTS tr_invoice_items_stock ON invoice_items;

  -- Create trigger on purchase_items if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'purchase_items') THEN
    CREATE TRIGGER tr_purchase_items_stock
      AFTER INSERT ON purchase_items
      FOR EACH ROW
      EXECUTE FUNCTION update_stock_on_purchase();
  END IF;

  -- Create trigger on invoice_items if table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'invoice_items') THEN
    CREATE TRIGGER tr_invoice_items_stock
      AFTER INSERT ON invoice_items
      FOR EACH ROW
      EXECUTE FUNCTION update_stock_on_invoice();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_movements_reference ON stock_movements(reference_type, reference_id);
/*
  # Add missing RLS policies for invoices table

  1. Security Updates
    - Add INSERT policy for authenticated users to create invoices
    - Add UPDATE policy for authenticated users to modify invoices  
    - Add DELETE policy for authenticated users to delete invoices

  2. Changes
    - Enable full CRUD operations for authenticated users on invoices table
    - Ensures invoice creation, editing, and deletion work properly
*/

-- Add INSERT policy for invoices
CREATE POLICY "Enable insert access for authenticated users" ON invoices
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for invoices  
CREATE POLICY "Enable update access for authenticated users" ON invoices
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add DELETE policy for invoices
CREATE POLICY "Enable delete access for authenticated users" ON invoices
  FOR DELETE TO authenticated
  USING (true);

-- Also add missing policies for invoice_items table
CREATE POLICY "Enable insert access for authenticated users" ON invoice_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON invoice_items
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON invoice_items
  FOR DELETE TO authenticated
  USING (true);

-- Add missing policies for purchase_items table
CREATE POLICY "Enable insert access for authenticated users" ON purchase_items
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON purchase_items
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON purchase_items
  FOR DELETE TO authenticated
  USING (true);

-- Add missing policies for purchases table
CREATE POLICY "Enable insert access for authenticated users" ON purchases
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON purchases
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON purchases
  FOR DELETE TO authenticated
  USING (true);

-- Add missing policies for suppliers table
CREATE POLICY "Enable insert access for authenticated users" ON suppliers
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON suppliers
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON suppliers
  FOR DELETE TO authenticated
  USING (true);
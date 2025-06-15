/*
  # Initial Schema for Medical Store Billing System

  1. New Tables
    - `customers`
      - Customer information for both B2B and B2C
      - Includes GST details for B2B customers
    - `products`
      - Product catalog with HSN codes and GST rates
      - Tracks stock, batch numbers, and expiry dates
    - `invoices`
      - Sales invoices with customer details
      - Supports both B2B and B2C transactions
    - `invoice_items`
      - Line items for each invoice
      - Includes GST calculations
    - `purchases`
      - Purchase records from suppliers
    - `purchase_items`
      - Line items for each purchase
    - `suppliers`
      - Supplier information with GST details

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  gstin text,
  type text NOT NULL CHECK (type IN ('B2B', 'B2C', 'B2CL')),
  state text NOT NULL,
  state_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  hsn_code text NOT NULL,
  batch_number text NOT NULL,
  manufacturer text,
  expiry_date date,
  purchase_price numeric(10,2) NOT NULL,
  selling_price numeric(10,2) NOT NULL,
  gst_rate numeric(5,2) NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  unit text NOT NULL,
  category text NOT NULL,
  reorder_level integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text NOT NULL UNIQUE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  customer_id uuid REFERENCES customers(id),
  payment_mode text NOT NULL CHECK (payment_mode IN ('cash', 'card', 'upi', 'credit')),
  payment_status text NOT NULL CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  subtotal numeric(10,2) NOT NULL,
  total_discount numeric(10,2) NOT NULL DEFAULT 0,
  total_taxable_value numeric(10,2) NOT NULL,
  total_cgst numeric(10,2) NOT NULL DEFAULT 0,
  total_sgst numeric(10,2) NOT NULL DEFAULT 0,
  total_igst numeric(10,2) NOT NULL DEFAULT 0,
  grand_total numeric(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL,
  discount numeric(5,2) NOT NULL DEFAULT 0,
  taxable_value numeric(10,2) NOT NULL,
  gst_rate numeric(5,2) NOT NULL,
  cgst numeric(10,2) NOT NULL DEFAULT 0,
  sgst numeric(10,2) NOT NULL DEFAULT 0,
  igst numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  gstin text NOT NULL,
  state text NOT NULL,
  state_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_number text NOT NULL UNIQUE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  supplier_id uuid REFERENCES suppliers(id),
  payment_status text NOT NULL CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
  amount_paid numeric(10,2) NOT NULL DEFAULT 0,
  subtotal numeric(10,2) NOT NULL,
  total_taxable_value numeric(10,2) NOT NULL,
  total_cgst numeric(10,2) NOT NULL DEFAULT 0,
  total_sgst numeric(10,2) NOT NULL DEFAULT 0,
  total_igst numeric(10,2) NOT NULL DEFAULT 0,
  grand_total numeric(10,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create purchase_items table
CREATE TABLE IF NOT EXISTS purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid REFERENCES purchases(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  price numeric(10,2) NOT NULL,
  taxable_value numeric(10,2) NOT NULL,
  gst_rate numeric(5,2) NOT NULL,
  cgst numeric(10,2) NOT NULL DEFAULT 0,
  sgst numeric(10,2) NOT NULL DEFAULT 0,
  igst numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON invoices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON invoice_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON suppliers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON purchases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable read access for authenticated users" ON purchase_items
  FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX idx_customers_gstin ON customers(gstin);
CREATE INDEX idx_products_hsn_code ON products(hsn_code);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_purchases_date ON purchases(date);
CREATE INDEX idx_products_expiry_date ON products(expiry_date);
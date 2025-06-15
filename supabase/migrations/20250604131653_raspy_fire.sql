-- Function to update product stock
CREATE OR REPLACE FUNCTION update_product_stock(p_product_id uuid, p_quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE products
  SET 
    stock = stock + p_quantity,
    updated_at = now()
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year text;
  month text;
  counter integer;
  invoice_number text;
BEGIN
  year := to_char(current_date, 'YY');
  month := to_char(current_date, 'MM');
  
  SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM '\d+$')::integer), 0) + 1
  INTO counter
  FROM invoices
  WHERE invoice_number LIKE 'INV' || year || month || '%';
  
  invoice_number := 'INV' || year || month || LPAD(counter::text, 4, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate purchase number
CREATE OR REPLACE FUNCTION generate_purchase_number()
RETURNS text AS $$
DECLARE
  year text;
  month text;
  counter integer;
  purchase_number text;
BEGIN
  year := to_char(current_date, 'YY');
  month := to_char(current_date, 'MM');
  
  SELECT COALESCE(MAX(SUBSTRING(purchase_number FROM '\d+$')::integer), 0) + 1
  INTO counter
  FROM purchases
  WHERE purchase_number LIKE 'PUR' || year || month || '%';
  
  purchase_number := 'PUR' || year || month || LPAD(counter::text, 4, '0');
  
  RETURN purchase_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update product stock on invoice item insert
CREATE OR REPLACE FUNCTION update_stock_on_invoice()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stock when invoice item is created
  IF TG_OP = 'INSERT' THEN
    UPDATE products
    SET stock = stock - NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_invoice_items_stock
AFTER INSERT ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_invoice();

-- Trigger to update product stock on purchase item insert
CREATE OR REPLACE FUNCTION update_stock_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- Update stock when purchase item is created
  IF TG_OP = 'INSERT' THEN
    UPDATE products
    SET stock = stock + NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_purchase_items_stock
AFTER INSERT ON purchase_items
FOR EACH ROW
EXECUTE FUNCTION update_stock_on_purchase();

-- Trigger to auto-generate invoice numbers
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_invoice_number
BEFORE INSERT ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_invoice_number();

-- Trigger to auto-generate purchase numbers
CREATE OR REPLACE FUNCTION set_purchase_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.purchase_number IS NULL THEN
    NEW.purchase_number := generate_purchase_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_generate_purchase_number
BEFORE INSERT ON purchases
FOR EACH ROW
EXECUTE FUNCTION set_purchase_number();
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { useAuth } from './useAuth';

export interface Invoice {
  id: string;
  bill_number: string;
  customer_id?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  notes?: string;
  created_at: string;
  created_by?: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    gst_number?: string;
    state_code: string;
  };
  bill_items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  bill_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_amount: number;
  created_at: string;
  product?: {
    id: string;
    name: string;
    manufacturer: string;
    batch_number: string;
    hsn_code?: string;
    gst_rate: number;
  };
}

export interface InvoiceFormData {
  customer_id?: string;
  items: {
    product_id: string;
    quantity: number;
    unit_price: number;
    discount: number;
  }[];
  payment_method: string;
  payment_status: string;
  notes?: string;
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          customer:customers(*),
          bill_items:bill_items(
            *,
            product:products(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const getInvoice = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          *,
          customer:customers(*),
          bill_items:bill_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch invoice');
    }
  };

  const createInvoice = async (formData: InvoiceFormData) => {
    try {
      if (!user) throw new Error('User not authenticated');

      // Generate bill number
      const { data: lastBill } = await supabase
        .from('bills')
        .select('bill_number')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let nextNumber = 1;
      if (lastBill?.bill_number) {
        const match = lastBill.bill_number.match(/INV-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1]) + 1;
        }
      }
      const billNumber = `INV-${nextNumber.toString().padStart(6, '0')}`;

      // Calculate totals
      const subtotal = formData.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price - item.discount), 0
      );
      
      // For now, assuming 18% GST
      const taxAmount = subtotal * 0.18;
      const totalAmount = subtotal + taxAmount;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('bills')
        .insert({
          bill_number: billNumber,
          customer_id: formData.customer_id,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: 0,
          total_amount: totalAmount,
          payment_method: formData.payment_method,
          payment_status: formData.payment_status,
          notes: formData.notes,
          created_by: user.id
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const items = formData.items.map(item => ({
        bill_id: invoice.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        total_amount: item.quantity * item.unit_price - item.discount
      }));

      const { error: itemsError } = await supabase
        .from('bill_items')
        .insert(items);

      if (itemsError) throw itemsError;

      // Update product stock
      for (const item of formData.items) {
        const { error: stockError } = await supabase.rpc('update_product_stock', {
          product_id: item.product_id,
          quantity_change: -item.quantity
        });
        
        if (stockError) {
          console.warn('Failed to update stock for product:', item.product_id, stockError);
        }
      }

      await fetchInvoices();
      return invoice;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      const { error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchInvoices();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update invoice');
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchInvoices();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    refetch: fetchInvoices
  };
};
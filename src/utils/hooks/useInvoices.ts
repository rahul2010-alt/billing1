import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Invoice, InvoiceItem } from '../../types';
import { useAppContext } from '../context/AppContext';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAppContext();

  useEffect(() => {
    fetchInvoices();
    
    // Set up real-time subscription with error handling
    const subscription = supabase
      .channel('invoices_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'invoices' },
        (payload) => {
          console.log('Invoice change detected:', payload);
          fetchInvoices(); // Refetch data when changes occur
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to invoices changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error for invoices');
        }
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        console.error('Error during cleanup of invoices subscription:', err);
      }
    };
  }, []);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, gstin)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      // Get the latest invoice number to generate the next one
      const { data, error } = await supabase
        .from('invoices')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const lastInvoiceNumber = data[0].invoice_number;
        const match = lastInvoiceNumber.match(/INV-(\d+)/);
        if (match) {
          const nextNumber = parseInt(match[1]) + 1;
          return `INV-${nextNumber.toString().padStart(6, '0')}`;
        }
      }
      
      // If no invoices exist or pattern doesn't match, start with INV-000001
      return 'INV-000001';
    } catch (err) {
      // Fallback to timestamp-based invoice number
      const timestamp = Date.now();
      return `INV-${timestamp}`;
    }
  };

  const createInvoice = async (
    invoice: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>,
    items: Omit<InvoiceItem, 'id' | 'invoiceId' | 'createdAt'>[]
  ) => {
    try {
      // Generate invoice number
      const invoiceNumber = await generateInvoiceNumber();

      // Map camelCase to snake_case for invoice
      const invoiceData = {
        invoice_number: invoiceNumber,
        date: invoice.date,
        customer_id: invoice.customerId,
        payment_mode: invoice.paymentMode,
        payment_status: invoice.paymentStatus,
        amount_paid: invoice.amountPaid,
        subtotal: invoice.subtotal,
        total_discount: invoice.totalDiscount,
        total_taxable_value: invoice.totalTaxableValue,
        total_cgst: invoice.totalCgst,
        total_sgst: invoice.totalSgst,
        total_igst: invoice.totalIgst,
        grand_total: invoice.grandTotal,
        notes: invoice.notes
      };

      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select('id')
        .single();

      if (invoiceError) throw invoiceError;

      // Map camelCase to snake_case for invoice items
      const itemsData = items.map(item => ({
        invoice_id: newInvoice.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        taxable_value: item.taxableValue,
        gst_rate: item.gstRate,
        cgst: item.cgst,
        sgst: item.sgst,
        igst: item.igst,
        total: item.total
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      await fetchInvoices();
      addNotification('Invoice created successfully!');
      return newInvoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addNotification('Error creating invoice: ' + (err instanceof Error ? err.message : 'Unknown error'));
      throw err;
    }
  };

  const getInvoiceById = async (id: string) => {
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, gstin, address, state, state_code, phone),
          items:invoice_items(
            *,
            product:products(name, hsn_code, batch_number)
          )
        `)
        .eq('id', id)
        .single();

      if (invoiceError) throw invoiceError;
      return invoice;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return {
    invoices,
    loading,
    error,
    createInvoice,
    getInvoiceById,
    refreshInvoices: fetchInvoices
  };
};
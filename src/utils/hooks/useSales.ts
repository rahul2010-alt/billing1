import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Invoice } from '../../types';
import { format } from 'date-fns';

export const useSales = () => {
  const [sales, setSales] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalReceived: 0,
    totalPending: 0,
    gstBreakup: {
      cgst: 0,
      sgst: 0,
      igst: 0
    }
  });

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, gstin, state_code),
          items:invoice_items(
            quantity,
            price,
            discount,
            taxable_value,
            cgst,
            sgst,
            igst,
            total,
            product:products(name, hsn_code, batch_number)
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;

      const salesData = data || [];
      setSales(salesData);

      // Calculate statistics
      const totals = salesData.reduce((acc, sale) => ({
        totalSales: acc.totalSales + sale.grand_total,
        totalReceived: acc.totalReceived + sale.amount_paid,
        gstBreakup: {
          cgst: acc.gstBreakup.cgst + sale.total_cgst,
          sgst: acc.gstBreakup.sgst + sale.total_sgst,
          igst: acc.gstBreakup.igst + sale.total_igst
        }
      }), {
        totalSales: 0,
        totalReceived: 0,
        gstBreakup: { cgst: 0, sgst: 0, igst: 0 }
      });

      setStats({
        ...totals,
        totalPending: totals.totalSales - totals.totalReceived
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSalesByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, gstin, state_code),
          items:invoice_items(
            quantity,
            price,
            discount,
            taxable_value,
            cgst,
            sgst,
            igst,
            total,
            product:products(name, hsn_code, batch_number)
          )
        `)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .lte('date', format(endDate, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    sales,
    loading,
    error,
    stats,
    fetchSales,
    getSalesByDateRange
  };
};
import { useState } from 'react';
import { supabase } from '../supabase';
import { exportToExcel } from '../exportToExcel';

export interface SalesReport {
  id: string;
  bill_number: string;
  customer_name: string;
  total_amount: number;
  tax_amount: number;
  payment_method: string;
  created_at: string;
}

export interface InventoryReport {
  id: string;
  name: string;
  manufacturer: string;
  batch_number: string;
  stock_quantity: number;
  min_stock_level: number;
  unit_price: number;
  selling_price: number;
  expiry_date: string;
}

export interface CustomerReport {
  id: string;
  name: string;
  phone: string;
  email: string;
  total_purchases: number;
  last_purchase: string;
}

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSalesReport = async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('bills')
        .select(`
          id,
          bill_number,
          total_amount,
          tax_amount,
          payment_method,
          created_at,
          customer:customers(name)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const report: SalesReport[] = (data || []).map(item => ({
        id: item.id,
        bill_number: item.bill_number,
        customer_name: item.customer?.name || 'Walk-in Customer',
        total_amount: Number(item.total_amount),
        tax_amount: Number(item.tax_amount),
        payment_method: item.payment_method,
        created_at: new Date(item.created_at).toLocaleDateString()
      }));

      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate sales report');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;

      const report: InventoryReport[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        manufacturer: item.manufacturer,
        batch_number: item.batch_number,
        stock_quantity: item.stock_quantity,
        min_stock_level: item.min_stock_level,
        unit_price: Number(item.unit_price),
        selling_price: Number(item.selling_price),
        expiry_date: new Date(item.expiry_date).toLocaleDateString()
      }));

      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate inventory report');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const generateCustomerReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          name,
          phone,
          email,
          bills(total_amount, created_at)
        `)
        .order('name');

      if (error) throw error;

      const report: CustomerReport[] = (data || []).map(customer => {
        const purchases = customer.bills || [];
        const totalPurchases = purchases.reduce((sum, bill) => sum + Number(bill.total_amount), 0);
        const lastPurchase = purchases.length > 0 
          ? new Date(Math.max(...purchases.map(p => new Date(p.created_at).getTime()))).toLocaleDateString()
          : 'Never';

        return {
          id: customer.id,
          name: customer.name,
          phone: customer.phone || '',
          email: customer.email || '',
          total_purchases: totalPurchases,
          last_purchase: lastPurchase
        };
      });

      return report;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate customer report');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const exportSalesReport = async (startDate: string, endDate: string) => {
    const data = await generateSalesReport(startDate, endDate);
    if (data.length > 0) {
      exportToExcel(data, `Sales Report ${startDate} to ${endDate}`);
    }
  };

  const exportInventoryReport = async () => {
    const data = await generateInventoryReport();
    if (data.length > 0) {
      exportToExcel(data, 'Inventory Report');
    }
  };

  const exportCustomerReport = async () => {
    const data = await generateCustomerReport();
    if (data.length > 0) {
      exportToExcel(data, 'Customer Report');
    }
  };

  return {
    loading,
    error,
    generateSalesReport,
    generateInventoryReport,
    generateCustomerReport,
    exportSalesReport,
    exportInventoryReport,
    exportCustomerReport
  };
};
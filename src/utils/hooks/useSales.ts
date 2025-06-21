import { useState, useEffect } from 'react';  
import { supabase } from '../supabase';

export interface SalesData {
  id: string;
  bill_number: string;
  customer_id?: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
}

export interface SalesStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  salesByPaymentMethod: Record<string, number>;
  dailySales: Array<{
    date: string;
    amount: number;
    orders: number;
  }>;
}

export const useSales = () => {
  const [sales, setSales] = useState<SalesData[]>([]);
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    salesByPaymentMethod: {},
    dailySales: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('bills')
        .select(`
          id,
          bill_number,
          customer_id,
          total_amount,
          payment_method,
          payment_status,
          created_at,
          customer:customers(id, name, phone, email)
        `)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSales(data || []);
      calculateStats(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (salesData: SalesData[]) => {
    const totalSales = salesData.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const totalOrders = salesData.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Sales by payment method
    const salesByPaymentMethod: Record<string, number> = {};
    salesData.forEach(sale => {
      const method = sale.payment_method || 'cash';
      salesByPaymentMethod[method] = (salesByPaymentMethod[method] || 0) + Number(sale.total_amount);
    });

    // Daily sales
    const dailySalesMap = new Map<string, { amount: number; orders: number }>();
    salesData.forEach(sale => {
      const date = new Date(sale.created_at).toISOString().split('T')[0];
      const existing = dailySalesMap.get(date) || { amount: 0, orders: 0 };
      existing.amount += Number(sale.total_amount);
      existing.orders += 1;
      dailySalesMap.set(date, existing);
    });

    const dailySales = Array.from(dailySalesMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    setStats({
      totalSales,
      totalOrders,
      averageOrderValue,
      salesByPaymentMethod,
      dailySales
    });
  };

  const getSalesByDateRange = async (startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .select(`
          id,
          bill_number,
          customer_id,
          total_amount,
          payment_method,
          payment_status,
          created_at,
          customer:customers(id, name, phone, email)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to fetch sales by date range');
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    stats,
    loading,
    error,
    fetchSales,
    getSalesByDateRange,
    refetch: fetchSales
  };
};
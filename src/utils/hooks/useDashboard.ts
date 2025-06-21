import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export interface DashboardData {
  stats: {
    sales: {
      current: number;
      previous: number;
    };
    purchases: {
      current: number;
      previous: number;
    };
    profit: {
      current: number;
      previous: number;
    };
    invoices: {
      current: number;
      previous: number;
    };
  };
  salesTrend: Array<{
    date: string;
    sales: number;
    purchases: number;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
  }>;
  lowStock: Array<{
    id: string;
    name: string;
    stock: number;
    reorderLevel: number;
    category: string;
  }>;
  expiringItems: Array<{
    id: string;
    name: string;
    expiryDate: string;
    batchNumber: string;
    category: string;
  }>;
}

export const useDashboard = (currentBusinessMonth: string) => {
  const [data, setData] = useState<DashboardData>({
    stats: {
      sales: { current: 0, previous: 0 },
      purchases: { current: 0, previous: 0 },
      profit: { current: 0, previous: 0 },
      invoices: { current: 0, previous: 0 }
    },
    salesTrend: [],
    categoryData: [],
    lowStock: [],
    expiringItems: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Parse current business month
      const [year, month] = currentBusinessMonth.split('-');
      const currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const startOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Previous month boundaries
      const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      
      // Fetch current month sales
      const { data: currentSalesData, error: currentSalesError } = await supabase
        .from('bills')
        .select('total_amount, created_at')
        .gte('created_at', startOfCurrentMonth.toISOString())
        .lte('created_at', endOfCurrentMonth.toISOString());

      if (currentSalesError) throw currentSalesError;

      // Fetch previous month sales
      const { data: previousSalesData, error: previousSalesError } = await supabase
        .from('bills')
        .select('total_amount, created_at')
        .gte('created_at', startOfPreviousMonth.toISOString())
        .lte('created_at', endOfPreviousMonth.toISOString());

      if (previousSalesError) throw previousSalesError;

      const currentSales = currentSalesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      const previousSales = previousSalesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      // Fetch invoice counts
      const { count: currentInvoices, error: currentInvoicesError } = await supabase
        .from('bills')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfCurrentMonth.toISOString())
        .lte('created_at', endOfCurrentMonth.toISOString());

      if (currentInvoicesError) throw currentInvoicesError;

      const { count: previousInvoices, error: previousInvoicesError } = await supabase
        .from('bills')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfPreviousMonth.toISOString())
        .lte('created_at', endOfPreviousMonth.toISOString());

      if (previousInvoicesError) throw previousInvoicesError;

      // Fetch low stock items
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, stock_quantity, min_stock_level, category')
        .lt('stock_quantity', 'min_stock_level');

      if (productsError) throw productsError;

      const lowStock = productsData?.map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock_quantity || 0,
        reorderLevel: product.min_stock_level || 0,
        category: product.category || 'medicine'
      })) || [];

      // Fetch expiring items (within 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data: expiringData, error: expiringError } = await supabase
        .from('products')
        .select('id, name, expiry_date, batch_number, category')
        .lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .gt('expiry_date', new Date().toISOString().split('T')[0])
        .limit(10);

      if (expiringError) throw expiringError;

      const expiringItems = expiringData?.map(product => ({
        id: product.id,
        name: product.name,
        expiryDate: product.expiry_date,
        batchNumber: product.batch_number || 'N/A',
        category: product.category || 'medicine'
      })) || [];

      // Generate sales trend data (dummy data for now)
      const salesTrend = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date(startOfCurrentMonth);
        date.setDate(date.getDate() + i);
        if (date <= endOfCurrentMonth) {
          salesTrend.push({
            date: date.getDate().toString(),
            sales: Math.floor(Math.random() * 10000) + 5000,
            purchases: Math.floor(Math.random() * 8000) + 3000
          });
        }
      }

      // Generate category data (dummy data for now)
      const categoryData = [
        { name: 'Medicine', value: Math.floor(currentSales * 0.4) },
        { name: 'Supplements', value: Math.floor(currentSales * 0.3) },
        { name: 'Medical Devices', value: Math.floor(currentSales * 0.2) },
        { name: 'Others', value: Math.floor(currentSales * 0.1) }
      ];

      setData({
        stats: {
          sales: {
            current: currentSales,
            previous: previousSales
          },
          purchases: {
            current: Math.floor(currentSales * 0.7), // Dummy calculation
            previous: Math.floor(previousSales * 0.7)
          },
          profit: {
            current: Math.floor(currentSales * 0.3), // Dummy calculation
            previous: Math.floor(previousSales * 0.3)
          },
          invoices: {
            current: currentInvoices || 0,
            previous: previousInvoices || 0
          }
        },
        salesTrend,
        categoryData,
        lowStock,
        expiringItems
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [currentBusinessMonth]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardStats
  };
};
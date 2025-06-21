import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export interface DashboardStats {
  totalSales: number;
  totalInvoices: number;
  lowStockItems: number;
  totalCustomers: number;
  monthlyRevenue: number;
  recentSales: Array<{
    id: string;
    bill_number: string;
    total_amount: number;
    created_at: string;
    customer?: {
      name: string;
    };
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    revenue: number;
  }>;
}

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalInvoices: 0,
    lowStockItems: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    recentSales: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Get current month boundaries
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Fetch total sales (monthly revenue)
      const { data: salesData, error: salesError } = await supabase
        .from('bills')
        .select('total_amount, created_at')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());

      if (salesError) throw salesError;

      const monthlyRevenue = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      // Fetch total invoices count
      const { count: totalInvoices, error: invoicesError } = await supabase
        .from('bills')
        .select('*', { count: 'exact', head: true });

      if (invoicesError) throw invoicesError;

      // Fetch all products to check low stock items (filter in JavaScript)
      const { data: allProducts, error: productsError } = await supabase
        .from('products')
        .select('stock_quantity, min_stock_level');

      if (productsError) throw productsError;

      // Filter low stock items in JavaScript
      const lowStockItems = allProducts?.filter(product => 
        (product.stock_quantity || 0) < (product.min_stock_level || 0)
      ) || [];

      // Fetch total customers
      const { count: totalCustomers, error: customersError } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      if (customersError) throw customersError;

      // Fetch recent sales
      const { data: recentSales, error: recentSalesError } = await supabase
        .from('bills')
        .select(`
          id,
          bill_number,
          total_amount,
          created_at,
          customer:customers(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentSalesError) throw recentSalesError;

      // Fetch top products (most sold this month)
      const { data: topProductsData, error: topProductsError } = await supabase
        .from('bill_items')
        .select(`
          product_id,
          quantity,
          total_amount,
          bill:bills!inner(created_at),
          product:products(id, name)
        `)
        .gte('bill.created_at', startOfMonth.toISOString())
        .lte('bill.created_at', endOfMonth.toISOString());

      if (topProductsError) throw topProductsError;

      // Aggregate top products
      const productMap = new Map();
      topProductsData?.forEach(item => {
        const productId = item.product_id;
        if (productMap.has(productId)) {
          const existing = productMap.get(productId);
          existing.totalSold += item.quantity;
          existing.revenue += Number(item.total_amount);
        } else {
          productMap.set(productId, {
            id: productId,
            name: item.product?.name || 'Unknown',
            totalSold: item.quantity,
            revenue: Number(item.total_amount)
          });
        }
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, 5);

      setStats({
        totalSales: monthlyRevenue,
        totalInvoices: totalInvoices || 0,
        lowStockItems: lowStockItems.length,
        totalCustomers: totalCustomers || 0,
        monthlyRevenue,
        recentSales: recentSales || [],
        topProducts
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchDashboardStats
  };
};
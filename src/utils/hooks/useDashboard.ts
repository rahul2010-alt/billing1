import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export const useDashboard = (month: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState({
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

  useEffect(() => {
    fetchDashboardData();
  }, [month]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [year, monthNum] = month.split('-');
      const currentStart = startOfMonth(new Date(parseInt(year), parseInt(monthNum) - 1));
      const currentEnd = endOfMonth(new Date(parseInt(year), parseInt(monthNum) - 1));
      const previousStart = startOfMonth(new Date(parseInt(year), parseInt(monthNum) - 2));
      const previousEnd = endOfMonth(new Date(parseInt(year), parseInt(monthNum) - 2));

      // Fetch current month stats
      const { data: currentInvoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('grand_total, created_at')
        .gte('date', currentStart.toISOString().split('T')[0])
        .lte('date', currentEnd.toISOString().split('T')[0]);

      if (invoicesError) throw invoicesError;

      const { data: currentPurchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('grand_total, created_at')
        .gte('date', currentStart.toISOString().split('T')[0])
        .lte('date', currentEnd.toISOString().split('T')[0]);

      if (purchasesError) throw purchasesError;

      // Fetch previous month stats
      const { data: previousInvoices, error: prevInvoicesError } = await supabase
        .from('invoices')
        .select('grand_total, created_at')
        .gte('date', previousStart.toISOString().split('T')[0])
        .lte('date', previousEnd.toISOString().split('T')[0]);

      if (prevInvoicesError) throw prevInvoicesError;

      const { data: previousPurchases, error: prevPurchasesError } = await supabase
        .from('purchases')
        .select('grand_total, created_at')
        .gte('date', previousStart.toISOString().split('T')[0])
        .lte('date', previousEnd.toISOString().split('T')[0]);

      if (prevPurchasesError) throw prevPurchasesError;

      // Fetch low stock items - Using raw SQL query to compare columns
      const { data: lowStockItems, error: lowStockError } = await supabase
        .rpc('get_low_stock_items')
        .limit(5);

      if (lowStockError) throw lowStockError;

      // Fetch expiring items
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      const { data: expiringItems, error: expiringError } = await supabase
        .from('products')
        .select('*')
        .lt('expiry_date', threeMonthsFromNow.toISOString().split('T')[0])
        .gt('expiry_date', new Date().toISOString().split('T')[0])
        .order('expiry_date', { ascending: true })
        .limit(5);

      if (expiringError) throw expiringError;

      // Calculate sales trend for the last 7 days
      const salesTrend = await Promise.all(
        Array.from({ length: 7 }, async (_, i) => {
          const date = subDays(new Date(), 6 - i);
          const formattedDate = format(date, 'yyyy-MM-dd');
          
          const { data: dayInvoices } = await supabase
            .from('invoices')
            .select('grand_total')
            .eq('date', formattedDate);

          const { data: dayPurchases } = await supabase
            .from('purchases')
            .select('grand_total')
            .eq('date', formattedDate);

          return {
            date: format(date, 'MMM dd'),
            sales: dayInvoices?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0,
            purchases: dayPurchases?.reduce((sum, pur) => sum + (pur.grand_total || 0), 0) || 0
          };
        })
      );

      // Calculate category-wise sales
      const { data: categoryData, error: categoryError } = await supabase
        .from('invoice_items')
        .select(`
          quantity,
          total,
          products (
            category
          )
        `)
        .gte('created_at', currentStart.toISOString())
        .lte('created_at', currentEnd.toISOString());

      if (categoryError) throw categoryError;

      const categorySales = categoryData?.reduce((acc, item) => {
        const category = item.products?.category || 'Uncategorized';
        if (!acc[category]) acc[category] = 0;
        acc[category] += item.total || 0;
        return acc;
      }, {});

      const categoryChartData = Object.entries(categorySales || {}).map(([name, value]) => ({
        name,
        value: Number(value)
      })).sort((a, b) => b.value - a.value);

      setData({
        stats: {
          sales: {
            current: currentInvoices?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0,
            previous: previousInvoices?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0
          },
          purchases: {
            current: currentPurchases?.reduce((sum, pur) => sum + (pur.grand_total || 0), 0) || 0,
            previous: previousPurchases?.reduce((sum, pur) => sum + (pur.grand_total || 0), 0) || 0
          },
          profit: {
            current: (currentInvoices?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0) -
                    (currentPurchases?.reduce((sum, pur) => sum + (pur.grand_total || 0), 0) || 0),
            previous: (previousInvoices?.reduce((sum, inv) => sum + (inv.grand_total || 0), 0) || 0) -
                     (previousPurchases?.reduce((sum, pur) => sum + (pur.grand_total || 0), 0) || 0)
          },
          invoices: {
            current: currentInvoices?.length || 0,
            previous: previousInvoices?.length || 0
          }
        },
        salesTrend,
        categoryData: categoryChartData,
        lowStock: lowStockItems || [],
        expiringItems: expiringItems || []
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refreshData: fetchDashboardData };
};
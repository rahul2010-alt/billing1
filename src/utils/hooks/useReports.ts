import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { format } from 'date-fns';

export const useReports = () => {
  const [data, setData] = useState({
    totals: {
      sales: 0,
      purchases: 0
    },
    counts: {
      invoices: 0,
      purchases: 0
    },
    topProducts: [],
    categoryPerformance: [],
    paymentMethods: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch sales data
      const { data: salesData, error: salesError } = await supabase
        .from('invoices')
        .select('*');

      if (salesError) throw salesError;

      // Fetch purchase data
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select('*');

      if (purchaseError) throw purchaseError;

      // Fetch product sales data
      const { data: productSales, error: productError } = await supabase
        .from('invoice_items')
        .select(`
          quantity,
          price,
          total,
          product:products (
            name,
            category,
            purchase_price
          )
        `);

      if (productError) throw productError;

      // Calculate totals
      const totals = {
        sales: salesData?.reduce((sum, sale) => sum + sale.grand_total, 0) || 0,
        purchases: purchaseData?.reduce((sum, purchase) => sum + purchase.grand_total, 0) || 0
      };

      const counts = {
        invoices: salesData?.length || 0,
        purchases: purchaseData?.length || 0
      };

      // Process product sales data
      const productStats = productSales?.reduce((acc, item) => {
        const productName = item.product?.name;
        if (!acc[productName]) {
          acc[productName] = {
            name: productName,
            category: item.product?.category,
            quantity: 0,
            revenue: 0,
            profit: 0
          };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].revenue += item.total;
        acc[productName].profit += item.total - (item.quantity * (item.product?.purchase_price || 0));
        return acc;
      }, {});

      const topProducts = Object.values(productStats || {})
        .sort((a: any, b: any) => b.revenue - a.revenue)
        .slice(0, 10);

      // Calculate category performance
      const categoryStats = productSales?.reduce((acc, item) => {
        const category = item.product?.category;
        if (!acc[category]) {
          acc[category] = {
            name: category,
            sales: 0
          };
        }
        acc[category].sales += item.total;
        return acc;
      }, {});

      const categoryPerformance = Object.values(categoryStats || {})
        .sort((a: any, b: any) => b.sales - a.sales);

      // Calculate payment method stats
      const paymentStats = salesData?.reduce((acc, sale) => {
        const method = sale.payment_mode;
        if (!acc[method]) {
          acc[method] = {
            method: method.charAt(0).toUpperCase() + method.slice(1),
            amount: 0,
            count: 0
          };
        }
        acc[method].amount += sale.amount_paid;
        acc[method].count += 1;
        return acc;
      }, {});

      const paymentMethods = Object.values(paymentStats || {})
        .sort((a: any, b: any) => b.amount - a.amount);

      setData({
        totals,
        counts,
        topProducts,
        categoryPerformance,
        paymentMethods
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);

      // Implement date range filtering logic here
      // Similar to fetchReports but with date range filters
      
      await fetchReports(); // Temporary: Replace with actual date-filtered implementation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching reports');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchReports,
    fetchReportsByDateRange
  };
};
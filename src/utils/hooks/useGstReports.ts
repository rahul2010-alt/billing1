import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export const useGstReports = () => {
  const [data, setData] = useState({
    b2b: [],
    b2cl: [],
    b2cs: [],
    hsn: [],
    totals: {
      b2b: 0,
      b2cl: 0,
      b2cs: 0
    },
    counts: {
      b2b: 0,
      b2cl: 0,
      b2cs: 0
    },
    gst: {
      cgst: 0,
      sgst: 0,
      igst: 0
    }
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

      // Fetch B2B invoices
      const { data: b2bData, error: b2bError } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, gstin, state_code)
        `)
        .eq('customer.type', 'B2B')
        .order('date', { ascending: false });

      if (b2bError) throw b2bError;

      // Fetch B2CL invoices
      const { data: b2clData, error: b2clError } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(name, state_code)
        `)
        .eq('customer.type', 'B2CL')
        .order('date', { ascending: false });

      if (b2clError) throw b2clError;

      // Fetch B2CS summary
      const { data: b2csData, error: b2csError } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:customers(state_code)
        `)
        .eq('customer.type', 'B2C')
        .order('date', { ascending: false });

      if (b2csError) throw b2csError;

      // Fetch HSN summary
      const { data: hsnData, error: hsnError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          product:products(name, hsn_code)
        `)
        .order('created_at', { ascending: false });

      if (hsnError) throw hsnError;

      // Process and transform the data
      const b2b = b2bData?.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        date: invoice.date,
        customerName: invoice.customer?.name,
        gstin: invoice.customer?.gstin,
        stateCode: invoice.customer?.state_code,
        taxableValue: invoice.total_taxable_value,
        cgst: invoice.total_cgst,
        sgst: invoice.total_sgst,
        igst: invoice.total_igst,
        total: invoice.grand_total
      })) || [];

      const b2cl = b2clData?.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        date: invoice.date,
        stateCode: invoice.customer?.state_code,
        taxableValue: invoice.total_taxable_value,
        igst: invoice.total_igst,
        total: invoice.grand_total
      })) || [];

      // Group B2CS data by state and GST rate
      const b2csGroups = b2csData?.reduce((acc, invoice) => {
        const key = `${invoice.customer?.state_code}-${invoice.gst_rate}`;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            stateCode: invoice.customer?.state_code,
            gstRate: invoice.gst_rate,
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: 0
          };
        }
        acc[key].taxableValue += invoice.total_taxable_value;
        acc[key].cgst += invoice.total_cgst;
        acc[key].sgst += invoice.total_sgst;
        acc[key].igst += invoice.total_igst;
        acc[key].total += invoice.grand_total;
        return acc;
      }, {});

      const b2cs = Object.values(b2csGroups || {});

      // Group HSN data
      const hsnGroups = hsnData?.reduce((acc, item) => {
        const key = item.product?.hsn_code;
        if (!acc[key]) {
          acc[key] = {
            id: key,
            hsnCode: item.product?.hsn_code,
            description: item.product?.name,
            quantity: 0,
            unit: item.unit,
            taxableValue: 0,
            gstRate: item.gst_rate,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: 0
          };
        }
        acc[key].quantity += item.quantity;
        acc[key].taxableValue += item.taxable_value;
        acc[key].cgst += item.cgst;
        acc[key].sgst += item.sgst;
        acc[key].igst += item.igst;
        acc[key].total += item.total;
        return acc;
      }, {});

      const hsn = Object.values(hsnGroups || {});

      // Calculate totals
      const totals = {
        b2b: b2b.reduce((sum, inv) => sum + inv.total, 0),
        b2cl: b2cl.reduce((sum, inv) => sum + inv.total, 0),
        b2cs: b2cs.reduce((sum, group) => sum + group.total, 0)
      };

      const counts = {
        b2b: b2b.length,
        b2cl: b2cl.length,
        b2cs: b2cs.length
      };

      const gst = {
        cgst: b2b.reduce((sum, inv) => sum + inv.cgst, 0) + 
              b2cs.reduce((sum, group) => sum + group.cgst, 0),
        sgst: b2b.reduce((sum, inv) => sum + inv.sgst, 0) + 
              b2cs.reduce((sum, group) => sum + group.sgst, 0),
        igst: b2cl.reduce((sum, inv) => sum + inv.igst, 0)
      };

      setData({
        b2b,
        b2cl,
        b2cs,
        hsn,
        totals,
        counts,
        gst
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching GST reports');
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
      setError(err instanceof Error ? err.message : 'An error occurred while fetching GST reports');
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
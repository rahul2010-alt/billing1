import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Customer, Product, Purchase, PurchaseItem, Supplier } from '../../types';
import { useAppContext } from '../context/AppContext';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAppContext();

  useEffect(() => {
    fetchCustomers();
    
    // Set up real-time subscription with error handling
    const subscription = supabase
      .channel('customers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        (payload) => {
          console.log('Customer change detected:', payload);
          fetchCustomers();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to customers changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error for customers');
        }
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        console.error('Error during cleanup of customers subscription:', err);
      }
    };
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Adding customer with data:', customer);
      
      // Map camelCase to snake_case for database insertion
      const customerData = {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        gstin: customer.gstin,
        type: customer.type,
        state: customer.state,
        state_code: customer.stateCode
      };
      
      console.log('Inserting customer data:', customerData);
      
      const { data, error } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;
      
      console.log('Customer added successfully:', data);
      await fetchCustomers();
      addNotification('Customer added successfully!');
      return data;
    } catch (err) {
      console.error('Error in addCustomer:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      addNotification('Error adding customer: ' + (err instanceof Error ? err.message : 'Unknown error'));
      throw err;
    }
  };

  return { customers, loading, error, addCustomer, refreshCustomers: fetchCustomers };
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAppContext();

  useEffect(() => {
    fetchProducts();
    
    // Set up real-time subscription with error handling
    const subscription = supabase
      .channel('products_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('Product change detected:', payload);
          fetchProducts();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to products changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error for products');
        }
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        console.error('Error during cleanup of products subscription:', err);
      }
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Map camelCase properties to snake_case for database insertion
      const productData = {
        name: product.name,
        hsn_code: product.hsnCode,
        batch_number: product.batchNumber,
        manufacturer: product.manufacturer,
        expiry_date: product.expiryDate,
        purchase_price: product.purchasePrice,
        selling_price: product.sellingPrice,
        gst_rate: product.gstRate,
        stock: product.stock,
        unit: product.unit,
        category: product.category,
        reorder_level: product.reorderLevel
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      await fetchProducts();
      addNotification('Product added successfully!');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addNotification('Error adding product: ' + (err instanceof Error ? err.message : 'Unknown error'));
      throw err;
    }
  };

  return { products, loading, error, addProduct, refreshProducts: fetchProducts };
};

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAppContext();

  useEffect(() => {
    fetchPurchases();
    
    // Set up real-time subscription with error handling
    const subscription = supabase
      .channel('purchases_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'purchases' },
        (payload) => {
          console.log('Purchase change detected:', payload);
          fetchPurchases();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to purchases changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error for purchases');
        }
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        console.error('Error during cleanup of purchases subscription:', err);
      }
    };
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('*, supplier:suppliers(name, gstin)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPurchases(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createPurchase = async (
    purchase: Omit<Purchase, 'id' | 'purchaseNumber' | 'createdAt' | 'updatedAt'>,
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
      taxableValue: number;
      gstRate: number;
      cgst: number;
      sgst: number;
      igst: number;
      total: number;
    }>
  ) => {
    try {
      // Map camelCase to snake_case for purchase
      const purchaseData = {
        date: purchase.date,
        supplier_id: purchase.supplierId,
        payment_status: purchase.paymentStatus,
        amount_paid: purchase.amountPaid,
        subtotal: purchase.subtotal,
        total_taxable_value: purchase.totalTaxableValue,
        total_cgst: purchase.totalCgst,
        total_sgst: purchase.totalSgst,
        total_igst: purchase.totalIgst,
        grand_total: purchase.grandTotal,
        notes: purchase.notes
      };

      const { data: newPurchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert([purchaseData])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // Map camelCase to snake_case for purchase items
      const itemsData = items.map(item => ({
        purchase_id: newPurchase.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        taxable_value: item.taxableValue,
        gst_rate: item.gstRate,
        cgst: item.cgst,
        sgst: item.sgst,
        igst: item.igst,
        total: item.total
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      await fetchPurchases();
      addNotification('Purchase created successfully!');
      return newPurchase;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addNotification('Error creating purchase: ' + (err instanceof Error ? err.message : 'Unknown error'));
      throw err;
    }
  };

  return { purchases, loading, error, createPurchase, refreshPurchases: fetchPurchases };
};

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useAppContext();

  useEffect(() => {
    fetchSuppliers();
    
    // Set up real-time subscription with error handling
    const subscription = supabase
      .channel('suppliers_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'suppliers' },
        (payload) => {
          console.log('Supplier change detected:', payload);
          fetchSuppliers();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to suppliers changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error for suppliers');
        }
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        console.error('Error during cleanup of suppliers subscription:', err);
      }
    };
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .insert([supplier])
        .select()
        .single();

      if (error) throw error;
      await fetchSuppliers();
      addNotification('Supplier added successfully!');
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addNotification('Error adding supplier: ' + (err instanceof Error ? err.message : 'Unknown error'));
      throw err;
    }
  };

  return { suppliers, loading, error, addSupplier, refreshSuppliers: fetchSuppliers };
};
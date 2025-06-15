import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  movementType: 'purchase' | 'sale' | 'adjustment';
  quantity: number;
  referenceType: string;
  referenceId: string;
  notes: string;
  createdAt: string;
}

export const useStockMovements = (productId?: string) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStockMovements();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('stock_movements_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'stock_movements' },
        (payload) => {
          console.log('Stock movement change detected:', payload);
          fetchStockMovements();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to stock movements changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime subscription error for stock movements');
        }
      });

    return () => {
      try {
        subscription.unsubscribe();
      } catch (err) {
        console.error('Error during cleanup of stock movements subscription:', err);
      }
    };
  }, [productId]);

  const fetchStockMovements = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(name)
        `)
        .order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data, error } = await query.limit(100);
      
      if (error) throw error;

      const formattedMovements = data?.map(movement => ({
        id: movement.id,
        productId: movement.product_id,
        productName: movement.product?.name || 'Unknown Product',
        movementType: movement.movement_type,
        quantity: movement.quantity,
        referenceType: movement.reference_type,
        referenceId: movement.reference_id,
        notes: movement.notes,
        createdAt: movement.created_at
      })) || [];

      setMovements(formattedMovements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getMovementsByProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .select(`
          *,
          product:products(name)
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const createStockAdjustment = async (productId: string, quantity: number, notes: string) => {
    try {
      // First, update the product stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock: supabase.raw(`stock + ${quantity}`),
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (updateError) throw updateError;

      // Then, create the stock movement record
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([{
          product_id: productId,
          movement_type: 'adjustment',
          quantity: quantity,
          reference_type: 'manual_adjustment',
          reference_id: null,
          notes: notes
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchStockMovements();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  return {
    movements,
    loading,
    error,
    fetchStockMovements,
    getMovementsByProduct,
    createStockAdjustment
  };
};
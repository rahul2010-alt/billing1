import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { useSuppliers, useProducts, usePurchases } from '../../utils/hooks/useSupabase';
import { useAppContext } from '../../utils/context/AppContext';

interface SimplePurchaseFormProps {
  onClose: () => void;
}

const SimplePurchaseForm: React.FC<SimplePurchaseFormProps> = ({ onClose }) => {
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const { createPurchase } = usePurchases();
  const { addNotification } = useAppContext();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
    notes: '',
  });

  const [items, setItems] = useState<Array<{
    id: string;
    productId: string;
    quantity: number;
    rate: number;
    amount: number;
  }>>([]);

  const [loading, setLoading] = useState(false);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        productId: '',
        quantity: 1,
        rate: 0,
        amount: 0
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Auto-fill rate when product is selected
        if (field === 'productId' && value) {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.rate = Number(product.purchasePrice) || 0;
          }
        }
        
        // Calculate amount
        updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.amount, 0);
  };

  const handleSave = async () => {
    if (!formData.supplierId || items.length === 0) {
      addNotification('Please select a supplier and add at least one item');
      return;
    }

    try {
      setLoading(true);
      const total = calculateTotal();

      const purchaseData = {
        date: formData.date,
        supplierId: formData.supplierId,
        paymentStatus: 'unpaid' as const,
        amountPaid: 0,
        notes: formData.notes,
        subtotal: total,
        totalTaxableValue: total,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,
        grandTotal: total
      };

      const purchaseItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.rate,
        taxableValue: item.amount,
        gstRate: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: item.amount
      }));

      await createPurchase(purchaseData, purchaseItems);
      addNotification('Purchase created successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving purchase:', error);
      addNotification('Error creating purchase: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">New Purchase</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <select
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            >
              <option value="">Select Supplier</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <button
              onClick={handleAddItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                        value={item.productId}
                        onChange={(e) => handleItemChange(item.id, 'productId', e.target.value)}
                      >
                        <option value="">Select Product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="1"
                        className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      No items added. Click "Add Item" to start.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes and Total */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any notes..."
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Total</h4>
            <div className="text-2xl font-bold text-teal-600">
              ₹{calculateTotal().toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
        <button
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading || !formData.supplierId || items.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Purchase
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SimplePurchaseForm;
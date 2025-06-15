import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { useSuppliers, useProducts, usePurchases } from '../../utils/hooks/useSupabase';
import { useAppContext } from '../../utils/context/AppContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';

interface PurchaseEntryFormProps {
  onClose: () => void;
}

const PurchaseEntryForm: React.FC<PurchaseEntryFormProps> = ({ onClose }) => {
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const { createPurchase } = usePurchases();
  const { addNotification } = useAppContext();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    supplierId: '',
    invoiceNo: '',
    notes: '',
  });

  const [items, setItems] = useState<Array<{
    id: string;
    productId: string;
    quantity: number;
    rate: number;
    discount: number;
    tax: number;
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
        discount: 0,
        tax: 0,
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
        
        // Auto-fill rate and tax when product is selected
        if (field === 'productId' && value) {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.rate = Number(product.purchasePrice) || 0;
            updatedItem.tax = Number(product.gstRate) || 0;
          }
        }
        
        // Calculate amount
        const baseAmount = updatedItem.quantity * updatedItem.rate;
        const discountAmount = baseAmount * (updatedItem.discount / 100);
        const afterDiscount = baseAmount - discountAmount;
        const taxAmount = afterDiscount * (updatedItem.tax / 100);
        updatedItem.amount = afterDiscount + taxAmount;
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    return items.reduce(
      (acc, item) => {
        const baseAmount = item.quantity * item.rate;
        const discountAmount = baseAmount * (item.discount / 100);
        const taxableValue = baseAmount - discountAmount;
        const taxAmount = taxableValue * (item.tax / 100);
        
        return {
          subtotal: acc.subtotal + baseAmount,
          totalTaxableValue: acc.totalTaxableValue + taxableValue,
          totalCgst: acc.totalCgst + (taxAmount / 2), // Half of GST for CGST
          totalSgst: acc.totalSgst + (taxAmount / 2), // Half of GST for SGST
          totalIgst: acc.totalIgst + 0, // Assuming intra-state
          grandTotal: acc.grandTotal + item.amount
        };
      },
      { subtotal: 0, totalTaxableValue: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, grandTotal: 0 }
    );
  };

  const handleSave = async () => {
    if (!formData.supplierId || items.length === 0) {
      addNotification('Please select a supplier and add at least one item');
      return;
    }

    try {
      setLoading(true);
      const totals = calculateTotals();

      const purchaseData = {
        date: formData.date,
        supplierId: formData.supplierId,
        paymentStatus: 'unpaid' as const,
        amountPaid: 0,
        notes: formData.notes,
        ...totals
      };

      const purchaseItems = items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.rate,
        taxableValue: item.quantity * item.rate * (1 - item.discount / 100),
        gstRate: item.tax,
        cgst: (item.quantity * item.rate * (1 - item.discount / 100) * item.tax / 100) / 2,
        sgst: (item.quantity * item.rate * (1 - item.discount / 100) * item.tax / 100) / 2,
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

  const totals = calculateTotals();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Purchase Entry</h2>
          <Button variant="outline" size="sm" icon={<X className="h-4 w-4" />} onClick={onClose}>
            Close
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="date"
                label="Date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
              
              <Select
                label="Supplier"
                value={formData.supplierId}
                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                options={[
                  { value: '', label: 'Select Supplier' },
                  ...suppliers.map(s => ({
                    value: s.id,
                    label: `${s.name} (${s.gstin})`
                  }))
                ]}
              />
              
              <Input
                type="text"
                label="Invoice No."
                value={formData.invoiceNo}
                onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                placeholder="Enter invoice number"
              />
            </div>

            {/* Items Section */}
            <div className="border rounded-lg">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Purchase Items</h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={handleAddItem}
                >
                  Add Item
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disc %</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tax %</th>
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
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                            value={item.discount}
                            onChange={(e) => handleItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
                            value={item.tax}
                            onChange={(e) => handleItemChange(item.id, 'tax', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-medium">
                          ₹{item.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            icon={<Trash2 className="h-4 w-4" />}
                            onClick={() => handleRemoveItem(item.id)}
                          />
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                          No items added. Click "Add Item" to start adding products.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  multiline
                  rows={4}
                  placeholder="Enter any additional notes..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Purchase Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxable Value:</span>
                    <span>₹{totals.totalTaxableValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CGST:</span>
                    <span>₹{totals.totalCgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SGST:</span>
                    <span>₹{totals.totalSgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <span>Grand Total:</span>
                    <span className="text-teal-600">₹{totals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={loading}
            disabled={loading || !formData.supplierId || items.length === 0}
          >
            Save Purchase
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseEntryForm;
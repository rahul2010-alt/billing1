import React, { useState } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { useSuppliers, useProducts, usePurchases } from '../../utils/hooks/useSupabase';
import { calculateGst } from '../../utils/calculations';
import { useAppContext } from '../../utils/context/AppContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface PurchaseFormProps {
  onCancel: () => void;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({ onCancel }) => {
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const { createPurchase } = usePurchases();
  const { addNotification } = useAppContext();

  const [formData, setFormData] = useState({
    date: new Date(),
    supplierId: '',
    paymentStatus: 'unpaid' as 'paid' | 'partial' | 'unpaid',
    amountPaid: 0,
    notes: '',
  });

  const [items, setItems] = useState<Array<{
    id: string;
    productId: string;
    quantity: number;
    price: number;
    gstRate: number;
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  }>>([]);

  const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
  const isInterState = selectedSupplier?.stateCode !== '27'; // Assuming 27 is your state code

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        productId: '',
        quantity: 1,
        price: 0,
        gstRate: 0,
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 0
      }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, changes: Partial<typeof items[0]>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...changes };
        const product = products.find(p => p.id === updatedItem.productId);
        
        if (product) {
          const taxableValue = updatedItem.quantity * updatedItem.price;
          const { cgst, sgst, igst } = calculateGst(taxableValue, Number(product.gstRate) || 0, isInterState);
          
          return {
            ...updatedItem,
            gstRate: Number(product.gstRate) || 0,
            taxableValue,
            cgst,
            sgst,
            igst,
            total: taxableValue + cgst + sgst + igst
          };
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    return items.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.quantity * item.price,
        totalTaxableValue: acc.totalTaxableValue + item.taxableValue,
        totalCgst: acc.totalCgst + item.cgst,
        totalSgst: acc.totalSgst + item.sgst,
        totalIgst: acc.totalIgst + item.igst,
        grandTotal: acc.grandTotal + item.total
      }),
      { subtotal: 0, totalTaxableValue: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, grandTotal: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!formData.supplierId || items.length === 0) return;

    const totals = calculateTotals();
    
    try {
      await createPurchase({
        date: formData.date.toISOString().split('T')[0],
        supplierId: formData.supplierId,
        paymentStatus: formData.paymentStatus,
        amountPaid: formData.amountPaid,
        notes: formData.notes,
        ...totals
      }, items);
      
      addNotification('Purchase created successfully!');
      onCancel();
    } catch (error) {
      console.error('Error creating purchase:', error);
      addNotification('Error creating purchase: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">New Purchase Entry</h3>
        <div className="flex space-x-2">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
            onClick={handleSubmit}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Purchase
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <DatePicker
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date: date || new Date() })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
            >
              <option value="">Select Supplier</option>
              {suppliers.map(supplier => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name} ({supplier.gstin})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Items</h4>
            <button
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-teal-700 bg-teal-100 hover:bg-teal-200"
              onClick={handleAddItem}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <select
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        value={item.productId}
                        onChange={(e) => {
                          const product = products.find(p => p.id === e.target.value);
                          if (product) {
                            handleItemChange(item.id, {
                              productId: product.id,
                              price: Number(product.purchasePrice) || 0,
                              gstRate: Number(product.gstRate) || 0
                            });
                          }
                        }}
                      >
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        min="1"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, { quantity: parseInt(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, { price: parseFloat(e.target.value) || 0 })}
                      />
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-gray-500">
                      {Number(item.gstRate) || 0}%
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      ₹{(Number(item.total) || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                      No items added to this purchase yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Details</label>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500">Payment Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                >
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {formData.paymentStatus !== 'unpaid' && (
                <div>
                  <label className="block text-sm text-gray-500">Amount Paid</label>
                  <input
                    type="number"
                    step="0.01"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm text-gray-500">Notes</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
            <div className="bg-gray-50 p-4 rounded-md space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium">₹{(Number(totals.subtotal) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxable Value:</span>
                <span className="font-medium">₹{(Number(totals.totalTaxableValue) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">CGST:</span>
                <span className="font-medium">₹{(Number(totals.totalCgst) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">SGST:</span>
                <span className="font-medium">₹{(Number(totals.totalSgst) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">IGST:</span>
                <span className="font-medium">₹{(Number(totals.totalIgst) || 0).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-base font-medium">
                <span className="text-gray-900">Grand Total:</span>
                <span className="text-teal-600">₹{(Number(totals.grandTotal) || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseForm;
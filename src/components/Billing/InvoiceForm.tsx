import React, { useState } from 'react';
import { X, Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { useCustomers, useProducts } from '../../utils/hooks/useSupabase';
import { useInvoices } from '../../utils/hooks/useInvoices';
import { Customer, InvoiceItem, Product } from '../../types';
import { calculateGst } from '../../utils/calculations';
import { useAppContext } from '../../utils/context/AppContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Table from '../UI/Table';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface InvoiceFormProps {
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onCancel }) => {
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { createInvoice } = useInvoices();
  const { addNotification } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    date: new Date(),
    customerId: '',
    paymentMode: 'cash' as 'cash' | 'card' | 'upi' | 'credit',
    paymentStatus: 'unpaid' as 'paid' | 'partial' | 'unpaid',
    amountPaid: 0,
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const isInterState = selectedCustomer?.stateCode !== '27'; // Assuming 27 is your state code

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        productId: '',
        productName: '',
        hsnCode: '',
        batchNumber: '',
        quantity: 1,
        unit: '',
        price: 0,
        discount: 0,
        taxableValue: 0,
        gstRate: 0,
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

  const handleItemChange = (id: string, changes: Partial<InvoiceItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...changes };
        const taxableValue = updatedItem.quantity * updatedItem.price * (1 - updatedItem.discount / 100);
        const { cgst, sgst, igst } = calculateGst(taxableValue, updatedItem.gstRate, isInterState);
        
        return {
          ...updatedItem,
          taxableValue,
          cgst,
          sgst,
          igst,
          total: taxableValue + cgst + sgst + igst
        };
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    return items.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.quantity * item.price,
        totalDiscount: acc.totalDiscount + (item.quantity * item.price * item.discount / 100),
        totalTaxableValue: acc.totalTaxableValue + item.taxableValue,
        totalCgst: acc.totalCgst + item.cgst,
        totalSgst: acc.totalSgst + item.sgst,
        totalIgst: acc.totalIgst + item.igst,
        grandTotal: acc.grandTotal + item.total
      }),
      { 
        subtotal: 0,
        totalDiscount: 0,
        totalTaxableValue: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,
        grandTotal: 0
      }
    );
  };

  const handleSubmit = async () => {
    if (!formData.customerId || items.length === 0) {
      setError('Please fill in all required fields and add at least one item');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const totals = calculateTotals();
      
      await createInvoice({
        date: formData.date.toISOString().split('T')[0],
        customerId: formData.customerId,
        paymentMode: formData.paymentMode,
        paymentStatus: formData.paymentStatus,
        amountPaid: formData.amountPaid,
        notes: formData.notes,
        ...totals
      }, items);
      
      addNotification('Invoice created successfully!');
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving the invoice');
      addNotification('Error creating invoice: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="mr-3 text-gray-500 hover:text-gray-700"
            onClick={onCancel}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="font-medium text-gray-900 text-lg">New Invoice</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            icon={<X className="h-4 w-4" />}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Save className="h-4 w-4" />}
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || items.length === 0 || !formData.customerId}
          >
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Select
              label="Customer"
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              options={[
                { value: '', label: 'Select a customer' },
                ...customers.map(customer => ({
                  value: customer.id,
                  label: `${customer.name} ${customer.gstin ? `(${customer.gstin})` : ''}`
                }))
              ]}
            />
          </div>

          <div>
            <Select
              label="Payment Mode"
              value={formData.paymentMode}
              onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value as any })}
              options={[
                { value: 'cash', label: 'Cash' },
                { value: 'card', label: 'Card' },
                { value: 'upi', label: 'UPI' },
                { value: 'credit', label: 'Credit' }
              ]}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-900">Items</h4>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table
              columns={[
                {
                  header: 'Product',
                  accessor: (item: InvoiceItem) => (
                    <Select
                      value={item.productId}
                      onChange={(e) => {
                        const product = products.find(p => p.id === e.target.value);
                        if (product) {
                          handleItemChange(item.id, {
                            productId: product.id,
                            productName: product.name,
                            hsnCode: product.hsnCode,
                            batchNumber: product.batchNumber,
                            unit: product.unit,
                            price: Number(product.sellingPrice) || 0,
                            gstRate: Number(product.gstRate) || 0
                          });
                        }
                      }}
                      options={[
                        { value: '', label: 'Select Product' },
                        ...products.map(product => ({
                          value: product.id,
                          label: product.name
                        }))
                      ]}
                    />
                  )
                },
                {
                  header: 'Quantity',
                  accessor: (item: InvoiceItem) => (
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, { quantity: parseInt(e.target.value) || 0 })}
                    />
                  )
                },
                {
                  header: 'Price',
                  accessor: (item: InvoiceItem) => (
                    <Input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, { price: parseFloat(e.target.value) || 0 })}
                    />
                  ),
                  align: 'right' as const
                },
                {
                  header: 'GST',
                  accessor: (item: InvoiceItem) => (
                    <div className="flex items-center">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.gstRate}
                        onChange={(e) => handleItemChange(item.id, { gstRate: parseFloat(e.target.value) || 0 })}
                        className="w-20"
                      />
                      <span className="ml-1 text-gray-500">%</span>
                    </div>
                  ),
                  align: 'right' as const
                },
                {
                  header: 'Discount %',
                  accessor: (item: InvoiceItem) => (
                    <Input
                      type="number"
                      step="0.01"
                      value={item.discount}
                      onChange={(e) => handleItemChange(item.id, { discount: parseFloat(e.target.value) || 0 })}
                    />
                  ),
                  align: 'right' as const
                },
                {
                  header: 'Total',
                  accessor: (item: InvoiceItem) => `₹${(Number(item.total) || 0).toFixed(2)}`,
                  align: 'right' as const
                },
                {
                  header: '',
                  accessor: (item: InvoiceItem) => (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => handleRemoveItem(item.id)}
                    />
                  ),
                  align: 'right' as const
                }
              ]}
              data={items}
              emptyMessage={
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No items added to this invoice yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Plus className="h-4 w-4" />}
                    onClick={handleAddItem}
                    className="mt-2"
                  >
                    Add Item
                  </Button>
                </div>
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Details</h4>
            <div className="space-y-4">
              <Select
                label="Payment Status"
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                options={[
                  { value: 'paid', label: 'Paid' },
                  { value: 'partial', label: 'Partial' },
                  { value: 'unpaid', label: 'Unpaid' }
                ]}
              />

              {formData.paymentStatus !== 'unpaid' && (
                <Input
                  type="number"
                  label="Amount Paid"
                  value={formData.amountPaid}
                  onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                />
              )}

              <div>
                <label className="block text-sm text-gray-500">Notes</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Summary</h4>
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span className="font-medium">₹{(Number(totals.subtotal) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount:</span>
                <span className="font-medium">₹{(Number(totals.totalDiscount) || 0).toFixed(2)}</span>
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

export default InvoiceForm;
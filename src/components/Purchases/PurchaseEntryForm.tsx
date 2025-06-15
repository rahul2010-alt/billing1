import React, { useState } from 'react';
import { RefreshCw, Edit, Printer, Save, X, HelpCircle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import Select from '../UI/Select';
import Input from '../UI/Input';
import Button from '../UI/Button';
import Table from '../UI/Table';
import { useSuppliers, useProducts, usePurchases } from '../../utils/hooks/useSupabase';
import { calculateGst } from '../../utils/calculations';
import "react-datepicker/dist/react-datepicker.css";

interface PurchaseEntryFormProps {
  onClose: () => void;
}

const PurchaseEntryForm: React.FC<PurchaseEntryFormProps> = ({ onClose }) => {
  const { suppliers } = useSuppliers();
  const { products } = useProducts();
  const { createPurchase } = usePurchases();

  const [formData, setFormData] = useState({
    date: new Date(),
    seriesNo: '',
    invoiceNo: '',
    supplier: '',
    cashDiscount: 0,
    salesManager: '',
  });

  const [items, setItems] = useState<Array<{
    id: string;
    productId: string;
    productName: string;
    batchNo: string;
    expiryDate: Date | null;
    quantity: number;
    scheme: number;
    rate: number;
    mrp: number;
    discount: number;
    tax: number;
    packing: number;
    amount: number;
  }>>([]);

  const [activeTab, setActiveTab] = useState<
    'details' | 'discDetails' | 'vatBreakup' | 'outstanding' | 'prodHistory' | 'gst' | 'dosInvoice'
  >('details');

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        productId: '',
        productName: '',
        batchNo: '',
        expiryDate: null,
        quantity: 0,
        scheme: 0,
        rate: 0,
        mrp: 0,
        discount: 0,
        tax: 0,
        packing: 0,
        amount: 0
      }
    ]);
  };

  const handleItemChange = (id: string, changes: Partial<typeof items[0]>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...changes };
        
        // Calculate amount based on quantity, rate, discount, tax and packing
        const baseAmount = updatedItem.quantity * updatedItem.rate;
        const discountAmount = baseAmount * (updatedItem.discount / 100);
        const afterDiscount = baseAmount - discountAmount;
        const taxAmount = afterDiscount * (updatedItem.tax / 100);
        const totalAmount = afterDiscount + taxAmount + (updatedItem.packing || 0);
        
        return {
          ...updatedItem,
          amount: totalAmount
        };
      }
      return item;
    }));
  };

  const handleSave = async () => {
    if (!formData.supplier || items.length === 0) return;

    try {
      const totals = items.reduce(
        (acc, item) => ({
          subtotal: acc.subtotal + item.amount,
          totalTaxableValue: acc.totalTaxableValue + (item.amount / (1 + item.tax / 100)),
          totalTax: acc.totalTax + (item.amount * item.tax / (100 + item.tax))
        }),
        { subtotal: 0, totalTaxableValue: 0, totalTax: 0 }
      );

      await createPurchase({
        date: formData.date.toISOString().split('T')[0],
        supplierId: formData.supplier,
        invoiceNumber: formData.invoiceNo,
        paymentStatus: 'unpaid',
        amountPaid: 0,
        ...totals,
        grandTotal: totals.subtotal
      }, items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.rate,
        taxableValue: item.amount / (1 + item.tax / 100),
        gstRate: item.tax,
        total: item.amount
      })));

      onClose();
    } catch (error) {
      console.error('Error saving purchase:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Purchase Entry</h2>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" icon={<Edit className="h-4 w-4" />}>
              Edit
            </Button>
            <Button variant="outline" size="sm" icon={<Printer className="h-4 w-4" />}>
              Print
            </Button>
            <Button variant="outline" size="sm" icon={<HelpCircle className="h-4 w-4" />}>
              Help
            </Button>
            <Button variant="outline" size="sm" icon={<X className="h-4 w-4" />} onClick={onClose}>
              Close
            </Button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="space-y-6">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === 'details' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('details')}
              >
                A/c Details
              </Button>
              <Button
                variant={activeTab === 'discDetails' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('discDetails')}
              >
                Disc. Details
              </Button>
              <Button
                variant={activeTab === 'vatBreakup' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('vatBreakup')}
              >
                VAT Breakup
              </Button>
              <Button
                variant={activeTab === 'outstanding' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('outstanding')}
              >
                Outstanding
              </Button>
              <Button
                variant={activeTab === 'prodHistory' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('prodHistory')}
              >
                Prod.History
              </Button>
              <Button
                variant={activeTab === 'gst' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('gst')}
              >
                GST
              </Button>
              <Button
                variant={activeTab === 'dosInvoice' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('dosInvoice')}
              >
                DOS Invoice
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <Input
                  type="date"
                  label="Date"
                  value={formData.date.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Series No."
                  value={formData.seriesNo}
                  onChange={(e) => setFormData({ ...formData, seriesNo: e.target.value })}
                />
              </div>
              <div>
                <Input
                  type="text"
                  label="Invoice No."
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Select
                label="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                options={[
                  { value: '', label: 'Select Supplier' },
                  ...suppliers.map(s => ({
                    value: s.id,
                    label: `${s.name} (${s.gstin})`
                  }))
                ]}
              />
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">***GST BILL***</h3>
              </div>
              
              <Table
                columns={[
                  {
                    header: 'Item Name',
                    accessor: (item: any) => (
                      <Select
                        value={item.productId}
                        onChange={(e) => {
                          const product = products.find(p => p.id === e.target.value);
                          if (product) {
                            handleItemChange(item.id, {
                              productId: product.id,
                              productName: product.name,
                              rate: Number(product.purchasePrice) || 0,
                              tax: Number(product.gstRate) || 0
                            });
                          }
                        }}
                        options={[
                          { value: '', label: 'Select Product' },
                          ...products.map(p => ({
                            value: p.id,
                            label: p.name
                          }))
                        ]}
                      />
                    )
                  },
                  {
                    header: 'Batch No.',
                    accessor: (item: any) => (
                      <Input
                        type="text"
                        value={item.batchNo}
                        onChange={(e) => handleItemChange(item.id, { batchNo: e.target.value })}
                      />
                    )
                  },
                  {
                    header: 'Expiry',
                    accessor: (item: any) => (
                      <DatePicker
                        selected={item.expiryDate}
                        onChange={(date) => handleItemChange(item.id, { expiryDate: date })}
                        dateFormat="MM/yyyy"
                        showMonthYearPicker
                        className="w-full rounded-md border-gray-300"
                      />
                    )
                  },
                  {
                    header: 'Quantity',
                    accessor: (item: any) => (
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, { quantity: parseInt(e.target.value) || 0 })}
                      />
                    )
                  },
                  {
                    header: 'Scheme',
                    accessor: (item: any) => (
                      <Input
                        type="number"
                        value={item.scheme}
                        onChange={(e) => handleItemChange(item.id, { scheme: parseInt(e.target.value) || 0 })}
                      />
                    )
                  },
                  {
                    header: 'Rate',
                    accessor: (item: any) => (
                      <Input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, { rate: parseFloat(e.target.value) || 0 })}
                      />
                    )
                  },
                  {
                    header: 'MRP',
                    accessor: (item: any) => (
                      <Input
                        type="number"
                        value={item.mrp}
                        onChange={(e) => handleItemChange(item.id, { mrp: parseFloat(e.target.value) || 0 })}
                      />
                    )
                  },
                  {
                    header: 'Disc %',
                    accessor: (item: any) => (
                      <Input
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleItemChange(item.id, { discount: parseFloat(e.target.value) || 0 })}
                      />
                    )
                  },
                  {
                    header: 'Tax %',
                    accessor: (item: any) => (
                      <Input
                        type="number"
                        value={item.tax}
                        onChange={(e) => handleItemChange(item.id, { tax: parseFloat(e.target.value) || 0 })}
                      />
                    )
                  },
                  {
                    header: 'Packing',
                    accessor: (item: any) => (
                      <Input
                        type="number"
                        value={item.packing}
                        onChange={(e) => handleItemChange(item.id, { packing: parseFloat(e.target.value) || 0 })}
                      />
                    )
                  },
                  {
                    header: 'Amount',
                    accessor: (item: any) => `₹${(Number(item.amount) || 0).toFixed(2)}`,
                    align: 'right' as const
                  }
                ]}
                data={items}
                emptyMessage="No items added"
              />

              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                >
                  Add Item
                </Button>
              </div>
            </div>

            <div className="flex justify-between">
              <div className="w-1/3">
                <Input
                  type="text"
                  label="Sales Manager"
                  value={formData.salesManager}
                  onChange={(e) => setFormData({ ...formData, salesManager: e.target.value })}
                />
              </div>

              <div className="w-1/3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Amount:</span>
                  <span className="font-medium">₹{items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Tax:</span>
                  <span className="font-medium">₹{items.reduce((sum, item) => {
                    const baseAmount = (Number(item.quantity) || 0) * (Number(item.rate) || 0);
                    const discountAmount = baseAmount * ((Number(item.discount) || 0) / 100);
                    const afterDiscount = baseAmount - discountAmount;
                    return sum + (afterDiscount * ((Number(item.tax) || 0) / 100));
                  }, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Net Amount:</span>
                  <span>₹{items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<Save className="h-4 w-4" />}
                onClick={handleSave}
                disabled={!formData.supplier || items.length === 0}
              >
                Save Purchase
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseEntryForm;
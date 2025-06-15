import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Eye, Edit } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Table from '../UI/Table';
import PurchaseEntryForm from './PurchaseEntryForm';
import { usePurchases } from '../../utils/hooks/useSupabase';
import { format } from 'date-fns';

const PurchasePage: React.FC = () => {
  const [showPurchaseEntry, setShowPurchaseEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { purchases, loading } = usePurchases();

  const filteredPurchases = searchQuery
    ? purchases.filter(purchase =>
        purchase.purchase_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.supplier?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : purchases;

  const columns = [
    {
      header: 'Purchase #',
      accessor: 'purchase_number',
      align: 'left' as const,
    },
    {
      header: 'Date',
      accessor: (purchase: any) => format(new Date(purchase.date), 'dd/MM/yyyy'),
      align: 'left' as const,
    },
    {
      header: 'Supplier',
      accessor: (purchase: any) => (
        <div>
          <div className="font-medium">{purchase.supplier?.name || 'Unknown Supplier'}</div>
          {purchase.supplier?.gstin && (
            <div className="text-xs text-gray-500">GSTIN: {purchase.supplier.gstin}</div>
          )}
        </div>
      ),
      align: 'left' as const,
    },
    {
      header: 'Amount',
      accessor: (purchase: any) => (
        <div className="text-right">
          <div className="font-medium">₹{purchase.grand_total.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            Paid: ₹{purchase.amount_paid.toLocaleString()}
          </div>
        </div>
      ),
      align: 'right' as const,
    },
    {
      header: 'Status',
      accessor: (purchase: any) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          purchase.payment_status === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : purchase.payment_status === 'partial'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {purchase.payment_status.charAt(0).toUpperCase() + purchase.payment_status.slice(1)}
        </span>
      ),
      align: 'center' as const,
    },
    {
      header: 'Actions',
      accessor: (purchase: any) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => {/* Handle view */}}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Edit className="h-4 w-4" />}
            onClick={() => {/* Handle edit */}}
          >
            Edit
          </Button>
        </div>
      ),
      align: 'right' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase Management</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage purchase orders
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setShowPurchaseEntry(true)}
        >
          New Purchase
        </Button>
      </div>

      {showPurchaseEntry ? (
        <PurchaseEntryForm onClose={() => setShowPurchaseEntry(false)} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Input
              type="text"
              placeholder="Search purchases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              className="w-full md:w-64"
            />
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Filter className="h-4 w-4" />}
              >
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="h-4 w-4" />}
              >
                Export
              </Button>
            </div>
          </div>
          
          <Card>
            <Table
              columns={columns}
              data={filteredPurchases}
              loading={loading}
              emptyMessage="No purchases found"
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default PurchasePage;
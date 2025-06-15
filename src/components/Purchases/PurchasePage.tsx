import React, { useState } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import PurchaseEntryForm from './PurchaseEntryForm';
import { usePurchases } from '../../utils/hooks/useSupabase';

const PurchasePage: React.FC = () => {
  const [showPurchaseEntry, setShowPurchaseEntry] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { purchases, loading } = usePurchases();

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
            {/* Existing purchase list table */}
          </Card>
        </>
      )}
    </div>
  );
};

export default PurchasePage;
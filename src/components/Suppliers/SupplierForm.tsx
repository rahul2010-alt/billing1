import React, { useState } from 'react';
import { Supplier } from '../../types';
import { useSuppliers } from '../../utils/hooks/useSupabase';
import { useAppContext } from '../../utils/context/AppContext';

interface SupplierFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: Supplier;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { addNotification } = useAppContext();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    gstin: initialData?.gstin || '',
    state: initialData?.state || '',
    stateCode: initialData?.stateCode || ''
  });

  const { addSupplier } = useSuppliers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addSupplier(formData);
      addNotification('Supplier added successfully!');
      onSubmit();
    } catch (error) {
      console.error('Error adding supplier:', error);
      addNotification('Error adding supplier: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">GSTIN</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">State</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.state}
            onChange={(e) => {
              const stateCode = e.target.selectedOptions[0].getAttribute('data-code') || '';
              setFormData({ ...formData, state: e.target.value, stateCode });
            }}
          >
            <option value="">Select State</option>
            <option value="Maharashtra" data-code="27">Maharashtra</option>
            <option value="Gujarat" data-code="24">Gujarat</option>
            <option value="Karnataka" data-code="29">Karnataka</option>
            {/* Add more states as needed */}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
        >
          Save Supplier
        </button>
      </div>
    </form>
  );
};

export default SupplierForm;
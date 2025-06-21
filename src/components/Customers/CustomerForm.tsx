import React, { useState } from 'react';
import { useCustomers } from '../../utils/hooks/useSupabase';
import { useAppContext } from '../../utils/context/AppContext';
import Button from '../UI/Button';
import Input from '../UI/Input';

interface CustomerFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: any;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { addNotification } = useAppContext();
  const { addCustomer } = useCustomers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    gstin: initialData?.gstin || '',
    type: initialData?.type || 'B2C',
    state: initialData?.state || 'Maharashtra',
    stateCode: initialData?.stateCode || '27'
  });

  const states = [
    { name: 'Maharashtra', code: '27' },
    { name: 'Gujarat', code: '24' },
    { name: 'Karnataka', code: '29' },
    { name: 'Tamil Nadu', code: '33' },
    { name: 'Delhi', code: '07' },
    { name: 'Uttar Pradesh', code: '09' },
    { name: 'West Bengal', code: '19' },
    { name: 'Rajasthan', code: '08' },
    { name: 'Bihar', code: '10' },
    { name: 'Andhra Pradesh', code: '37' },
    { name: 'Punjab', code: '03' },
    { name: 'Haryana', code: '06' },
    { name: 'Madhya Pradesh', code: '23' },
    { name: 'Kerala', code: '32' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Basic validation
      if (!formData.name.trim()) {
        throw new Error('Customer name is required');
      }

      if (!formData.state || !formData.stateCode) {
        throw new Error('Please select a state');
      }

      if (formData.type === 'B2B' && !formData.gstin.trim()) {
        throw new Error('GSTIN is required for B2B customers');
      }

      // Prepare data for submission - convert empty strings to null
      const customerData = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        address: formData.address.trim() || null,
        gstin: formData.gstin.trim() || null,
        type: formData.type,
        state: formData.state,
        stateCode: formData.stateCode
      };

      console.log('Submitting customer data:', customerData);

      await addCustomer(customerData);
      addNotification('Customer added successfully!');
      onSubmit();
    } catch (err) {
      console.error('Error adding customer:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding the customer';
      setError(errorMessage);
      addNotification('Error adding customer: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = states.find(s => s.name === e.target.value);
    setFormData({
      ...formData,
      state: e.target.value,
      stateCode: selectedState?.code || ''
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Customer Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter customer name"
          />

          <Input
            type="tel"
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
          />

          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Type *
            </label>
            <select
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="B2C">B2C (Business to Consumer)</option>
              <option value="B2B">B2B (Business to Business)</option>
              <option value="B2CL">B2CL (B2C Large)</option>
            </select>
          </div>

          {(formData.type === 'B2B' || formData.type === 'B2CL') && (
            <Input
              label={`GSTIN ${formData.type === 'B2B' ? '*' : ''}`}
              value={formData.gstin}
              onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
              required={formData.type === 'B2B'}
              placeholder="Enter GSTIN"
            />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <select
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={formData.state}
              onChange={handleStateChange}
              required
            >
              {states.map(state => (
                <option key={state.code} value={state.name}>
                  {state.name} ({state.code})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              multiline
              rows={3}
              placeholder="Enter complete address"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Customer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
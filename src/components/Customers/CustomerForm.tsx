import React, { useState } from 'react';
import { Customer } from '../../types';
import { useCustomers } from '../../utils/hooks/useSupabase';
import { useAppContext } from '../../utils/context/AppContext';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';

interface CustomerFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: Customer;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { addNotification } = useAppContext();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    gstin: initialData?.gstin || '',
    type: initialData?.type || 'B2C',
    state: initialData?.state || '',
    stateCode: initialData?.stateCode || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addCustomer } = useCustomers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name) {
        throw new Error('Customer name is required');
      }

      if (!formData.state || !formData.stateCode) {
        throw new Error('Please select a state');
      }

      if (formData.type === 'B2B' && !formData.gstin) {
        throw new Error('GSTIN is required for B2B customers');
      }

      await addCustomer(formData);
      addNotification('Customer added successfully!');
      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the customer');
      addNotification('Error adding customer: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const states = [
    { value: 'Maharashtra', code: '27' },
    { value: 'Gujarat', code: '24' },
    { value: 'Karnataka', code: '29' },
    { value: 'Tamil Nadu', code: '33' },
    { value: 'Delhi', code: '07' },
    { value: 'Uttar Pradesh', code: '09' },
    { value: 'West Bengal', code: '19' },
    { value: 'Rajasthan', code: '08' },
    { value: 'Bihar', code: '10' },
    { value: 'Andhra Pradesh', code: '37' },
    { value: 'Punjab', code: '03' },
    { value: 'Haryana', code: '06' },
    { value: 'Madhya Pradesh', code: '23' },
    { value: 'Kerala', code: '32' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Customer Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          error={!formData.name ? 'Customer name is required' : ''}
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

        <Select
          label="Customer Type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as Customer['type'] })}
          options={[
            { value: 'B2C', label: 'B2C (Business to Consumer)' },
            { value: 'B2B', label: 'B2B (Business to Business)' },
            { value: 'B2CL', label: 'B2CL (B2C Large)' }
          ]}
          required
        />

        {(formData.type === 'B2B' || formData.type === 'B2CL') && (
          <Input
            label="GSTIN"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            required={formData.type === 'B2B'}
            error={formData.type === 'B2B' && !formData.gstin ? 'GSTIN is required for B2B customers' : ''}
            placeholder="Enter GSTIN"
          />
        )}

        <Select
          label="State"
          value={formData.state}
          onChange={(e) => {
            const state = states.find(s => s.value === e.target.value);
            setFormData({
              ...formData,
              state: e.target.value,
              stateCode: state?.code || ''
            });
          }}
          options={[
            { value: '', label: 'Select State' },
            ...states.map(state => ({
              value: state.value,
              label: `${state.value} (${state.code})`
            }))
          ]}
          required
          error={!formData.state ? 'Please select a state' : ''}
        />

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

      <div className="flex justify-end space-x-3">
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
          Save Customer
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
import React, { useState } from 'react';
import { Save, Printer, Settings as SettingsIcon } from 'lucide-react';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';

interface PrintSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    storeName: string;
    address: string;
    phone: string;
    email: string;
    gstin: string;
    dlNumber: string;
    stateCode: string;
    showLogo: boolean;
    showSignature: boolean;
    termsAndConditions: string;
  };
  onSave: (settings: any) => void;
}

const PrintSettings: React.FC<PrintSettingsProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [formData, setFormData] = useState(settings);

  const handleSave = () => {
    // Prevent any form submission that might cause reload
    event?.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Print Settings" size="lg">
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Store Name"
            value={formData.storeName}
            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
            placeholder="Medical & General Store"
          />
          
          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="1300-999-9999"
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="info@medicalstore.com"
          />
          
          <Input
            label="GSTIN"
            value={formData.gstin}
            onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
            placeholder="INPUT HERE"
          />
          
          <Input
            label="Drug License Number"
            value={formData.dlNumber}
            onChange={(e) => setFormData({ ...formData, dlNumber: e.target.value })}
            placeholder="136/99/20XX"
          />
          
          <Input
            label="State Code"
            value={formData.stateCode}
            onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
            placeholder="27"
          />
        </div>

        <div>
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            multiline
            rows={3}
            placeholder="G - 19, 109-110, Address Here, Address Here, Address Here, City. Phone: 1300-999-9999"
          />
        </div>

        <div>
          <Input
            label="Terms & Conditions"
            value={formData.termsAndConditions}
            onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
            multiline
            rows={4}
            placeholder="All disputes subject to CITY Jurisdiction only. Medicines without Batch No. & Exp. will not be taken back. Please consult Dr. before using the medicines. E. & O.E."
          />
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Display Options</h4>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showLogo}
                onChange={(e) => setFormData({ ...formData, showLogo: e.target.checked })}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show Logo</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.showSignature}
                onChange={(e) => setFormData({ ...formData, showSignature: e.target.checked })}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">Show Signature Line</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={<Save className="h-4 w-4" />} type="submit">
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default PrintSettings;
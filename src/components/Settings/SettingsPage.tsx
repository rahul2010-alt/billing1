import React, { useState } from 'react';
import { Save, Building2, User, Bell, Shield, Database, Printer } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';

const SettingsPage: React.FC = () => {
  const [businessSettings, setBusinessSettings] = useState({
    businessName: 'M R Medical & General Store',
    address: '',
    phone: '',
    email: '',
    gstin: '',
    dlNumber: '',
    state: 'Maharashtra',
    stateCode: '27'
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    invoicePrefix: 'INV',
    nextInvoiceNumber: 1,
    termsAndConditions: '',
    showLogo: true,
    showSignature: true
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: '30'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lowStockAlerts: true,
    expiryAlerts: true,
    paymentReminders: true,
    emailNotifications: true
  });

  const handleSaveSettings = () => {
    // Implement settings save logic
    console.log('Saving settings...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your application settings
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Save className="h-4 w-4" />}
          onClick={handleSaveSettings}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Building2 className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Business Name"
                value={businessSettings.businessName}
                onChange={(e) => setBusinessSettings({ ...businessSettings, businessName: e.target.value })}
              />
              <Input
                label="Phone Number"
                value={businessSettings.phone}
                onChange={(e) => setBusinessSettings({ ...businessSettings, phone: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                value={businessSettings.email}
                onChange={(e) => setBusinessSettings({ ...businessSettings, email: e.target.value })}
              />
              <Input
                label="GSTIN"
                value={businessSettings.gstin}
                onChange={(e) => setBusinessSettings({ ...businessSettings, gstin: e.target.value })}
              />
              <Input
                label="Drug License Number"
                value={businessSettings.dlNumber}
                onChange={(e) => setBusinessSettings({ ...businessSettings, dlNumber: e.target.value })}
              />
              <Select
                label="State"
                value={businessSettings.state}
                onChange={(e) => {
                  const stateCode = e.target.selectedOptions[0].getAttribute('data-code') || '';
                  setBusinessSettings({ ...businessSettings, state: e.target.value, stateCode });
                }}
                options={[
                  { value: 'Maharashtra', label: 'Maharashtra' },
                  { value: 'Gujarat', label: 'Gujarat' },
                  { value: 'Karnataka', label: 'Karnataka' }
                ]}
              />
              <div className="md:col-span-2">
                <Input
                  label="Business Address"
                  value={businessSettings.address}
                  onChange={(e) => setBusinessSettings({ ...businessSettings, address: e.target.value })}
                  multiline
                  rows={3}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Printer className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Invoice Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Invoice Prefix"
                value={invoiceSettings.invoicePrefix}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
              />
              <Input
                label="Next Invoice Number"
                type="number"
                value={invoiceSettings.nextInvoiceNumber}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, nextInvoiceNumber: parseInt(e.target.value) })}
              />
              <div className="md:col-span-2">
                <Input
                  label="Terms and Conditions"
                  value={invoiceSettings.termsAndConditions}
                  onChange={(e) => setInvoiceSettings({ ...invoiceSettings, termsAndConditions: e.target.value })}
                  multiline
                  rows={4}
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    checked={invoiceSettings.showLogo}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, showLogo: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Logo on Invoice</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    checked={invoiceSettings.showSignature}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, showSignature: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700">Show Signature</span>
                </label>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Database className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Backup Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    checked={backupSettings.autoBackup}
                    onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable Automatic Backups</span>
                </label>
              </div>
              <Select
                label="Backup Frequency"
                value={backupSettings.backupFrequency}
                onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'monthly', label: 'Monthly' }
                ]}
              />
              <Select
                label="Retention Period"
                value={backupSettings.retentionPeriod}
                onChange={(e) => setBackupSettings({ ...backupSettings, retentionPeriod: e.target.value })}
                options={[
                  { value: '7', label: '7 Days' },
                  { value: '30', label: '30 Days' },
                  { value: '90', label: '90 Days' },
                  { value: '365', label: '1 Year' }
                ]}
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
            </div>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  checked={notificationSettings.lowStockAlerts}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, lowStockAlerts: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Low Stock Alerts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  checked={notificationSettings.expiryAlerts}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, expiryAlerts: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Product Expiry Alerts</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  checked={notificationSettings.paymentReminders}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, paymentReminders: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Payment Due Reminders</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Email Notifications</span>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
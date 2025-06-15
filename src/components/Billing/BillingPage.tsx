import React, { useState, useRef } from 'react';
import { Search, PlusCircle, Printer, Download, Eye, Edit, Settings as SettingsIcon } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Card from '../UI/Card';
import Table from '../UI/Table';
import Button from '../UI/Button';
import Input from '../UI/Input';
import InvoiceForm from './InvoiceForm';
import InvoicePrint from './InvoicePrint';
import PrintSettings from './PrintSettings';
import { useInvoices } from '../../utils/hooks/useInvoices';
import { format } from 'date-fns';

const BillingPage: React.FC = () => {
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showPrintSettings, setShowPrintSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { invoices, loading, getInvoiceById } = useInvoices();
  const printRef = useRef<HTMLDivElement>(null);
  
  const [printSettings, setPrintSettings] = useState({
    storeName: 'Medical & General Store',
    address: 'G - 19, 109-110, Address Here, Address Here, Address Here, City. Phone: 1300-999-9999',
    phone: '1300-999-9999',
    email: 'info@medicalstore.com',
    gstin: 'INPUT HERE',
    dlNumber: '136/99/20XX',
    stateCode: '27',
    showLogo: true,
    showSignature: true,
    termsAndConditions: 'All disputes subject to CITY Jurisdiction only. Medicines without Batch No. & Exp. will not be taken back. Please consult Dr. before using the medicines. E. & O.E.'
  });
  
  const filteredInvoices = searchQuery 
    ? invoices.filter(invoice => 
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        invoice.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : invoices;

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${selectedInvoice?.invoice_number}`,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        // Small delay to ensure content is ready
        setTimeout(resolve, 100);
      });
    },
    onAfterPrint: () => {
      // Prevent any default behavior that might cause reload
      console.log('Print completed');
    },
    removeAfterPrint: true,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          color-adjust: exact;
        }
        .print-break {
          page-break-after: always;
        }
      }
    `
  });

  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const invoice = await getInvoiceById(invoiceId);
      setSelectedInvoice(invoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    }
  };

  const handlePrintInvoice = async (invoiceId: string) => {
    try {
      await handleViewInvoice(invoiceId);
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (printRef.current && selectedInvoice) {
            handlePrint();
          }
        }, 200);
      });
    } catch (error) {
      console.error('Error printing invoice:', error);
    }
  };

  const columns = [
    {
      header: 'Invoice #',
      accessor: 'invoice_number',
      align: 'left' as const,
    },
    {
      header: 'Date',
      accessor: (invoice: any) => format(new Date(invoice.date), 'dd/MM/yyyy'),
      align: 'left' as const,
    },
    {
      header: 'Customer',
      accessor: (invoice: any) => (
        <div>
          <div className="font-medium">{invoice.customer?.name || 'Walk-in Customer'}</div>
          {invoice.customer?.gstin && (
            <div className="text-xs text-gray-500">GSTIN: {invoice.customer.gstin}</div>
          )}
        </div>
      ),
      align: 'left' as const,
    },
    {
      header: 'Amount',
      accessor: (invoice: any) => (
        <div className="text-right">
          <div className="font-medium">₹{invoice.grand_total.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            Paid: ₹{invoice.amount_paid.toLocaleString()}
          </div>
        </div>
      ),
      align: 'right' as const,
    },
    {
      header: 'Status',
      accessor: (invoice: any) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          invoice.payment_status === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : invoice.payment_status === 'partial'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {invoice.payment_status.charAt(0).toUpperCase() + invoice.payment_status.slice(1)}
        </span>
      ),
      align: 'center' as const,
    },
    {
      header: 'Actions',
      accessor: (invoice: any) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => handleViewInvoice(invoice.id)}
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
          <Button
            variant="outline"
            size="sm"
            icon={<Printer className="h-4 w-4" />}
            onClick={() => handlePrintInvoice(invoice.id)}
          >
            Print
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
          <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage customer invoices
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<SettingsIcon className="h-4 w-4" />}
            onClick={() => setShowPrintSettings(true)}
          >
            Print Settings
          </Button>
          <Button
            variant="primary"
            icon={<PlusCircle className="h-4 w-4" />}
            onClick={() => setShowNewInvoice(true)}
          >
            New Invoice
          </Button>
        </div>
      </div>
      
      {showNewInvoice ? (
        <InvoiceForm onCancel={() => setShowNewInvoice(false)} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <Input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4 text-gray-400" />}
              className="w-full md:w-64"
            />
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Printer className="h-4 w-4" />}
              >
                Print All
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
              data={filteredInvoices}
              loading={loading}
              emptyMessage="No invoices found"
            />
          </Card>
        </>
      )}

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        {selectedInvoice && (
          <InvoicePrint
            ref={printRef}
            invoice={selectedInvoice}
            settings={printSettings}
          />
        )}
      </div>

      {/* Print Settings Modal */}
      <PrintSettings
        isOpen={showPrintSettings}
        onClose={() => setShowPrintSettings(false)}
        settings={printSettings}
        onSave={setPrintSettings}
      />
    </div>
  );
};

export default BillingPage;
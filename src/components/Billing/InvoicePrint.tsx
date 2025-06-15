import React, { forwardRef } from 'react';
import { format } from 'date-fns';

interface InvoicePrintProps {
  invoice: any;
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
}

const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(({ invoice, settings }, ref) => {
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  // Prevent any event bubbling that might cause issues
  const handlePrintClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div 
      ref={ref} 
      className="bg-white p-6 text-black" 
      style={{ width: '80mm', fontSize: '12px', fontFamily: 'monospace' }}
      onClick={handlePrintClick}
    >
      {/* Header */}
      <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
        {settings.showLogo && (
          <div className="mb-2">
            <div className="w-16 h-16 bg-teal-600 rounded-full mx-auto flex items-center justify-center text-white font-bold text-lg">
              MR
            </div>
          </div>
        )}
        <h1 className="text-lg font-bold uppercase">{settings.storeName}</h1>
        <p className="text-xs mt-1">{settings.address}</p>
        <p className="text-xs">Ph: {settings.phone}</p>
        {settings.email && <p className="text-xs">Email: {settings.email}</p>}
        <div className="mt-2 text-xs">
          <p>GSTIN: {settings.gstin}</p>
          <p>DL No: {settings.dlNumber}</p>
          <p>State Code: {settings.stateCode}</p>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
        <div className="flex justify-between text-xs">
          <span>Invoice: {invoice.invoice_number}</span>
          <span>Date: {format(new Date(invoice.date), 'dd/MM/yyyy')}</span>
        </div>
        <div className="mt-1 text-xs">
          <p>Customer: {invoice.customer?.name || 'Walk-in Customer'}</p>
          {invoice.customer?.gstin && <p>GSTIN: {invoice.customer.gstin}</p>}
          {invoice.customer?.phone && <p>Phone: {invoice.customer.phone}</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="text-left py-1">Item</th>
              <th className="text-center py-1">Qty</th>
              <th className="text-right py-1">Rate</th>
              <th className="text-right py-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-1">
                  <div>{item.product?.name}</div>
                  <div className="text-xs text-gray-600">HSN: {item.product?.hsn_code}</div>
                  <div className="text-xs text-gray-600">Batch: {item.product?.batch_number}</div>
                </td>
                <td className="text-center py-1">{item.quantity}</td>
                <td className="text-right py-1">{formatCurrency(item.price)}</td>
                <td className="text-right py-1">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          {invoice.total_discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>-{formatCurrency(invoice.total_discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Taxable Value:</span>
            <span>{formatCurrency(invoice.total_taxable_value)}</span>
          </div>
          {invoice.total_cgst > 0 && (
            <div className="flex justify-between">
              <span>CGST:</span>
              <span>{formatCurrency(invoice.total_cgst)}</span>
            </div>
          )}
          {invoice.total_sgst > 0 && (
            <div className="flex justify-between">
              <span>SGST:</span>
              <span>{formatCurrency(invoice.total_sgst)}</span>
            </div>
          )}
          {invoice.total_igst > 0 && (
            <div className="flex justify-between">
              <span>IGST:</span>
              <span>{formatCurrency(invoice.total_igst)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold border-t border-gray-300 pt-1">
            <span>TOTAL:</span>
            <span>{formatCurrency(invoice.grand_total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="border-b border-dashed border-gray-400 pb-3 mb-3 text-xs">
        <div className="flex justify-between">
          <span>Payment Mode:</span>
          <span className="uppercase">{invoice.payment_mode}</span>
        </div>
        <div className="flex justify-between">
          <span>Payment Status:</span>
          <span className="uppercase">{invoice.payment_status}</span>
        </div>
        {invoice.amount_paid > 0 && (
          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <span>{formatCurrency(invoice.amount_paid)}</span>
          </div>
        )}
        {invoice.grand_total - invoice.amount_paid > 0 && (
          <div className="flex justify-between font-bold">
            <span>Balance Due:</span>
            <span>{formatCurrency(invoice.grand_total - invoice.amount_paid)}</span>
          </div>
        )}
      </div>

      {/* Terms and Conditions */}
      {settings.termsAndConditions && (
        <div className="border-b border-dashed border-gray-400 pb-3 mb-3">
          <p className="text-xs font-bold mb-1">Terms & Conditions:</p>
          <p className="text-xs">{settings.termsAndConditions}</p>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-xs">
        <p className="mb-2">Thank you for your business!</p>
        <p className="text-xs text-gray-600">
          Generated on {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
        </p>
        
        {settings.showSignature && (
          <div className="mt-4">
            <div className="border-t border-gray-400 w-24 mx-auto"></div>
            <p className="mt-1 text-xs">Authorized Signature</p>
          </div>
        )}
      </div>

      {/* Print Instructions */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>*** COMPUTER GENERATED INVOICE ***</p>
        <p>No signature required</p>
      </div>
    </div>
  );
});

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;
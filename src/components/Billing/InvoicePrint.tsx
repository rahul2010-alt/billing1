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
      className="bg-white text-black" 
      style={{ width: '210mm', minHeight: '297mm', fontSize: '12px', fontFamily: 'Arial, sans-serif', padding: '10mm' }}
      onClick={handlePrintClick}
    >
      {/* Header Section */}
      <div className="border-2 border-red-600 mb-4">
        {/* Top Header with Drug License and GST */}
        <div className="bg-white px-4 py-2 flex justify-between items-center text-xs">
          <div className="text-red-600 font-bold">
            Drug Lic No.: {settings.dlNumber}
          </div>
          <div className="text-red-600 font-bold">
            GST No.: {settings.gstin}
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-red-600 text-white text-center py-3">
          <h1 className="text-2xl font-bold">{settings.storeName}</h1>
          <p className="text-sm font-semibold">CHEMIST & DRUGGIST</p>
          <p className="text-xs mt-1">{settings.address}</p>
        </div>

        {/* Cash Memo Header */}
        <div className="bg-red-600 text-white text-right px-4 py-1">
          <span className="bg-white text-red-600 px-3 py-1 font-bold text-sm">CASH MEMO</span>
        </div>
      </div>

      {/* Customer and Invoice Details */}
      <div className="border border-red-600 mb-4">
        <div className="flex">
          {/* Left Side - Customer Details */}
          <div className="w-1/2 border-r border-red-600 p-3">
            <div className="mb-2">
              <span className="font-bold text-red-600">Name:</span>
              <span className="ml-2">{invoice.customer?.name || 'Walk-in Customer'}</span>
            </div>
            <div>
              <span className="font-bold text-red-600">Dr.:</span>
              <span className="ml-2">_________________________</span>
            </div>
          </div>
          
          {/* Right Side - Invoice Details */}
          <div className="w-1/2 p-3">
            <div className="mb-2">
              <span className="font-bold text-red-600">Invoice No:</span>
              <span className="ml-2">{invoice.invoice_number}</span>
            </div>
            <div>
              <span className="font-bold text-red-600">Date:</span>
              <span className="ml-2">{format(new Date(invoice.date), 'dd/MM/yyyy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-red-600 mb-4">
        <table className="w-full">
          <thead>
            <tr className="bg-red-600 text-white">
              <th className="border-r border-white px-2 py-2 text-xs font-bold">Qty.</th>
              <th className="border-r border-white px-2 py-2 text-xs font-bold">Pack</th>
              <th className="border-r border-white px-2 py-2 text-xs font-bold">Mfg.</th>
              <th className="border-r border-white px-2 py-2 text-xs font-bold">PARTICULARS</th>
              <th className="border-r border-white px-2 py-2 text-xs font-bold">Batch</th>
              <th className="border-r border-white px-2 py-2 text-xs font-bold">Exp.</th>
              <th className="px-2 py-2 text-xs font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item: any, index: number) => (
              <tr key={index} className="border-b border-red-600">
                <td className="border-r border-red-600 px-2 py-2 text-center text-xs">{item.quantity}</td>
                <td className="border-r border-red-600 px-2 py-2 text-center text-xs">{item.product?.unit || '-'}</td>
                <td className="border-r border-red-600 px-2 py-2 text-center text-xs">{item.product?.manufacturer || '-'}</td>
                <td className="border-r border-red-600 px-2 py-2 text-xs">
                  <div className="font-semibold">{item.product?.name}</div>
                  <div className="text-xs text-gray-600">HSN: {item.product?.hsn_code}</div>
                </td>
                <td className="border-r border-red-600 px-2 py-2 text-center text-xs">{item.product?.batch_number || '-'}</td>
                <td className="border-r border-red-600 px-2 py-2 text-center text-xs">
                  {item.product?.expiry_date ? format(new Date(item.product.expiry_date), 'MM/yy') : '-'}
                </td>
                <td className="px-2 py-2 text-right text-xs">{formatCurrency(item.total)}</td>
              </tr>
            ))}
            
            {/* Add empty rows to fill space */}
            {Array.from({ length: Math.max(0, 8 - (invoice.items?.length || 0)) }, (_, i) => (
              <tr key={`empty-${i}`} className="border-b border-red-600" style={{ height: '30px' }}>
                <td className="border-r border-red-600 px-2 py-2"></td>
                <td className="border-r border-red-600 px-2 py-2"></td>
                <td className="border-r border-red-600 px-2 py-2"></td>
                <td className="border-r border-red-600 px-2 py-2"></td>
                <td className="border-r border-red-600 px-2 py-2"></td>
                <td className="border-r border-red-600 px-2 py-2"></td>
                <td className="px-2 py-2"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="border border-red-600">
        <div className="flex">
          {/* Left Side - Currency and Terms */}
          <div className="w-1/2 border-r border-red-600 p-3">
            <div className="mb-4">
              <span className="font-bold text-red-600">Currency Here:</span>
              <div className="mt-2 text-xs">
                <strong>Rupees {invoice.grand_total ? convertNumberToWords(invoice.grand_total) : 'Zero'} Only</strong>
              </div>
            </div>
            
            <div className="text-xs">
              <div className="font-bold text-red-600 mb-2">All disputes subject to CITY Jurisdiction only:</div>
              <div>Medicines without Batch No. & Exp. will not be taken back.</div>
              <div>Please consult Dr. before using the medicines. E. & O.E.</div>
            </div>
          </div>
          
          {/* Right Side - Total and Signature */}
          <div className="w-1/2 p-3">
            <div className="mb-4">
              <div className="bg-red-600 text-white px-2 py-1 text-right font-bold">
                R.O. TOTAL: {formatCurrency(invoice.grand_total)}
              </div>
            </div>
            
            <div className="text-center mt-8">
              <div className="text-xs font-bold text-red-600">For: {settings.storeName}</div>
              <div className="mt-8 border-t border-gray-400 pt-2 text-xs">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GST Details Section (if applicable) */}
      {(invoice.total_cgst > 0 || invoice.total_sgst > 0 || invoice.total_igst > 0) && (
        <div className="mt-4 border border-red-600 p-3">
          <div className="text-xs font-bold text-red-600 mb-2">GST DETAILS:</div>
          <div className="grid grid-cols-4 gap-4 text-xs">
            <div>
              <span className="font-semibold">Taxable Value:</span>
              <div>{formatCurrency(invoice.total_taxable_value)}</div>
            </div>
            {invoice.total_cgst > 0 && (
              <div>
                <span className="font-semibold">CGST:</span>
                <div>{formatCurrency(invoice.total_cgst)}</div>
              </div>
            )}
            {invoice.total_sgst > 0 && (
              <div>
                <span className="font-semibold">SGST:</span>
                <div>{formatCurrency(invoice.total_sgst)}</div>
              </div>
            )}
            {invoice.total_igst > 0 && (
              <div>
                <span className="font-semibold">IGST:</span>
                <div>{formatCurrency(invoice.total_igst)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

// Helper function to convert number to words
function convertNumberToWords(num: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  
  function convertHundreds(n: number): string {
    let result = '';
    
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    
    if (n > 0) {
      result += ones[n] + ' ';
    }
    
    return result;
  }
  
  let result = '';
  const crores = Math.floor(num / 10000000);
  const lakhs = Math.floor((num % 10000000) / 100000);
  const thousands = Math.floor((num % 100000) / 1000);
  const hundreds = num % 1000;
  
  if (crores > 0) {
    result += convertHundreds(crores) + 'Crore ';
  }
  
  if (lakhs > 0) {
    result += convertHundreds(lakhs) + 'Lakh ';
  }
  
  if (thousands > 0) {
    result += convertHundreds(thousands) + 'Thousand ';
  }
  
  if (hundreds > 0) {
    result += convertHundreds(hundreds);
  }
  
  return result.trim();
}

InvoicePrint.displayName = 'InvoicePrint';

export default InvoicePrint;
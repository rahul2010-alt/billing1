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

  // Determine if we need full A4 or half A4 based on number of items
  const itemCount = invoice.items?.length || 0;
  const useFullA4 = itemCount > 6; // If more than 6 items, use full A4
  
  // Calculate minimum rows needed (minimum 8 for half A4, more for full A4)
  const minRows = useFullA4 ? 15 : 8;
  const emptyRowsNeeded = Math.max(0, minRows - itemCount);

  // Prevent any event bubbling that might cause issues
  const handlePrintClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const containerStyle = {
    width: '210mm',
    minHeight: useFullA4 ? '297mm' : '148.5mm', // Full A4 or Half A4
    maxHeight: useFullA4 ? 'none' : '148.5mm',
    fontSize: '11px',
    fontFamily: 'Arial, sans-serif',
    padding: '8mm',
    pageBreakAfter: useFullA4 ? 'always' : 'auto',
    boxSizing: 'border-box' as const
  };

  return (
    <div 
      ref={ref} 
      className="bg-white text-black" 
      style={containerStyle}
      onClick={handlePrintClick}
    >
      {/* Header Section */}
      <div className="border-2 border-red-600 mb-3">
        {/* Top Header with Drug License and GST */}
        <div className="bg-white px-3 py-1 flex justify-between items-center text-xs">
          <div className="text-red-600 font-bold">
            Drug Lic No.: {settings.dlNumber}
          </div>
          <div className="text-red-600 font-bold">
            GST No.: {settings.gstin}
          </div>
        </div>

        {/* Main Header */}
        <div className="bg-red-600 text-white text-center py-2">
          <h1 className="text-xl font-bold">{settings.storeName}</h1>
          <p className="text-sm font-semibold">CHEMIST & DRUGGIST</p>
          <p className="text-xs mt-1">{settings.address}</p>
        </div>

        {/* Cash Memo Header */}
        <div className="bg-red-600 text-white text-right px-3 py-1">
          <span className="bg-white text-red-600 px-2 py-1 font-bold text-sm">CASH MEMO</span>
        </div>
      </div>

      {/* Customer and Invoice Details */}
      <div className="border border-red-600 mb-3">
        <div className="flex">
          {/* Left Side - Customer Details */}
          <div className="w-1/2 border-r border-red-600 p-2">
            <div className="mb-1">
              <span className="font-bold text-red-600">Name:</span>
              <span className="ml-2">{invoice.customer?.name || 'Walk-in Customer'}</span>
            </div>
            <div>
              <span className="font-bold text-red-600">Dr.:</span>
              <span className="ml-2">_________________________</span>
            </div>
          </div>
          
          {/* Right Side - Invoice Details */}
          <div className="w-1/2 p-2">
            <div className="mb-1">
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
      <div className="border border-red-600 mb-3 flex-1">
        <table className="w-full">
          <thead>
            <tr className="bg-red-600 text-white">
              <th className="border-r border-white px-1 py-1 text-xs font-bold w-12">Qty.</th>
              <th className="border-r border-white px-1 py-1 text-xs font-bold w-16">Pack</th>
              <th className="border-r border-white px-1 py-1 text-xs font-bold w-16">Mfg.</th>
              <th className="border-r border-white px-1 py-1 text-xs font-bold">PARTICULARS</th>
              <th className="border-r border-white px-1 py-1 text-xs font-bold w-20">Batch</th>
              <th className="border-r border-white px-1 py-1 text-xs font-bold w-16">Exp.</th>
              <th className="px-1 py-1 text-xs font-bold w-20">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items?.map((item: any, index: number) => (
              <tr key={index} className="border-b border-red-600">
                <td className="border-r border-red-600 px-1 py-1 text-center text-xs">{item.quantity}</td>
                <td className="border-r border-red-600 px-1 py-1 text-center text-xs">{item.product?.unit || '-'}</td>
                <td className="border-r border-red-600 px-1 py-1 text-center text-xs truncate">
                  {item.product?.manufacturer ? item.product.manufacturer.substring(0, 6) : '-'}
                </td>
                <td className="border-r border-red-600 px-1 py-1 text-xs">
                  <div className="font-semibold">{item.product?.name}</div>
                  <div className="text-xs text-gray-600">HSN: {item.product?.hsn_code}</div>
                </td>
                <td className="border-r border-red-600 px-1 py-1 text-center text-xs">{item.product?.batch_number || '-'}</td>
                <td className="border-r border-red-600 px-1 py-1 text-center text-xs">
                  {item.product?.expiry_date ? format(new Date(item.product.expiry_date), 'MM/yy') : '-'}
                </td>
                <td className="px-1 py-1 text-right text-xs">{formatCurrency(item.total)}</td>
              </tr>
            ))}
            
            {/* Add empty rows to fill space for consistent layout */}
            {Array.from({ length: emptyRowsNeeded }, (_, i) => (
              <tr key={`empty-${i}`} className="border-b border-red-600" style={{ height: useFullA4 ? '20px' : '18px' }}>
                <td className="border-r border-red-600 px-1 py-1"></td>
                <td className="border-r border-red-600 px-1 py-1"></td>
                <td className="border-r border-red-600 px-1 py-1"></td>
                <td className="border-r border-red-600 px-1 py-1"></td>
                <td className="border-r border-red-600 px-1 py-1"></td>
                <td className="border-r border-red-600 px-1 py-1"></td>
                <td className="px-1 py-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Section */}
      <div className="border border-red-600">
        <div className="flex">
          {/* Left Side - Currency and Terms */}
          <div className="w-1/2 border-r border-red-600 p-2">
            <div className="mb-2">
              <span className="font-bold text-red-600">Currency Here:</span>
              <div className="mt-1 text-xs">
                <strong>Rupees {invoice.grand_total ? convertNumberToWords(invoice.grand_total) : 'Zero'} Only</strong>
              </div>
            </div>
            
            <div className="text-xs">
              <div className="font-bold text-red-600 mb-1">All disputes subject to CITY Jurisdiction only:</div>
              <div>Medicines without Batch No. & Exp. will not be taken back.</div>
              <div>Please consult Dr. before using the medicines. E. & O.E.</div>
            </div>
          </div>
          
          {/* Right Side - Total and Signature */}
          <div className="w-1/2 p-2">
            <div className="mb-3">
              <div className="bg-red-600 text-white px-2 py-1 text-right font-bold text-sm">
                R.O. TOTAL: {formatCurrency(invoice.grand_total)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xs font-bold text-red-600">For: {settings.storeName}</div>
              <div className="mt-4 border-t border-gray-400 pt-1 text-xs">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GST Details Section (if applicable and space allows) */}
      {(invoice.total_cgst > 0 || invoice.total_sgst > 0 || invoice.total_igst > 0) && useFullA4 && (
        <div className="mt-3 border border-red-600 p-2">
          <div className="text-xs font-bold text-red-600 mb-1">GST DETAILS:</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
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
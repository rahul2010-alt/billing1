// Common types used throughout the application

export interface Product {
  id: string;
  name: string;
  hsnCode: string;
  batchNumber: string;
  manufacturer: string;
  expiryDate: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number;
  stock: number;
  unit: string;
  category: string;
  reorderLevel: number;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstin?: string;
  type: 'B2B' | 'B2C' | 'B2CL';
  state: string;
  stateCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  price: number;
  discount: number;
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerGstin?: string;
  items: InvoiceItem[];
  subtotal: number;
  totalDiscount: number;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotal: number;
  paymentMode: 'cash' | 'card' | 'upi' | 'credit';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  amountPaid: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  supplierGstin: string;
  items: PurchaseItem[];
  subtotal: number;
  totalTaxableValue: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  grandTotal: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  amountPaid: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  hsnCode: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unit: string;
  price: number;
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  state: string;
  stateCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface GstReport {
  month: string;
  year: string;
  b2b: GstInvoice[];
  b2cl: GstInvoice[];
  b2cs: GstSummary[];
  hsn: HsnSummary[];
}

export interface GstInvoice {
  invoiceId: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  gstin: string;
  stateCode: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface GstSummary {
  stateCode: string;
  gstRate: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface HsnSummary {
  hsnCode: string;
  description: string;
  quantity: number;
  unit: string;
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: string;
}
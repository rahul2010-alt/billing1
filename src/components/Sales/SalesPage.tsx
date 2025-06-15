import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Edit, Printer, Calendar } from 'lucide-react';
import Card from '../UI/Card';
import Table from '../UI/Table';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Modal from '../UI/Modal';
import { useSales } from '../../utils/hooks/useSales';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SalesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const { sales, loading, stats, getSalesByDateRange } = useSales();

  const handleDateRangeChange = async ([start, end]: [Date | null, Date | null]) => {
    setDateRange([start, end]);
    if (start && end) {
      try {
        const filteredSales = await getSalesByDateRange(start, end);
        // Update the sales list with filtered data
      } catch (error) {
        console.error('Error fetching sales by date range:', error);
      }
    }
  };

  const filteredSales = searchQuery
    ? sales.filter(sale =>
        sale.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customer?.gstin?.includes(searchQuery)
      )
    : sales;

  const columns = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      align: 'left' as const,
    },
    {
      header: 'Date',
      accessor: (sale: any) => format(new Date(sale.date), 'dd/MM/yyyy'),
      align: 'left' as const,
    },
    {
      header: 'Customer',
      accessor: (sale: any) => (
        <div>
          <div className="font-medium">{sale.customer?.name}</div>
          {sale.customer?.gstin && (
            <div className="text-xs text-gray-500">GSTIN: {sale.customer.gstin}</div>
          )}
        </div>
      ),
      align: 'left' as const,
    },
    {
      header: 'Amount',
      accessor: (sale: any) => (
        <div className="text-right">
          <div className="font-medium">₹{sale.grandTotal.toLocaleString()}</div>
          <div className="text-xs text-gray-500">
            Paid: ₹{sale.amountPaid.toLocaleString()}
          </div>
        </div>
      ),
      align: 'right' as const,
    },
    {
      header: 'GST',
      accessor: (sale: any) => (
        <div className="text-right text-sm">
          <div>CGST: ₹{sale.totalCgst.toFixed(2)}</div>
          <div>SGST: ₹{sale.totalSgst.toFixed(2)}</div>
          {sale.totalIgst > 0 && <div>IGST: ₹{sale.totalIgst.toFixed(2)}</div>}
        </div>
      ),
      align: 'right' as const,
    },
    {
      header: 'Status',
      accessor: (sale: any) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          sale.paymentStatus === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : sale.paymentStatus === 'partial'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {sale.paymentStatus.charAt(0).toUpperCase() + sale.paymentStatus.slice(1)}
        </span>
      ),
      align: 'center' as const,
    },
    {
      header: 'Actions',
      accessor: (sale: any) => (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Eye className="h-4 w-4" />}
            onClick={() => {/* Handle view */}}
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
            onClick={() => {/* Handle print */}}
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
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sales</h2>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all sales transactions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Total Sales</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              ₹{stats.totalSales.toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              GST: ₹{(stats.gstBreakup.cgst + stats.gstBreakup.sgst + stats.gstBreakup.igst).toLocaleString()}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Amount Received</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              ₹{stats.totalReceived.toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              From {sales.length} invoices
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Amount Pending</h3>
            <p className="mt-2 text-3xl font-bold text-red-600">
              ₹{stats.totalPending.toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {sales.filter(s => s.paymentStatus !== 'paid').length} unpaid invoices
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Input
          type="text"
          placeholder="Search by invoice number, customer name or GSTIN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-4 w-4 text-gray-400" />}
          className="w-full md:w-96"
        />
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Calendar className="h-4 w-4" />}
            onClick={() => setShowFilters(true)}
          >
            Date Range
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Filter className="h-4 w-4" />}
          >
            Filter
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
          data={filteredSales}
          loading={loading}
          emptyMessage="No sales found"
        />
      </Card>

      <Modal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Sales"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <DatePicker
              selectsRange={true}
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={handleDateRangeChange}
              className="w-full rounded-md border-gray-300"
              dateFormat="dd/MM/yyyy"
              placeholderText="Select date range"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateRange([null, null]);
                setShowFilters(false);
              }}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowFilters(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesPage;
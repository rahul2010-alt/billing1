import React, { useState } from 'react';
import { Download, Filter, Calendar, FileText } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Table from '../UI/Table';
import Modal from '../UI/Modal';
import DatePicker from 'react-datepicker';
import { useGstReports } from '../../utils/hooks/useGstReports';
import { format } from 'date-fns';
import { exportToExcel, formatGSTReportForExcel } from '../../utils/exportToExcel';
import "react-datepicker/dist/react-datepicker.css";

const GstReportPage: React.FC = () => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [activeTab, setActiveTab] = useState<'b2b' | 'b2cl' | 'b2cs' | 'hsn'>('b2b');
  const { data, loading, error, fetchReportsByDateRange } = useGstReports();

  const b2bColumns = [
    {
      header: 'Invoice Number',
      accessor: 'invoice_number',
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (value: string) => format(new Date(value), 'dd/MM/yyyy'),
    },
    {
      header: 'Customer GSTIN',
      accessor: 'gstin',
    },
    {
      header: 'Customer Name',
      accessor: 'customer_name',
    },
    {
      header: 'Taxable Value',
      accessor: 'taxable_value',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'CGST',
      accessor: 'cgst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'SGST',
      accessor: 'sgst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'IGST',
      accessor: 'igst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
  ];

  const b2clColumns = [
    {
      header: 'Invoice Number',
      accessor: 'invoice_number',
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (value: string) => format(new Date(value), 'dd/MM/yyyy'),
    },
    {
      header: 'State',
      accessor: 'state',
    },
    {
      header: 'Taxable Value',
      accessor: 'taxable_value',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'CGST',
      accessor: 'cgst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'SGST',
      accessor: 'sgst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'IGST',
      accessor: 'igst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
  ];

  const b2csColumns = [
    {
      header: 'Type',
      accessor: 'type',
    },
    {
      header: 'State',
      accessor: 'state',
    },
    {
      header: 'Rate',
      accessor: 'rate',
      cell: (value: number) => `${value}%`,
    },
    {
      header: 'Taxable Value',
      accessor: 'taxable_value',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'CGST',
      accessor: 'cgst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'SGST',
      accessor: 'sgst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'IGST',
      accessor: 'igst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'Total',
      accessor: 'total',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
  ];

  const hsnColumns = [
    {
      header: 'HSN Code',
      accessor: 'hsn_code',
    },
    {
      header: 'Description',
      accessor: 'description',
    },
    {
      header: 'UQC',
      accessor: 'uqc',
    },
    {
      header: 'Total Quantity',
      accessor: 'total_quantity',
    },
    {
      header: 'Taxable Value',
      accessor: 'taxable_value',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'CGST',
      accessor: 'cgst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'SGST',
      accessor: 'sgst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
    {
      header: 'IGST',
      accessor: 'igst',
      cell: (value: number) => `₹${value.toLocaleString()}`,
    },
  ];

  const handleDateRangeChange = async ([start, end]: [Date | null, Date | null]) => {
    setDateRange([start, end]);
    if (start && end) {
      await fetchReportsByDateRange(start, end);
    }
  };

  const handleExport = (type: 'b2b' | 'b2cl' | 'b2cs' | 'hsn' | 'all') => {
    const formattedData = formatGSTReportForExcel(data);
    
    if (type === 'all') {
      // Export each report type to separate sheets in one file
      const workbook = {
        'B2B Invoices': formattedData.b2bData,
        'B2CL Invoices': formattedData.b2clData,
        'B2CS Summary': formattedData.b2csData,
        'HSN Summary': formattedData.hsnData
      };
      exportToExcel(Object.values(workbook).flat(), 'GST_Reports_Complete');
    } else {
      const exportData = {
        b2b: formattedData.b2bData,
        b2cl: formattedData.b2clData,
        b2cs: formattedData.b2csData,
        hsn: formattedData.hsnData
      }[type];
      
      exportToExcel(exportData, `GST_Report_${type.toUpperCase()}`);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
        <h3 className="text-lg font-medium text-red-800">Error Loading GST Reports</h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GST Reports</h2>
          <p className="mt-1 text-sm text-gray-500">
            Generate and manage GST reports for tax filing
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Calendar className="h-4 w-4" />}
            onClick={() => setShowDateFilter(true)}
          >
            Select Period
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="h-4 w-4" />}
            onClick={() => handleExport('all')}
          >
            Export All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">B2B Invoices</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              ₹{data.totals.b2b.toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {data.counts.b2b} invoices
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">B2CL Invoices</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              ₹{data.totals.b2cl.toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {data.counts.b2cl} invoices
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">B2CS Summary</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              ₹{data.totals.b2cs.toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {data.counts.b2cs} transactions
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Total GST</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              ₹{(data.gst.cgst + data.gst.sgst + data.gst.igst).toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              For selected period
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="border-b border-gray-200">
          <div className="p-4 flex space-x-2">
            <Button
              variant={activeTab === 'b2b' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('b2b')}
            >
              B2B
            </Button>
            <Button
              variant={activeTab === 'b2cl' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('b2cl')}
            >
              B2CL
            </Button>
            <Button
              variant={activeTab === 'b2cs' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('b2cs')}
            >
              B2CS
            </Button>
            <Button
              variant={activeTab === 'hsn' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('hsn')}
            >
              HSN
            </Button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'b2b' && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  B2B (Business to Business) Invoices
                </h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FileText className="h-4 w-4" />}
                  >
                    Generate GSTR-1 B2B Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => handleExport('b2b')}
                  >
                    Export
                  </Button>
                </div>
              </div>
              <Table
                columns={b2bColumns}
                data={data.b2b}
                loading={loading}
                emptyMessage="No B2B invoices found"
              />
            </>
          )}

          {activeTab === 'b2cl' && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  B2CL (Business to Consumer Large) Invoices
                </h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FileText className="h-4 w-4" />}
                  >
                    Generate GSTR-1 B2CL Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => handleExport('b2cl')}
                  >
                    Export
                  </Button>
                </div>
              </div>
              <Table
                columns={b2clColumns}
                data={data.b2cl}
                loading={loading}
                emptyMessage="No B2CL invoices found"
              />
            </>
          )}

          {activeTab === 'b2cs' && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  B2CS (Business to Consumer Small) Summary
                </h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FileText className="h-4 w-4" />}
                  >
                    Generate GSTR-1 B2CS Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => handleExport('b2cs')}
                  >
                    Export
                  </Button>
                </div>
              </div>
              <Table
                columns={b2csColumns}
                data={data.b2cs}
                loading={loading}
                emptyMessage="No B2CS transactions found"
              />
            </>
          )}

          {activeTab === 'hsn' && (
            <>
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  HSN Summary
                </h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<FileText className="h-4 w-4" />}
                  >
                    Generate HSN Summary Report
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download className="h-4 w-4" />}
                    onClick={() => handleExport('hsn')}
                  >
                    Export
                  </Button>
                </div>
              </div>
              <Table
                columns={hsnColumns}
                data={data.hsn}
                loading={loading}
                emptyMessage="No HSN data found"
              />
            </>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showDateFilter}
        onClose={() => setShowDateFilter(false)}
        title="Select Report Period"
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
                setShowDateFilter(false);
              }}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowDateFilter(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GstReportPage;
import React, { useState } from 'react';
import { Download, Filter, Calendar, FileText } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Table from '../UI/Table';
import Modal from '../UI/Modal';
import DatePicker from 'react-datepicker';
import { useReports } from '../../utils/hooks/useReports';
import { format } from 'date-fns';
import { exportToExcel, formatReportsForExcel } from '../../utils/exportToExcel';
import "react-datepicker/dist/react-datepicker.css";

const ReportsPage: React.FC = () => {
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const { data, loading, error, fetchReportsByDateRange } = useReports();

  const handleDateRangeChange = async ([start, end]: [Date | null, Date | null]) => {
    setDateRange([start, end]);
    if (start && end) {
      await fetchReportsByDateRange(start, end);
    }
  };

  const handleExport = (type: 'summary' | 'products' | 'categories' | 'payments' | 'all') => {
    const formattedData = formatReportsForExcel(data);
    
    if (type === 'all') {
      const workbook = {
        'Summary': formattedData.summary,
        'Top Products': formattedData.topProducts,
        'Category Performance': formattedData.categoryPerformance,
        'Payment Methods': formattedData.paymentMethods
      };
      exportToExcel(Object.values(workbook).flat(), 'Sales_Reports_Complete');
    } else {
      const exportData = {
        summary: formattedData.summary,
        products: formattedData.topProducts,
        categories: formattedData.categoryPerformance,
        payments: formattedData.paymentMethods
      }[type];
      
      exportToExcel(exportData, `Sales_Report_${type}`);
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
        <h3 className="text-lg font-medium text-red-800">Error Loading Reports</h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
          <p className="mt-1 text-sm text-gray-500">
            View and analyze business performance
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Sales Overview</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              ₹{data.totals.sales.toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {data.counts.invoices} invoices
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Purchases</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              ₹{data.totals.purchases.toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {data.counts.purchases} orders
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Gross Profit</h3>
            <p className="mt-2 text-3xl font-bold text-teal-600">
              ₹{(data.totals.sales - data.totals.purchases).toLocaleString()}
            </p>
            <div className="mt-2 text-sm text-gray-500">
              {((data.totals.sales - data.totals.purchases) / data.totals.sales * 100).toFixed(1)}% margin
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-4 w-4" />}
              onClick={() => handleExport('products')}
            >
              Export
            </Button>
          </div>
          <Table
            columns={[
              {
                header: 'Product',
                accessor: 'name',
                align: 'left'
              },
              {
                header: 'Category',
                accessor: 'category',
                align: 'left'
              },
              {
                header: 'Units Sold',
                accessor: (item: any) => item.quantity.toLocaleString(),
                align: 'right'
              },
              {
                header: 'Revenue',
                accessor: (item: any) => `₹${item.revenue.toLocaleString()}`,
                align: 'right'
              },
              {
                header: 'Profit',
                accessor: (item: any) => `₹${item.profit.toLocaleString()}`,
                align: 'right'
              }
            ]}
            data={data.topProducts}
            loading={loading}
            emptyMessage="No products found"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Category Performance</h3>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={() => handleExport('categories')}
              >
                Export
              </Button>
            </div>
            <Table
              columns={[
                {
                  header: 'Category',
                  accessor: 'name',
                  align: 'left'
                },
                {
                  header: 'Sales',
                  accessor: (item: any) => `₹${item.sales.toLocaleString()}`,
                  align: 'right'
                },
                {
                  header: '% of Total',
                  accessor: (item: any) => `${((item.sales / data.totals.sales) * 100).toFixed(1)}%`,
                  align: 'right'
                }
              ]}
              data={data.categoryPerformance}
              loading={loading}
              emptyMessage="No categories found"
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Payment Methods</h3>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="h-4 w-4" />}
                onClick={() => handleExport('payments')}
              >
                Export
              </Button>
            </div>
            <Table
              columns={[
                {
                  header: 'Method',
                  accessor: 'method',
                  align: 'left'
                },
                {
                  header: 'Amount',
                  accessor: (item: any) => `₹${item.amount.toLocaleString()}`,
                  align: 'right'
                },
                {
                  header: 'Transactions',
                  accessor: (item: any) => item.count.toLocaleString(),
                  align: 'right'
                }
              ]}
              data={data.paymentMethods}
              loading={loading}
              emptyMessage="No payment methods found"
            />
          </div>
        </Card>
      </div>

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

export default ReportsPage;
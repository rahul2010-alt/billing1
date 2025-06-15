import React from 'react';
import { 
  TrendingUp, TrendingDown, ShoppingBag, DollarSign, Activity, Calendar, 
  AlertTriangle, Package, ArrowRight, Pill, Stethoscope, Thermometer
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import Card from '../UI/Card';
import { useAppContext } from '../../utils/context/AppContext';
import { useDashboard } from '../../utils/hooks/useDashboard';
import Button from '../UI/Button';
import LoadingSpinner from '../UI/LoadingSpinner';

const Dashboard: React.FC = () => {
  const { currentBusinessMonth } = useAppContext();
  const { data, loading, error } = useDashboard(currentBusinessMonth);
  
  const [year, month] = currentBusinessMonth.split('-');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];
  const monthName = monthNames[parseInt(month) - 1];

  const StatCard = ({ title, value, previousValue, icon, prefix = '₹' }) => {
    const percentChange = ((value - previousValue) / previousValue) * 100;
    const isIncrease = percentChange > 0;
    
    return (
      <Card className="h-full transform transition-all duration-200 hover:scale-105">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {title === 'Invoices' ? value : `${prefix}${value.toLocaleString()}`}
            </p>
          </div>
          <div className="p-2 bg-teal-50 rounded-lg">
            <span className="text-teal-700">{icon}</span>
          </div>
        </div>
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-medium ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
            {isIncrease ? <TrendingUp className="inline h-4 w-4 mr-1" /> : <TrendingDown className="inline h-4 w-4 mr-1" />}
            {Math.abs(percentChange).toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last month</span>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
        <div className="flex items-center bg-teal-50 px-3 py-1 rounded-md">
          <Calendar className="h-4 w-4 text-teal-700 mr-2" />
          <span className="text-sm font-medium text-teal-700">{`${monthName} ${year}`}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Sales" 
          value={data.stats.sales.current} 
          previousValue={data.stats.sales.previous} 
          icon={<DollarSign className="h-5 w-5" />} 
        />
        <StatCard 
          title="Total Purchases" 
          value={data.stats.purchases.current} 
          previousValue={data.stats.purchases.previous} 
          icon={<ShoppingBag className="h-5 w-5" />} 
        />
        <StatCard 
          title="Gross Profit" 
          value={data.stats.profit.current} 
          previousValue={data.stats.profit.previous} 
          icon={<TrendingUp className="h-5 w-5" />} 
        />
        <StatCard 
          title="Invoices" 
          value={data.stats.invoices.current} 
          previousValue={data.stats.invoices.previous}
          icon={<Activity className="h-5 w-5" />}
          prefix=""
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          title="Sales & Purchases Trend" 
          className="lg:col-span-2"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#0d9488" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  name="Sales"
                />
                <Area 
                  type="monotone" 
                  dataKey="purchases" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorPurchases)" 
                  name="Purchases"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card 
          title="Sales by Category" 
          icon={<Package className="h-5 w-5" />}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Bar dataKey="value" fill="#0d9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              View Detailed Report
            </Button>
          </div>
        </Card>

        <Card 
          title="Inventory Alerts" 
          icon={<AlertTriangle className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Low Stock Items</h4>
              <div className="space-y-2">
                {data.lowStock.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      {item.category === 'Pain Relief' && <Pill className="h-4 w-4 text-red-600 mr-2" />}
                      {item.category === 'Antibiotics' && <Stethoscope className="h-4 w-4 text-red-600 mr-2" />}
                      {item.category === 'Medical Devices' && <Thermometer className="h-4 w-4 text-red-600 mr-2" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Reorder Level: {item.reorderLevel}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                      Stock: {item.stock}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Expiring Soon</h4>
              <div className="space-y-2">
                {data.expiringItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                    <div className="flex items-center">
                      {item.category === 'Antibiotics' && <Stethoscope className="h-4 w-4 text-amber-600 mr-2" />}
                      {item.category === 'Vitamins' && <Pill className="h-4 w-4 text-amber-600 mr-2" />}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">Batch: {item.batchNumber}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                      Expires: {format(new Date(item.expiryDate), 'dd MMM yyyy')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-4"
              icon={<ArrowRight className="h-4 w-4" />}
            >
              View All Alerts
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
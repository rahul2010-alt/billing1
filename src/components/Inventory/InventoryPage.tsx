import React, { useState } from 'react';
import { Package, Plus, Search, Filter, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useProducts } from '../../utils/hooks/useSupabase';
import { useStockMovements } from '../../utils/hooks/useStockMovements';
import Card from '../UI/Card';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import Table from '../UI/Table';
import ProductForm from './ProductForm';
import { format } from 'date-fns';

const InventoryPage: React.FC = () => {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showStockMovements, setShowStockMovements] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { products, loading } = useProducts();
  const { movements, loading: movementsLoading } = useStockMovements();

  const filteredProducts = searchQuery
    ? products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.hsnCode.includes(searchQuery) ||
        product.batchNumber.includes(searchQuery)
      )
    : products;

  const handleViewMovements = (productId: string) => {
    setSelectedProductId(productId);
    setShowStockMovements(true);
  };

  const productMovements = movements.filter(movement => 
    selectedProductId ? movement.productId === selectedProductId : true
  );

  const stockMovementColumns = [
    {
      header: 'Date',
      accessor: (movement: any) => format(new Date(movement.createdAt), 'dd/MM/yyyy HH:mm'),
      align: 'left' as const,
    },
    {
      header: 'Product',
      accessor: 'productName',
      align: 'left' as const,
    },
    {
      header: 'Type',
      accessor: (movement: any) => (
        <div className="flex items-center">
          {movement.movementType === 'purchase' && <TrendingUp className="h-4 w-4 text-green-600 mr-1" />}
          {movement.movementType === 'sale' && <TrendingDown className="h-4 w-4 text-red-600 mr-1" />}
          {movement.movementType === 'adjustment' && <Activity className="h-4 w-4 text-blue-600 mr-1" />}
          <span className="capitalize">{movement.movementType}</span>
        </div>
      ),
      align: 'left' as const,
    },
    {
      header: 'Quantity',
      accessor: (movement: any) => (
        <span className={`font-medium ${
          movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
        </span>
      ),
      align: 'right' as const,
    },
    {
      header: 'Notes',
      accessor: 'notes',
      align: 'left' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Activity className="h-4 w-4" />}
            onClick={() => {
              setSelectedProductId(null);
              setShowStockMovements(true);
            }}
          >
            Stock Movements
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => setShowAddProduct(true)}
          >
            Add Product
          </Button>
        </div>
      </div>

      {showAddProduct ? (
        <Card title="Add New Product" icon={<Package className="h-5 w-5" />}>
          <ProductForm
            onSubmit={() => setShowAddProduct(false)}
            onCancel={() => setShowAddProduct(false)}
          />
        </Card>
      ) : (
        <>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="w-full md:w-64 relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      HSN Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading products...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.manufacturer}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.hsnCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.batchNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <span className={`font-medium ${
                            product.stock <= product.reorderLevel
                              ? 'text-red-600'
                              : 'text-gray-900'
                          }`}>
                            {product.stock} {product.unit}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="text-gray-900">₹{product.sellingPrice}</div>
                          <div className="text-gray-500">GST: {product.gstRate}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {product.stock <= product.reorderLevel ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              In Stock
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              icon={<Activity className="h-4 w-4" />}
                              onClick={() => handleViewMovements(product.id)}
                            >
                              Movements
                            </Button>
                            <button className="text-teal-600 hover:text-teal-900">
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Modal
            isOpen={showStockMovements}
            onClose={() => {
              setShowStockMovements(false);
              setSelectedProductId(null);
            }}
            title={selectedProductId ? "Product Stock Movements" : "All Stock Movements"}
            size="xl"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  {selectedProductId 
                    ? `Showing movements for selected product`
                    : `Showing all recent stock movements`
                  }
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedProductId(null);
                    setShowStockMovements(true);
                  }}
                  disabled={!selectedProductId}
                >
                  Show All
                </Button>
              </div>
              
              <Table
                columns={stockMovementColumns}
                data={productMovements}
                loading={movementsLoading}
                emptyMessage="No stock movements found"
              />
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default InventoryPage;
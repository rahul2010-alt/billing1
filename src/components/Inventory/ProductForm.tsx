import React, { useState } from 'react';
import { useProducts } from '../../utils/hooks/useSupabase';
import { Product } from '../../types';
import { useAppContext } from '../../utils/context/AppContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface ProductFormProps {
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { addNotification } = useAppContext();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    hsnCode: initialData?.hsnCode || '',
    batchNumber: initialData?.batchNumber || '',
    manufacturer: initialData?.manufacturer || '',
    expiryDate: initialData?.expiryDate ? new Date(initialData.expiryDate) : null,
    purchasePrice: initialData?.purchasePrice || '',
    sellingPrice: initialData?.sellingPrice || '',
    gstRate: initialData?.gstRate || '',
    stock: initialData?.stock || 0,
    unit: initialData?.unit || '',
    category: initialData?.category || '',
    reorderLevel: initialData?.reorderLevel || 0
  });

  const { addProduct } = useProducts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProduct({
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        gstRate: Number(formData.gstRate),
        expiryDate: formData.expiryDate?.toISOString().split('T')[0] || null
      });
      addNotification('Product added successfully!');
      onSubmit();
    } catch (error) {
      console.error('Error adding product:', error);
      addNotification('Error adding product: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">HSN Code</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.hsnCode}
            onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Batch Number</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
          <DatePicker
            selected={formData.expiryDate}
            onChange={(date) => setFormData({ ...formData, expiryDate: date })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
          <input
            type="number"
            required
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.purchasePrice}
            onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Selling Price</label>
          <input
            type="number"
            required
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">GST Rate (%)</label>
          <input
            type="number"
            required
            step="0.01"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.gstRate}
            onChange={(e) => setFormData({ ...formData, gstRate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Unit</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          >
            <option value="">Select Unit</option>
            <option value="tablet">Tablet</option>
            <option value="bottle">Bottle</option>
            <option value="strip">Strip</option>
            <option value="piece">Piece</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Select Category</option>
            <option value="Medicine">Medicine</option>
            <option value="Equipment">Equipment</option>
            <option value="Supplies">Supplies</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Reorder Level</label>
          <input
            type="number"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
            value={formData.reorderLevel}
            onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
        >
          Save Product
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
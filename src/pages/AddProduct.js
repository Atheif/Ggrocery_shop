import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    description: '',
    category: '',
    offer_percentage: 0,
    offer_active: false,
    offer_end_date: ''
  });
  const [categories, setCategories] = useState([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', image_url: '' });
  const [loading, setLoading] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || addingCategory) return;
    
    setAddingCategory(true);
    try {
      // Check if category already exists
      const { data: existing } = await supabase
        .from('categories')
        .select('name')
        .eq('name', newCategory.name)
        .single();
      
      if (existing) {
        setError('Category already exists');
        setAddingCategory(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.name,
          description: newCategory.name, // Use name as description
          image_url: newCategory.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' // Default image
        }]);
      
      if (error) {
        console.error('Supabase error:', error);
        setError('Failed to add category: ' + error.message);
        return;
      }
      
      setSuccess('Category added successfully!');
      await fetchCategories();
      setNewCategory({ name: '', image_url: '' });
      setShowAddCategory(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          price: parseFloat(formData.price),
          image: formData.image,
          description: formData.description,
          category: formData.category,
          offer_percentage: parseInt(formData.offer_percentage) || 0,
          offer_active: formData.offer_active,
          offer_end_date: formData.offer_end_date || null
        }]);

      if (error) throw error;

      setSuccess('Product added successfully!');
      setFormData({
        name: '',
        price: '',
        image: '',
        description: '',
        category: '',
        offer_percentage: 0,
        offer_active: false,
        offer_end_date: ''
      });
      
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </div>
      <div className="pt-16 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-8">Add New Product</h1>
            
            {error && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  required
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="https://images.unsplash.com/photo-example?w=300"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use Unsplash URLs like: https://images.unsplash.com/photo-1234567890?w=300
                </p>
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="w-20 h-20 object-cover rounded border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="w-20 h-20 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-500" style={{display: 'none'}}>
                      Invalid URL
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="flex gap-2">
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name.toLowerCase()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCategory(!showAddCategory)}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    +
                  </button>
                </div>
                
                {showAddCategory && (
                  <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                    <h4 className="text-sm font-medium mb-3">Add New Category</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Category name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <input
                        type="url"
                        placeholder="Background image URL (optional)"
                        value={newCategory.image_url}
                        onChange={(e) => setNewCategory({...newCategory, image_url: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        disabled={addingCategory}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {addingCategory ? 'Adding...' : 'Add Category'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddCategory(false)}
                        className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter product description"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Offer Details (Optional)</h3>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="offer_active"
                    checked={formData.offer_active}
                    onChange={(e) => setFormData({...formData, offer_active: e.target.checked})}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700">
                    Enable Offer
                  </label>
                </div>

                {formData.offer_active && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Percentage (%)
                      </label>
                      <input
                        type="number"
                        name="offer_percentage"
                        min="0"
                        max="100"
                        value={formData.offer_percentage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., 20"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Offer End Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        name="offer_end_date"
                        value={formData.offer_end_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
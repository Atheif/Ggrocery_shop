import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';
import { ProductCardShimmer, CategoryShimmer } from '../components/Shimmer';
import { supabase } from '../lib/supabase';

const styles = `
  @keyframes slideLoop {
    0% { transform: translateX(0); }
    100% { transform: translateX(-100%); }
  }
  .animate-slide {
    animation: slideLoop 20s linear infinite;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      setFeaturedProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

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



  const filteredProducts = featuredProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(selectedCategory === categoryName ? '' : categoryName);
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen">
      <style>{styles}</style>
      {/* Sticky Navbar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </div>
      {/* Hero Section */}
      <div className="relative bg-cover bg-center py-20 text-white" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200)'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative max-w-7xl mx-auto px-8 text-center z-10">
          <h1 className="text-5xl font-bold mb-4">Welcome to Grocery Store</h1>
          <p className="text-xl mb-8">Fresh groceries delivered to your door</p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 text-gray-900 bg-white rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Categories</h2>
          <div className="overflow-hidden">
            <div className="flex space-x-6 pb-4 animate-slide" style={{width: '100%'}}>
              {categories.length > 0 ? (
                <>
                  {categories.map(category => (
                    <div 
                      key={category.id} 
                      onClick={() => handleCategoryClick(category.name)}
                      className={`relative bg-cover bg-center rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer text-white min-w-[200px] ${
                        selectedCategory === category.name ? 'ring-4 ring-amber-400' : ''
                      }`} 
                      style={{backgroundImage: `url(${category.image_url})`}}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
                      <div className="relative z-10">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-200">{category.description}</p>
                      </div>  
                    </div>
                  ))}
                  {categories.map(category => (
                    <div 
                      key={`duplicate-${category.id}`} 
                      onClick={() => handleCategoryClick(category.name)}
                      className={`relative bg-cover bg-center rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer text-white min-w-[200px] ${
                        selectedCategory === category.name ? 'ring-4 ring-amber-400' : ''
                      }`} 
                      style={{backgroundImage: `url(${category.image_url})`}}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>
                      <div className="relative z-10">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <p className="text-sm text-gray-200">{category.description}</p>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                Array.from({ length: 6 }).map((_, index) => (
                  <CategoryShimmer key={index} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            {selectedCategory ? `${selectedCategory} Products` : 'Featured Products'} 
            {(searchTerm || selectedCategory) ? ` (${filteredProducts.length} found)` : ''}
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <ProductCard key={product.id} item={product} onCardClick={openProductModal} />
              ))
            ) : searchTerm ? (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-500 text-lg">No products found for "{searchTerm}"</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 text-amber-800 hover:text-amber-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : loading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <ProductCardShimmer key={index} />
              ))
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product.id} item={product} onCardClick={openProductModal} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold mb-2">Fresh Products</h3>
              <p className="text-gray-600">Farm-fresh produce delivered daily</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick delivery to your doorstep</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Quality Service</h3>
              <p className="text-gray-600">Exceptional customer experience</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={closeProductModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
              >
                ×
              </button>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <div className="p-6">
                <h2 className="text-3xl font-bold mb-4">{selectedProduct.name}</h2>
                <p className="text-gray-600 mb-6 text-lg">{selectedProduct.description}</p>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-4xl font-bold text-green-600">${selectedProduct.price}</span>
                  <div className="flex items-center space-x-4">
                    <button className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">-</button>
                    <span className="text-xl font-semibold">1</span>
                    <button className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">+</button>
                  </div>
                  
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => {
                      closeProductModal();
                      navigate('/order', { state: { product: selectedProduct } });
                    }}
                    className="bg-amber-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-amber-700 transition-colors"
                  >
                    Buy Now
                  </button>
                  <button className="bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors">
                    Add to Cart
                  </button>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid md:grid-cols-4 gap-20">
            <div>
              <h3 className="text-xl font-bold mb-4">Grocery Store</h3>
              <p className="text-gray-300">Fresh groceries delivered to your door with quality and care.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/" className="block text-gray-300 hover:text-white">Home</Link>
                <Link to="/menu" className="block text-gray-300 hover:text-white">Menu</Link>
                <Link to="/cart" className="block text-gray-300 hover:text-white">Cart</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <div className="space-y-2">
                <p className="text-gray-300">Fruits & Vegetables</p>
                <p className="text-gray-300">Dairy & Bakery</p>
                <p className="text-gray-300">Meat & Seafood</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-300">
                <p>📞 (555) 123-4567</p>
                <p>📧 info@grocerystore.com</p>
                <p>📍 123 Main St, City</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Grocery Store. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
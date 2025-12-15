import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { ProductDetailsShimmer } from '../components/Shimmer';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-40">
          <Navbar />
        </div>
        <div className="pt-16 py-8">
          <div className="max-w-6xl mx-auto px-8">
            <div className="mb-6 h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            <ProductDetailsShimmer />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="fixed top-0 left-0 right-0 z-40">
          <Navbar />
        </div>
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-4">Product not found</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </div>
      <div className="pt-16 py-8">
        <div className="max-w-6xl mx-auto px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="p-8">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </div>

              {/* Product Info */}
              <div className="p-8">
                <div className="mb-4">
                  <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">{product.description}</p>
                
                <div className="mb-8">
                  <span className="text-4xl font-bold text-green-600">${product.price}</span>
                  <span className="text-gray-500 ml-2">per item</span>
                </div>

                {/* Quantity Selector */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 text-lg font-semibold"
                    >
                      -
                    </button>
                    <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 text-lg font-semibold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-amber-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-amber-700 transition-colors">
                    Buy Now - ${(product.price * quantity).toFixed(2)}
                  </button>
                  <button className="bg-green-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors">
                    Add to Cart
                  </button>
                </div>

                {/* Product Details */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                  <div className="space-y-2 text-gray-600">
                    <p><span className="font-medium">Category:</span> {product.category}</p>
                    <p><span className="font-medium">Price:</span> ${product.price}</p>
                    <p><span className="font-medium">Availability:</span> In Stock</p>
                    <p><span className="font-medium">SKU:</span> #{product.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
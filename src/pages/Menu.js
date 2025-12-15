import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { ProductCardShimmer } from '../components/Shimmer';
import { supabase } from '../lib/supabase';

const Menu = () => {
  const [groceryItems, setGroceryItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      setGroceryItems(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-8">
        <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <ProductCardShimmer key={index} />
            ))
          ) : groceryItems.length > 0 ? (
            groceryItems.map(item => (
              <ProductCard key={item.id} item={item} />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No products available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
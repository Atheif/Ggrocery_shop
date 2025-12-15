import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ item, onCardClick }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };
  const handleAddToCart = (e) => {
    e.stopPropagation();
    console.log('Added to cart:', item.name);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    navigate('/order', { state: { product: item } });
  };

  const handleCardClick = () => {
    navigate(`/product/${item.id}`);
  };

  const hasActiveOffer = item.offer_active && item.offer_percentage > 0;
  const discountedPrice = hasActiveOffer ? (item.price * (1 - item.offer_percentage / 100)).toFixed(2) : item.price;

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        {imageError ? (
          <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        ) : (
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-32 object-cover"
            onError={handleImageError}
          />
        )}
        {hasActiveOffer && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {item.offer_percentage}% OFF
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-base font-semibold mb-1">{item.name}</h3>
        <p className="text-gray-600 text-xs mb-2">{item.description}</p>
        <div className="flex justify-between items-center mb-2">
          {hasActiveOffer ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-green-600">${discountedPrice}</span>
              <span className="text-sm text-gray-400 line-through">${item.price}</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-green-600">${item.price}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleBuyNow}
            className="bg-amber-600 text-white px-2 py-1 text-xs rounded hover:bg-amber-700 transition-colors"
          >
            Buy Now
          </button>
          <button 
            onClick={handleAddToCart}
            className="bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
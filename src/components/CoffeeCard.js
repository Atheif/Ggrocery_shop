import React from 'react';

const CoffeeCard = ({ item }) => {
  const handleAddToCart = () => {
    // Add to cart logic here
    console.log('Added to cart:', item.name);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={item.image} 
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-amber-800">${item.price}</span>
          <button 
            onClick={handleAddToCart}
            className="bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-700 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeCard;
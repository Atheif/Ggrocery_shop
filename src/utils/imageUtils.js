// Valid image URLs for different categories
export const getValidImageUrl = (category, productName) => {
  const imageMap = {
    fruits: {
      apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300',
      banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300',
      orange: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300',
      default: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300'
    },
    vegetables: {
      broccoli: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300',
      carrot: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300',
      default: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=300'
    },
    dairy: {
      milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300',
      cheese: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300',
      default: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300'
    },
    bakery: {
      bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
      cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300',
      default: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300'
    },
    meat: {
      chicken: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300',
      beef: 'https://images.unsplash.com/photo-1588348845815-9d1c1d0d9d1f?w=300',
      default: 'https://images.unsplash.com/photo-1588348845815-9d1c1d0d9d1f?w=300'
    },
    seafood: {
      fish: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300',
      salmon: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300',
      default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300'
    },
    beverages: {
      coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300',
      juice: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300',
      default: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300'
    },
    snacks: {
      chips: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300',
      nuts: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300',
      default: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300'
    }
  };

  const categoryImages = imageMap[category?.toLowerCase()] || imageMap.fruits;
  const productKey = productName?.toLowerCase().split(' ')[0];
  
  return categoryImages[productKey] || categoryImages.default;
};

export const fixImageUrl = (url, category, productName) => {
  if (!url || url.includes('share.google') || url.includes('drive.google')) {
    return getValidImageUrl(category, productName);
  }
  return url;
};
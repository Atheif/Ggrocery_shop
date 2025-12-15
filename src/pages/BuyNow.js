import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { supabase } from '../lib/supabase';

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { productId } = useParams();
  
  // Get product data from location state or fetch from API
  const product = location.state?.product;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pincode: '',
    quantity: 1,
    paymentMethod: 'cash',
    razorpayKey: 'rzp_test_xMw7fbS5jks9Ye' // User's test key
  });

  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [deliveryTracking, setDeliveryTracking] = useState({
    status: 'pending',
    currentLocation: null,
    estimatedTime: '30-45 minutes'
  });

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Load Razorpay script dynamically if not available
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        console.log('Razorpay script loaded dynamically');
        resolve(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Get user location and nearby stores
  const getUserLocation = () => {
    setLocationLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          findNearbyStores(location);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationLoading(false);
          // Set default stores if location fails
          setNearbyStores([
            { id: 1, name: 'Fresh Mart Downtown', address: '123 Main St', distance: '0.5 km', lat: 40.7128, lng: -74.0060 },
            { id: 2, name: 'Green Grocery', address: '456 Oak Ave', distance: '1.2 km', lat: 40.7589, lng: -73.9851 },
            { id: 3, name: 'City Fresh Market', address: '789 Pine St', distance: '2.1 km', lat: 40.7505, lng: -73.9934 }
          ]);
        }
      );
    }
  };

  const findNearbyStores = (location) => {
    // Simulate nearby grocery stores based on user location
    const stores = [
      {
        id: 1,
        name: 'Fresh Mart Downtown',
        address: '123 Main St',
        distance: '0.5 km',
        lat: location.lat + 0.001,
        lng: location.lng + 0.001
      },
      {
        id: 2,
        name: 'Green Grocery',
        address: '456 Oak Ave',
        distance: '1.2 km',
        lat: location.lat + 0.005,
        lng: location.lng - 0.003
      },
      {
        id: 3,
        name: 'City Fresh Market',
        address: '789 Pine St',
        distance: '2.1 km',
        lat: location.lat - 0.002,
        lng: location.lng + 0.004
      }
    ];
    setNearbyStores(stores);
    setSelectedStore(stores[0]); // Auto-select closest store
  };

  const startDeliveryTracking = () => {
    // Simulate live delivery tracking
    const trackingStates = [
      { status: 'confirmed', message: 'Order confirmed at store' },
      { status: 'preparing', message: 'Preparing your order' },
      { status: 'picked_up', message: 'Order picked up by delivery partner' },
      { status: 'on_the_way', message: 'On the way to your location' },
      { status: 'delivered', message: 'Order delivered successfully' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < trackingStates.length) {
        setDeliveryTracking(prev => ({
          ...prev,
          status: trackingStates[currentStep].status,
          message: trackingStates[currentStep].message,
          currentLocation: userLocation ? {
            lat: userLocation.lat + (Math.random() - 0.5) * 0.01,
            lng: userLocation.lng + (Math.random() - 0.5) * 0.01
          } : null
        }));
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 10000); // Update every 10 seconds
  };

  // Check if Razorpay is loaded
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    
    const checkRazorpay = async () => {
      console.log(`Checking Razorpay availability... Attempt ${retryCount + 1}`);
      
      if (window.Razorpay) {
        console.log('Razorpay loaded successfully');
        setRazorpayLoaded(true);
      } else if (retryCount < maxRetries) {
        retryCount++;
        console.warn(`Razorpay not loaded, retrying... (${retryCount}/${maxRetries})`);
        
        // Try to load script dynamically on last retry
        if (retryCount === maxRetries) {
          console.log('Attempting to load Razorpay script dynamically...');
          const loaded = await loadRazorpayScript();
          if (loaded && window.Razorpay) {
            setRazorpayLoaded(true);
          } else {
            console.error('Failed to load Razorpay after all attempts');
            setRazorpayLoaded(false);
          }
        } else {
          setTimeout(checkRazorpay, 1000);
        }
      } else {
        console.error('Razorpay failed to load after maximum retries');
        setRazorpayLoaded(false);
      }
    };
    
    // Initial check
    checkRazorpay();
  }, []);

  // Get user location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch product details if not passed via state
  useEffect(() => {
    const fetchProduct = async () => {
      if (!product && productId) {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();
          
          if (error) throw error;
          // You can set product to state if needed
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      }
    };

    fetchProduct();
  }, [product, productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuantityChange = (action) => {
    setFormData(prev => ({
      ...prev,
      quantity: action === 'increment' 
        ? prev.quantity + 1 
        : Math.max(1, prev.quantity - 1)
    }));
  };

  const calculateTotal = () => {
    if (!product) return 0;
    return (product.price * formData.quantity).toFixed(2);
  };

  const handleRazorpayPayment = (orderData) => {
    // Validate Razorpay key
    if (!formData.razorpayKey || !formData.razorpayKey.startsWith('rzp_')) {
      alert('Please enter a valid Razorpay key (starts with rzp_test_ or rzp_live_)');
      setLoading(false);
      return;
    }

    // Check if Razorpay is available
    if (!window.Razorpay) {
      alert('Payment gateway is not available. Please refresh the page and try again.');
      setLoading(false);
      return;
    }

    const totalAmount = parseFloat(calculateTotal()) + 2.99 + 1.49;
    
    const options = {
      key: formData.razorpayKey,
      amount: Math.round(totalAmount * 100), // Amount in paise
      currency: 'INR',
      name: 'Grocery Store',
      description: `Payment for ${product.name}`,
      handler: function (response) {
        handlePaymentSuccess(response, orderData);
      },
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone
      },
      theme: {
        color: '#F59E0B'
      },
      modal: {
        ondismiss: function() {
          setLoading(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error?.description || 'Payment was unsuccessful'}`);
        setLoading(false);
      });
      
      rzp.open();
    } catch (error) {
      alert('Failed to open payment gateway. Please check your Razorpay key and try again.');
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResponse, orderData) => {
    try {
      console.log('Processing payment success:', paymentResponse);
      
      // Update order status to paid with payment details
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_id: paymentResponse.razorpay_payment_id,
          payment_signature: paymentResponse.razorpay_signature,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          payment_completed_at: new Date().toISOString()
        })
        .eq('id', orderData.id);

      if (error) throw error;

      // Show success message
      console.log('Order updated successfully');
      setOrderId(orderData.id);
      setOrderSuccess(true);
      setLoading(false);
      // Start delivery tracking simulation
      startDeliveryTracking();
      
      // Optional: Send confirmation email or SMS
      // await sendOrderConfirmation(orderData.id);
      
    } catch (error) {
      console.error('Error updating payment status:', error);
      setLoading(false);
      alert('Payment successful but failed to update order. Please contact support with Payment ID: ' + paymentResponse.razorpay_payment_id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate product exists
    if (!product || !product.id) {
      alert('Product information is missing. Please go back and select a product.');
      setLoading(false);
      return;
    }

    try {
      // Create order in database
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          product_id: product.id,
          product_name: product.name,
          quantity: formData.quantity,
          total_price: calculateTotal(),
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: `${formData.address}, ${formData.city} - ${formData.pincode}`,
          payment_method: formData.paymentMethod,
          status: 'pending',
          order_date: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      console.log('Order created successfully:', data[0]);
      
      // Process payment based on method
      if (formData.paymentMethod === 'card' || formData.paymentMethod === 'upi') {
        // Online payment via Razorpay
        console.log('Initiating Razorpay payment for order:', data[0].id);
        console.log('Payment method:', formData.paymentMethod);
        handleRazorpayPayment(data[0]);
      } else if (formData.paymentMethod === 'cash') {
        // Cash on delivery - mark as confirmed
        console.log('Cash on delivery order placed:', data[0].id);
        const { error: updateError } = await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', data[0].id);
          
        if (updateError) {
          console.error('Error updating COD order:', updateError);
        }
        
        setTimeout(() => {
          setOrderId(data[0].id);
          setOrderSuccess(true);
          setLoading(false);
          // Start delivery tracking simulation
          startDeliveryTracking();
        }, 1000);
      }

    } catch (error) {
      console.error('Error placing order:', error);
      setLoading(false);
      
      // Show specific error message
      let errorMessage = 'Failed to place order. ';
      if (error.message) {
        errorMessage += error.message;
      } else if (error.details) {
        errorMessage += error.details;
      } else {
        errorMessage += 'Please check your internet connection and try again.';
      }
      
      alert(errorMessage);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Product not found</h2>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 z-40">
        <Navbar />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl mt-16">
        {/* Order Process Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                1  
              </div>
              <div className="w-24 h-1 bg-green-600"></div>
              <div className={`w-10 h-10 rounded-full ${orderSuccess ? 'bg-green-600' : 'bg-gray-300'} text-white flex items-center justify-center font-semibold`}>
                2
              </div>
              <div className="w-24 h-1 bg-gray-300"></div>
              <div className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center font-semibold">
                3
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span className="text-center w-24">Order Details</span>
            <span className="text-center w-24">Payment</span>
            <span className="text-center w-24">Confirmation</span>
          </div>
        </div>

        {orderSuccess ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 mb-2">Thank you for your order.</p>
            <p className="text-gray-600 mb-6">Order ID: <span className="font-semibold">ORD-{orderId}</span></p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
              <div className="flex items-center space-x-4 mb-4">
                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-gray-600 text-sm">Quantity: {formData.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">${calculateTotal()}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>${calculateTotal()}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Shipping</span>
                  <span>$2.99</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${(parseFloat(calculateTotal()) + 2.99).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Pickup & Delivery Info */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                </svg>
                Live Delivery Tracking
              </h3>
              
              {/* Pickup Store Info */}
              {selectedStore && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-600 mb-1">Pickup Store:</p>
                  <p className="font-medium">{selectedStore.name}</p>
                  <p className="text-sm text-gray-600">{selectedStore.address} • {selectedStore.distance}</p>
                </div>
              )}
              
              {/* Delivery Address */}
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Delivery Address:</p>
                <p className="font-medium">{formData.address}, {formData.city} - {formData.pincode}</p>
              </div>
              
              {/* Live Tracking Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-800">Status: {deliveryTracking.status.replace('_', ' ').toUpperCase()}</span>
                  <span className="text-sm text-green-600">{deliveryTracking.estimatedTime}</span>
                </div>
                <p className="text-sm text-green-700">{deliveryTracking.message || 'Order confirmed at store'}</p>
                <div className="mt-2 bg-green-200 rounded-full h-2">
                  <div className={`bg-green-600 h-2 rounded-full transition-all duration-500 ${
                    deliveryTracking.status === 'confirmed' ? 'w-1/5' :
                    deliveryTracking.status === 'preparing' ? 'w-2/5' :
                    deliveryTracking.status === 'picked_up' ? 'w-3/5' :
                    deliveryTracking.status === 'on_the_way' ? 'w-4/5' :
                    deliveryTracking.status === 'delivered' ? 'w-full' : 'w-1/5'
                  }`}></div>
                </div>
              </div>
              
              {/* Route Tracking */}
              <div className="bg-white rounded-lg border overflow-hidden mb-4 relative">
                {/* Live Tracking Overlay */}
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping"></div>
                  LIVE TRACKING
                </div>
                
                {/* ETA Overlay */}
                <div className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow">
                  <div className="text-xs text-gray-600">ETA</div>
                  <div className="font-bold text-green-600">{deliveryTracking.estimatedTime}</div>
                </div>
                
                {/* Delivery Status Overlay */}
                {deliveryTracking.status === 'on_the_way' && (
                  <div className="absolute bottom-4 left-4 z-10 bg-green-500 text-white px-3 py-2 rounded-lg flex items-center animate-pulse">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3z" />
                    </svg>
                    <span className="text-sm font-medium">Raj is on the way</span>
                  </div>
                )}
                
                {/* Route Visualization */}
                <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center relative">
                  <svg width="100%" height="100%" className="absolute inset-0">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <path d="M 50 200 Q 200 100 350 50" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray="10,5" className="animate-pulse"/>
                    <circle cx="50" cy="200" r="8" fill="#10b981" />
                    <circle cx="350" cy="50" r="8" fill="#ef4444" />
                  </svg>
                  <div className="absolute bottom-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                    📍 Pickup Store
                  </div>
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    🏠 Your Location
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚚</div>
                    <div className="text-sm font-medium text-gray-700">Tracking your delivery</div>
                  </div>
                </div>
                
                {/* Delivery Partner Info */}
                <div className="p-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-sm">Delivery Partner: Raj Kumar</p>
                        <p className="text-xs text-gray-600">⭐ 4.8 • 2.3 km away</p>
                      </div>
                    </div>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600">
                      📞 Call
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/${encodeURIComponent(selectedStore ? selectedStore.address : 'Fresh Mart Downtown, 123 Main St')}/${encodeURIComponent(formData.address + ', ' + formData.city + ', ' + formData.pincode)}`, '_blank')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                🗺️ View Route in Google Maps
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Order Summary */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Order Details</h2>
                
                {/* Product Details */}
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                    <p className="text-2xl font-bold text-green-600">${product.price}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleQuantityChange('decrement')}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="text-xl font-semibold w-8 text-center">{formData.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increment')}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Shipping Form */}
                <form onSubmit={handleSubmit}>
                  {/* Pickup Store Selection */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Select Pickup Store
                      {locationLoading && <span className="ml-2 text-sm text-gray-500">(Finding nearby stores...)</span>}
                    </h3>
                    
                    {nearbyStores.length > 0 ? (
                      <div className="space-y-3">
                        {nearbyStores.map(store => (
                          <label key={store.id} className={`flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                            selectedStore?.id === store.id ? 'border-green-500 bg-green-50' : 'border-gray-300'
                          }`}>
                            <input
                              type="radio"
                              name="pickupStore"
                              value={store.id}
                              checked={selectedStore?.id === store.id}
                              onChange={() => setSelectedStore(store)}
                              className="h-4 w-4 text-green-600"
                            />
                            <div className="ml-3 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="font-medium">{store.name}</p>
                                <span className="text-sm text-green-600 font-medium">{store.distance}</span>
                              </div>
                              <p className="text-sm text-gray-600">{store.address}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <button
                          type="button"
                          onClick={getUserLocation}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          📍 Find Nearby Stores
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-semibold mb-4">Delivery Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  {/* Razorpay Key Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Test Key (for online payments)</label>
                    <input
                      type="text"
                      name="razorpayKey"
                      value={formData.razorpayKey}
                      onChange={handleChange}
                      placeholder="Enter your Razorpay test key (rzp_test_...)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get your test key from Razorpay Dashboard → Settings → API Keys</p>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === 'cash'}
                          onChange={handleChange}
                          className="h-4 w-4 text-amber-600"
                        />
                        <span className="ml-3">Cash on Delivery</span>
                      </label>
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={handleChange}
                          className="h-4 w-4 text-amber-600"
                          disabled={!razorpayLoaded}
                        />
                        <span className="ml-3 flex items-center">
                          Credit/Debit Card
                          {!razorpayLoaded && <span className="ml-2 text-xs text-gray-500">(Loading...)</span>}
                        </span>
                      </label>
                      <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={formData.paymentMethod === 'upi'}
                          onChange={handleChange}
                          className="h-4 w-4 text-amber-600"
                          disabled={!razorpayLoaded}
                        />
                        <span className="ml-3 flex items-center">
                          UPI
                          {!razorpayLoaded && <span className="ml-2 text-xs text-gray-500">(Loading...)</span>}
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Processing Order...
                      </span>
                    ) : (
                      formData.paymentMethod === 'cash' 
                        ? `Place Order (COD) - $${(parseFloat(calculateTotal()) + 2.99 + 1.49).toFixed(2)}`
                        : `Pay Now - $${(parseFloat(calculateTotal()) + 2.99 + 1.49).toFixed(2)}`
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">${calculateTotal()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>$2.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>$1.49</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(parseFloat(calculateTotal()) + 2.99 + 1.49).toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-amber-800 mb-2">Delivery Estimate</h4>
                  <p className="text-sm text-amber-700">2-3 business days</p>
                </div>

                <div className="text-sm text-gray-500">
                  <p className="mb-2">✓ Free returns within 30 days</p>
                  <p>✓ 24/7 customer support</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
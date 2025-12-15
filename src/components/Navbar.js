import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, userProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <nav className="bg-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold">Grocery Shop</Link>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hover:text-blue-200 transition-colors">Login</Link>
              <Link to="/register" className="hover:text-blue-200 transition-colors">Register</Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Welcome */}
          <Link to="/home" className="text-lg md:text-xl font-bold flex-shrink-0">
            <span className="hidden md:inline">Welcome: </span>
            <span className="text-blue-200">
              {userProfile?.first_name || user?.user_metadata?.firstName || user?.user_metadata?.fullName || user?.email?.split('@')[0] || 'User'}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/home" className="hover:text-blue-200 transition-colors">Home</Link>
            <Link to="/menu" className="hover:text-blue-200 transition-colors">Menu</Link>
            <Link to="/add-product" className="hover:text-blue-200 transition-colors">Add Product</Link>
            <Link to="/cart" className="hover:text-blue-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
              </svg>
            </Link>
            <button onClick={handleLogout} className="hover:text-blue-200 transition-colors">Logout</button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-slate-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/home" className="block py-2 hover:bg-slate-700 px-2 rounded" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/menu" className="block py-2 hover:bg-slate-700 px-2 rounded" onClick={() => setMobileMenuOpen(false)}>Menu</Link>
            <Link to="/add-product" className="block py-2 hover:bg-slate-700 px-2 rounded" onClick={() => setMobileMenuOpen(false)}>Add Product</Link>
            <Link to="/cart" className="block py-2 hover:bg-slate-700 px-2 rounded" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left py-2 hover:bg-slate-700 px-2 rounded">Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUserProfile } = useAuth();
  const email = location.state?.email || '';
  const userData = location.state?.userData || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'magiclink'
      });

      if (error) throw error;

      console.log('OTP verified successfully:', data);
      
      // Store user data in users table if this is a new registration
      if (data.user && userData.firstName) {
        const { error: insertError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            age: parseInt(userData.age),
            gender: userData.gender,
            profile_image_url: null // Will be updated later if needed
          });

        if (insertError) {
          console.error('Error storing user data:', insertError);
        } else {
          console.log('User data stored successfully');
        }
      }
      
      // Refresh user profile in context
      if (data.user) {
        await fetchUserProfile(data.user.id);
      }
      
      // Auto-login successful, redirect to home
      navigate('/home');
    } catch (error) {
      console.error('OTP verification error:', error);
      setError('Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          shouldCreateUser: true,
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            age: userData.age,
            gender: userData.gender,
            fullName: `${userData.firstName} ${userData.lastName}`
          }
        }
      });
      if (error) throw error;
      alert('New OTP sent to your email!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-4xl mb-4"></div>
          <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
          <p className="mt-2 text-gray-600">Enter the OTP sent to {email}</p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">OTP Code</label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength="6"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-800 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={resendOTP}
              className="text-amber-800 hover:text-amber-700 font-medium"
            >
              Resend OTP
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
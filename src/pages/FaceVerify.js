import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FaceVerify = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Skip face verification and go directly to home
    navigate('/home');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default FaceVerify;
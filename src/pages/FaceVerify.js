import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { loadModels, detectFace } from '../utils/faceDetection';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FaceVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        await loadModels();
        setLoading(false);
      } catch (err) {
        setError('Failed to load face detection');
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleVerify = async () => {
    if (!webcamRef.current) return;

    setVerifying(true);
    setError('');
    const imageSrc = webcamRef.current.getScreenshot();

    if (!imageSrc) {
      setError('Failed to capture image');
      setVerifying(false);
      return;
    }

    const img = new Image();
    img.src = imageSrc;

    img.onload = async () => {
      try {
        const detection = await detectFace(img);

        if (!detection) {
          setError('No face detected. Please try again.');
          setVerifying(false);
          return;
        }

        // Get stored face image
        const { data: userData, error: fetchError } = await supabase
          .from('users')
          .select('face_image')
          .eq('id', user.id)
          .single();

        if (fetchError || !userData?.face_image) {
          setError('No face data found. Please complete face setup.');
          setVerifying(false);
          return;
        }

        // Simple comparison (in production, use backend API)
        const storedImg = new Image();
        storedImg.src = userData.face_image;

        storedImg.onload = async () => {
          const storedDetection = await detectFace(storedImg);

          if (!storedDetection) {
            setError('Verification failed. Please try again.');
            setVerifying(false);
            return;
          }

          // Compare face descriptors
          const distance = faceapi.euclideanDistance(
            detection.descriptor,
            storedDetection.descriptor
          );

          if (distance < 0.6) {
            // Face matched
            const redirectTo = location.state?.from || '/home';
            window.location.replace(redirectTo);
          } else {
            setError('Face verification failed. Please try again.');
            setVerifying(false);
          }
        };
      } catch (err) {
        setError('Verification failed. Please try again.');
        setVerifying(false);
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-2">Face Verification</h2>
          <p className="text-gray-600 text-center mb-8">Look at the camera to verify your identity</p>

          <div className="relative mb-6">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user'
              }}
            />
            <div className="absolute inset-0 border-4 border-green-500 rounded-lg pointer-events-none"></div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'Verify Face'}
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full mt-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceVerify;

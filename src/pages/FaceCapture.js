import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { loadModels, detectFace, detectSmile, detectHeadTurn } from '../utils/faceDetection';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FaceCapture = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const previousLandmarksRef = useRef(null);
  const smileDetectionCountRef = useRef(0);
  const faceBoxRef = useRef(null);
  const faceLandmarksRef = useRef(null);
  const [faceBox, setFaceBox] = useState(null);
  const [faceLandmarks, setFaceLandmarks] = useState(null);

  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const [actionIndex, setActionIndex] = useState(0);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [instructions, setInstructions] = useState('');

  const actions = [
    { text: 'Look straight', key: 'straight' }
  ];

  useEffect(() => {
    const init = async () => {
      try {
        await loadModels();
        setLoading(false);
        setCurrentAction(actions[0].text);
        setInstructions('Please look straight at the camera');
        startDetection();
      } catch (err) {
        setError('Failed to load face detection. Please refresh.');
        setLoading(false);
      }
    };
    init();
    
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startDetection = () => {
    setDetecting(true);
    smileDetectionCountRef.current = 0;
    
    // Start continuous face tracking
    const trackFace = async () => {
      if (!webcamRef.current || capturing) {
        animationFrameRef.current = requestAnimationFrame(trackFace);
        return;
      }

      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = async () => {
          const detection = await detectFace(img);
          if (detection) {
            faceBoxRef.current = {
              x: detection.detection.box.x,
              y: detection.detection.box.y,
              width: detection.detection.box.width,
              height: detection.detection.box.height
            };
            if (detection.landmarks) {
              faceLandmarksRef.current = detection.landmarks.positions;
            }
            setFaceBox(faceBoxRef.current);
            setFaceLandmarks(faceLandmarksRef.current);
          }
        };
      }
      animationFrameRef.current = requestAnimationFrame(trackFace);
    };
    
    setTimeout(() => {
      trackFace();
      detectionIntervalRef.current = setInterval(async () => {
        await detectAction();
      }, 500);
    }, 1000);
  };

// In your FaceCapture component, update the detectAction function:

const detectAction = async () => {
  if (!webcamRef.current || capturing) return;

  try {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // For debugging: Create a canvas and draw the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    const detection = await detectFace(img);
    
    if (!detection) {
      setError('No face detected. Please face the camera.');
      setFaceBox(null);
      setFaceLandmarks(null);
      return;
    }

    setError('');
    let actionDetected = false;

    if (actionIndex === 0) {
      // Step 1: Just detect face (look straight)
      actionDetected = true;
      setError('✓ Face detected!');
    }

    if (actionDetected) {
      clearInterval(detectionIntervalRef.current);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      await handleActionComplete(imageSrc);
    }
  } catch (err) {
    console.error('Detection error:', err);
    if (!error.includes('Retrying')) {
      setError('Detection failed. Retrying...');
    }
  }
};
  const handleActionComplete = async (imageSrc) => {
    setCapturing(true);
    setDetecting(false);

    const nextIndex = actionIndex + 1;
    if (nextIndex < actions.length) {
      setActionIndex(nextIndex);
      setCurrentAction(actions[nextIndex].text);
      
      if (nextIndex === 1) {
        setInstructions('Slowly turn your head left or right');
      }
      
      setCapturing(false);
      previousLandmarksRef.current = null;
      smileDetectionCountRef.current = 0;
      startDetection();
    } else {
      setCapturedImage(imageSrc);
      await saveFaceImage(imageSrc);
    }
  };

  const saveFaceImage = async (imageData) => {
    // Navigate immediately
    window.location.replace('/home');
    
    // Save in background (don't wait)
    supabase
      .from('users')
      .update({ 
        face_image: imageData,
        face_verified: true,
        face_captured_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .then(({ error: updateError }) => {
        if (updateError) {
          return supabase
            .from('users')
            .insert({ 
              id: user.id,
              face_image: imageData,
              face_verified: true,
              face_captured_at: new Date().toISOString()
            });
        }
      })
      .catch(err => console.error('Failed to save face image:', err));
  };

  const retryDetection = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setError('');
    startDetection();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading face detection...</p>
        </div>
      </div>
    );
  }

  if (capturedImage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Face Captured Successfully!</h2>
          <p className="text-gray-600 mb-4">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-2">Face Verification Setup</h2>
          <p className="text-gray-600 text-center mb-8">Complete the actions to verify your identity</p>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            {actions.map((action, idx) => (
              <React.Fragment key={idx}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  idx <= actionIndex ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {idx + 1}
                </div>
                {idx < actions.length - 1 && (
                  <div className={`w-16 h-1 ${idx < actionIndex ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Current Action */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-lg font-semibold text-amber-800">Current Action: {currentAction}</p>
            <p className="text-sm text-amber-600 mt-1">{instructions}</p>
            {detecting && !capturing && (
              <p className="text-sm text-amber-600 mt-2 animate-pulse">Detecting...</p>
            )}
            {capturing && (
              <p className="text-sm text-green-600 mt-2">✓ Action detected! Moving to next step...</p>
            )}
          </div>

          {/* Webcam with Face Tracker */}
          <div className="relative mb-6">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg"
              mirrored={true}
            />
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              viewBox="0 0 640 480"
              preserveAspectRatio="xMidYMid slice"
              style={{ transform: 'scaleX(-1)' }}
            >
              {faceLandmarks && (
                <>
                  {/* Jaw line */}
                  {[...Array(16)].map((_, i) => (
                    <line key={`jaw-${i}`} x1={faceLandmarks[i].x} y1={faceLandmarks[i].y} x2={faceLandmarks[i+1].x} y2={faceLandmarks[i+1].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                  {/* Left eyebrow */}
                  {[...Array(4)].map((_, i) => (
                    <line key={`leb-${i}`} x1={faceLandmarks[17+i].x} y1={faceLandmarks[17+i].y} x2={faceLandmarks[18+i].x} y2={faceLandmarks[18+i].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                  {/* Right eyebrow */}
                  {[...Array(4)].map((_, i) => (
                    <line key={`reb-${i}`} x1={faceLandmarks[22+i].x} y1={faceLandmarks[22+i].y} x2={faceLandmarks[23+i].x} y2={faceLandmarks[23+i].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                  {/* Nose bridge */}
                  {[...Array(3)].map((_, i) => (
                    <line key={`nb-${i}`} x1={faceLandmarks[27+i].x} y1={faceLandmarks[27+i].y} x2={faceLandmarks[28+i].x} y2={faceLandmarks[28+i].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                  {/* Nose bottom */}
                  {[...Array(4)].map((_, i) => (
                    <line key={`nbt-${i}`} x1={faceLandmarks[31+i].x} y1={faceLandmarks[31+i].y} x2={faceLandmarks[32+i].x} y2={faceLandmarks[32+i].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                  {/* Left eye */}
                  {[...Array(5)].map((_, i) => (
                    <line key={`le-${i}`} x1={faceLandmarks[36+i].x} y1={faceLandmarks[36+i].y} x2={faceLandmarks[37+i].x} y2={faceLandmarks[37+i].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                  <line x1={faceLandmarks[41].x} y1={faceLandmarks[41].y} x2={faceLandmarks[36].x} y2={faceLandmarks[36].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  {/* Right eye */}
                  {[...Array(5)].map((_, i) => (
                    <line key={`re-${i}`} x1={faceLandmarks[42+i].x} y1={faceLandmarks[42+i].y} x2={faceLandmarks[43+i].x} y2={faceLandmarks[43+i].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                  <line x1={faceLandmarks[47].x} y1={faceLandmarks[47].y} x2={faceLandmarks[42].x} y2={faceLandmarks[42].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  {/* Outer mouth */}
                  {[...Array(11)].map((_, i) => (
                    <line key={`om-${i}`} x1={faceLandmarks[48+i].x} y1={faceLandmarks[48+i].y} x2={faceLandmarks[49+i].x} y2={faceLandmarks[49+i].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                  <line x1={faceLandmarks[59].x} y1={faceLandmarks[59].y} x2={faceLandmarks[48].x} y2={faceLandmarks[48].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  {/* Inner mouth */}
                  {[...Array(7)].map((_, i) => (
                    <line key={`im-${i}`} x1={faceLandmarks[60+i].x} y1={faceLandmarks[60+i].y} x2={faceLandmarks[61+i].x} y2={faceLandmarks[61+i].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  ))}
                  <line x1={faceLandmarks[67].x} y1={faceLandmarks[67].y} x2={faceLandmarks[60].x} y2={faceLandmarks[60].y} stroke="#00d4ff" strokeWidth="1.5" opacity="0.8" />
                  {/* Landmark points */}
                  {faceLandmarks.map((point, idx) => (
                    <circle key={idx} cx={point.x} cy={point.y} r="2" fill="#ff4444" opacity="0.9" />
                  ))}
                </>
              )}
            </svg>
          </div>

          {error && (
            <div className={`${error.includes('✓') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4 mb-6`}>
              <p className={`text-center ${error.includes('✓') ? 'text-green-800' : 'text-red-800'}`}>{error}</p>
            </div>
          )}

          {/* Manual Retry Button (for debugging) */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={retryDetection}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Retry Detection
            </button>
            <button
              onClick={() => navigate('/home')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
            >
              Skip for Now
            </button>
          </div>

          {/* Debug Info */}
          <div className="text-xs text-gray-500 text-center mt-4">
            <p>Current step: {actionIndex + 1} of {actions.length}</p>
            <p>Step name: {actions[actionIndex].key}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceCapture;
import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let lastSmileDetectionTime = 0;
const SMILE_COOLDOWN_MS = 0; // No cooldown

export const loadModels = async () => {
  if (modelsLoaded) return;
  
  const MODEL_URL = '/models';
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(`${MODEL_URL}/tiny_face_detector`);
    await faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68`);
    await faceapi.nets.faceRecognitionNet.loadFromUri(`${MODEL_URL}/face_recognition`);
    await faceapi.nets.faceExpressionNet.loadFromUri(`${MODEL_URL}/face_expression`);
    
    // Optional: Load age and gender model if you want more accuracy
    // await faceapi.nets.ageGenderNet.loadFromUri(`${MODEL_URL}/age_gender`);
    
    modelsLoaded = true;
    console.log('Models loaded successfully');
  } catch (error) {
    console.error('Failed to load models:', error);
    throw error;
  }
};

export const detectFace = async (imageElement) => {
  try {
    const detections = await faceapi
      .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({
        inputSize: 320, // Can be 128, 160, 224, 320, 416, 512, 608
        scoreThreshold: 0.3 // Lower threshold for better detection
      }))
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withFaceExpressions();
    
    return detections;
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
};

export const detectSmile = (detection) => {
  if (!detection || !detection.expressions) return false;
  
  const expressions = detection.expressions;
  const happiness = expressions.happy;
  
  console.log('Smile check - happy:', happiness.toFixed(3));
  
  // Use mouth landmarks for better smile detection
  if (detection.landmarks) {
    const mouth = detection.landmarks.positions.slice(48, 68);
    const leftCorner = mouth[0];
    const rightCorner = mouth[6];
    const upperLip = mouth[14];
    const lowerLip = mouth[18];
    
    const mouthWidth = Math.abs(rightCorner.x - leftCorner.x);
    const mouthHeight = Math.abs(lowerLip.y - upperLip.y);
    const mouthRatio = mouthHeight / mouthWidth;
    
    console.log('Mouth - width:', mouthWidth.toFixed(1), 'height:', mouthHeight.toFixed(1), 'ratio:', mouthRatio.toFixed(3));
    
    // Smile if mouth is wide OR happiness is high
    const isSmiling = happiness > 0.25 || (mouthWidth > 50 && mouthRatio > 0.12);
    console.log('Smile detected:', isSmiling);
    return isSmiling;
  }
  
  return happiness > 0.25;
};


export const detectBlink = (landmarks) => {
  if (!landmarks) return false;
  
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  
  // Calculate eye aspect ratio
  const leftEAR = getEyeAspectRatio(leftEye);
  const rightEAR = getEyeAspectRatio(rightEye);
  const avgEAR = (leftEAR + rightEAR) / 2;
  
  console.log('EAR:', avgEAR.toFixed(3));
  
  // If EAR < 0.3, eyes are closed - more lenient
  return avgEAR < 0.3;
};

const getEyeAspectRatio = (eye) => {
  const vertical1 = distance(eye[1], eye[5]);
  const vertical2 = distance(eye[2], eye[4]);
  const horizontal = distance(eye[0], eye[3]);
  return (vertical1 + vertical2) / (2.0 * horizontal);
};

const distance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const detectHeadTurn = (landmarks, previousLandmarks) => {
  if (!landmarks || !previousLandmarks) return false;
  
  const currentNose = landmarks.getNose()[3];
  const previousNose = previousLandmarks.getNose()[3];
  
  const movement = Math.abs(currentNose.x - previousNose.x);
  
  console.log('Head movement:', movement.toFixed(1));
  
  // If nose moved more than 15 pixels, head turned
  return movement > 15;
};

export const compareFaces = (descriptor1, descriptor2) => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  console.log('Face distance:', distance.toFixed(3));
  return distance < 0.6; // Threshold for match
};

export const captureImageFromVideo = (videoElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
};

// Add a utility to draw face landmarks for debugging
export const drawFaceLandmarks = (canvas, detections) => {
  if (!detections || !canvas) return;
  
  const displaySize = {
    width: canvas.width,
    height: canvas.height
  };
  
  // Resize detections to canvas size
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw face detection box
  faceapi.draw.drawDetections(canvas, resizedDetections);
  
  // Draw face landmarks
  faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
  
  // Draw face expressions
  if (resizedDetections.expressions) {
    const minProbability = 0.05;
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections, minProbability);
  }
};
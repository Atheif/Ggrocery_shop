# Face Verification Setup Guide

## 📦 Step 1: Install Dependencies

```bash
cd coffee-shop-react
npm install react-webcam face-api.js
```

## 🗄️ Step 2: Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Add face verification columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS face_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS face_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS face_captured_at TIMESTAMP WITH TIME ZONE;
```

## 📁 Step 3: Download Face Detection Models

1. Download models from: https://github.com/justadudewhohacks/face-api.js-models
2. Create `public/models` folder in your project
3. Copy these model files to `public/models/`:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`

## 🔄 Step 4: Update Registration Flow

The VerifyOTP page should redirect to `/face-capture` after successful OTP verification instead of `/home`.

## 🎯 Step 5: Integration Points

### After Registration (VerifyOTP.js):
```javascript
// After OTP success
navigate('/face-capture');
```

### Before Checkout (BuyNow.js):
```javascript
// Add face verification before placing order
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Check if face verified
  const { data: userData } = await supabase
    .from('users')
    .select('face_verified')
    .eq('id', user.id)
    .single();
  
  if (!userData?.face_verified) {
    navigate('/face-verify', { state: { from: '/order' } });
    return;
  }
  
  // Continue with order...
};
```

## 🚀 Step 6: Test Flow

1. Register new user
2. Verify OTP
3. Complete face capture (3 actions: Look straight, Smile, Blink)
4. Face image saved to database
5. At checkout, verify face again
6. If matched, allow order placement

## 🔒 Security Features

- ✅ Liveness detection (multiple action prompts)
- ✅ Face descriptor comparison
- ✅ Webcam-only capture (no file upload)
- ✅ Real-time face detection
- ✅ Threshold-based matching (0.6 distance)

## 📱 Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Requires HTTPS
- Mobile browsers: ✅ Works with camera permission

## ⚠️ Important Notes

1. **HTTPS Required**: Webcam access requires HTTPS in production
2. **Camera Permission**: Users must grant camera access
3. **Model Loading**: First load takes 2-3 seconds
4. **Face Quality**: Good lighting required for accurate detection
5. **Privacy**: Face images stored as base64 in database

## 🎨 Customization

- Adjust face match threshold in `faceDetection.js` (default: 0.6)
- Modify liveness actions in `FaceCapture.js`
- Add more verification steps as needed
- Integrate with backend API for production

## 🐛 Troubleshooting

**Models not loading?**
- Check `public/models` folder exists
- Verify model files are present
- Check browser console for errors

**Camera not working?**
- Grant camera permission
- Use HTTPS (required for webcam)
- Check if camera is in use by another app

**Face not detected?**
- Ensure good lighting
- Face camera directly
- Remove glasses/masks if possible

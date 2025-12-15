-- Add face_image column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS face_image TEXT;

-- Add face_verified column to track verification status
ALTER TABLE users ADD COLUMN IF NOT EXISTS face_verified BOOLEAN DEFAULT FALSE;

-- Add face_captured_at timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS face_captured_at TIMESTAMP WITH TIME ZONE;

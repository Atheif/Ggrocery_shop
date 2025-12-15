# Database Setup Instructions

## 1. Create Users Table

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create users table to store additional user information
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  profile_image_url TEXT,
  face_image TEXT,
  face_verified BOOLEAN DEFAULT FALSE,
  face_captured_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read and update their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 2. Test the Setup

1. Register a new account
2. Verify OTP
3. Check if the welcome name appears in the navbar
4. Verify that user data is stored in the users table

## Changes Made

### Fixed Issues:
1. **Navbar Welcome Name**: Now fetches user data from the users table and displays first_name
2. **Account Creation**: User data is now stored in Supabase users table
3. **Auto-Login**: After OTP verification, users are automatically logged in and redirected to home

### Files Modified:
- `AuthContext.js`: Added user profile fetching from users table
- `Navbar.js`: Updated to display user's first name from profile data
- `VerifyOTP.js`: Added user data storage and auto-login functionality
- `Register.js`: Added success message for OTP sending
- `create_users_table.sql`: New SQL file to create users table
# Vercel Deployment Guide

## Prerequisites
1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Your code pushed to GitHub

## Step 1: Push to GitHub
```bash
cd coffee-shop-react
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/coffee-shop-web.git
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Vercel CLI (Recommended)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

## Step 3: Environment Variables
In Vercel dashboard, add these environment variables:
- `REACT_APP_SUPABASE_URL`: https://tpehesxkssmdqbjqxovs.supabase.co
- `REACT_APP_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZWhlc3hrc3NtZHFianF4b3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTkxMTYsImV4cCI6MjA4MDMzNTExNn0.cuOVBj2TJbLoPsPnEVOXyUloh2nAb2upyNXHAEp7LM0

## Step 4: Database Setup
Run the SQL from `create_users_table.sql` in your Supabase SQL Editor.

## Files Added for Deployment:
- `vercel.json`: Vercel configuration
- `.env.example`: Environment variables template
- Updated `supabase.js`: Uses environment variables

Your app will be live at: `https://your-project-name.vercel.app`
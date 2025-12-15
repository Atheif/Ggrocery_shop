# Deploy Grocery Shop as Separate Project

## Quick Deploy Steps:

1. **Navigate to project:**
```bash
cd grocery-shop
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

3. **Add Environment Variables** in Vercel dashboard:
   - `REACT_APP_SUPABASE_URL`: https://tpehesxkssmdqbjqxovs.supabase.co
   - `REACT_APP_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwZWhlc3hrc3NtZHFianF4b3ZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NTkxMTYsImV4cCI6MjA4MDMzNTExNn0.cuOVBj2TJbLoPsPnEVOXyUloh2nAb2upyNXHAEp7LM0

4. **Run database setup** from `create_users_table.sql` in Supabase SQL Editor

## Alternative: Use batch script
Double-click `deploy-separate.bat`

Your app will be live at a unique Vercel URL like:
`https://grocery-shop-xyz123.vercel.app`
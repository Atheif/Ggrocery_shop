@echo off
echo Deploying Grocery Shop as separate project...

echo Building project...
npm run build

echo Deploying to Vercel...
vercel --prod

echo.
echo Deployment complete!
echo.
echo Next steps:
echo 1. Add environment variables in Vercel dashboard
echo 2. Run database setup SQL in Supabase
echo.
pause
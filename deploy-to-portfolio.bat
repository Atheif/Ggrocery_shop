@echo off
echo Deploying Coffee Shop to your Vercel portfolio...

set /p PROJECT_NAME="Enter project name (e.g., yourname-coffee-shop): "

echo Building project...
npm run build

echo Deploying to Vercel...
vercel --prod --name %PROJECT_NAME%

echo.
echo Deployment complete!
echo Your coffee shop is now live at: https://%PROJECT_NAME%.vercel.app
echo.
echo Don't forget to:
echo 1. Add environment variables in Vercel dashboard
echo 2. Run the database setup SQL in Supabase
echo.
pause
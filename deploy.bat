@echo off
echo Building and deploying to Vercel...

echo Installing dependencies...
npm install

echo Building the project...
npm run build

echo Deploying to Vercel...
npx vercel --prod

echo Deployment complete!
pause
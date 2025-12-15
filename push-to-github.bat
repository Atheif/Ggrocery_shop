@echo off
echo Pushing Grocery Shop to GitHub...

echo Initializing git repository...
git init

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Initial commit: Grocery Shop with Supabase authentication"

echo Adding remote repository...
git remote add origin https://github.com/Atheif/Ggrocery_shop.git

echo Setting main branch...
git branch -M main

echo Pushing to GitHub...
git push -u origin main

echo.
echo Code pushed successfully to https://github.com/Atheif/Ggrocery_shop
echo.
pause
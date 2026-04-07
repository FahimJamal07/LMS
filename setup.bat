@echo off
echo.
echo 🚀 LMS Development Environment Setup
echo ======================================

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
cd backend
call npm install

if %errorlevel% equ 0 (
  echo ✅ Backend dependencies installed successfully
) else (
  echo ❌ Failed to install backend dependencies
  exit /b 1
)

REM Return to root
cd ..

REM Install frontend dependencies (if needed)
echo.
echo 📦 Installing frontend dependencies...
call npm install

if %errorlevel% equ 0 (
  echo ✅ Frontend dependencies installed successfully
) else (
  echo ❌ Failed to install frontend dependencies
  exit /b 1
)

REM Create .env file if it doesn't exist
echo.
echo ⚙️  Configuring environment variables...

if not exist backend\.env (
  echo NODE_ENV=development > backend\.env
  echo PORT=3000 >> backend\.env
  echo JWT_SECRET=your-super-secret-jwt-key-change-in-production >> backend\.env
  echo JWT_EXPIRY=7d >> backend\.env
  echo ✅ Backend .env created
)

if not exist .env.local (
  (
    echo VITE_USE_BACKEND=true
    echo VITE_BACKEND_URL=http://localhost:3000/api
  ) > .env.local
  echo ✅ Frontend .env.local created
)

echo.
echo ✨ Setup completed!
echo.
echo 📝 Next steps:
echo 1. Terminal 1 - Start backend:  cd backend ^&^& npm run dev
echo 2. Terminal 2 - Start frontend: npm run dev
echo.
echo 🌐 The app will be available at http://localhost:5173
echo 🔌 Backend API at http://localhost:3000/api

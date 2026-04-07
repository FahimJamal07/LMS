#!/bin/bash

echo "🚀 LMS Development Environment Setup"
echo "======================================"

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install

if [ $? -eq 0 ]; then
  echo "✅ Backend dependencies installed successfully"
else
  echo "❌ Failed to install backend dependencies"
  exit 1
fi

# Return to root
cd ..

# Install frontend dependencies (if needed)
echo ""
echo "📦 Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
  echo "✅ Frontend dependencies installed successfully"
else
  echo "❌ Failed to install frontend dependencies"
  exit 1
fi

# Create .env file if it doesn't exist
echo ""
echo "⚙️  Configuring environment variables..."

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env 2>/dev/null || echo "Created backend/.env"
  echo "✅ Backend .env created"
fi

if [ ! -f .env.local ]; then
  cat > .env.local << EOF
VITE_USE_BACKEND=true
VITE_BACKEND_URL=http://localhost:3000/api
EOF
  echo "✅ Frontend .env.local created"
fi

echo ""
echo "✨ Setup completed!"
echo ""
echo "📝 Next steps:"
echo "1. Terminal 1 - Start backend:  cd backend && npm run dev"
echo "2. Terminal 2 - Start frontend: npm run dev"
echo ""
echo "🌐 The app will be available at http://localhost:5173"
echo "🔌 Backend API at http://localhost:3000/api"

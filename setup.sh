#!/bin/bash

echo "🚗 CheapFuel Setup Script"
echo "========================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

echo "✅ Python and Node.js are installed"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found!"
    echo "Please create a .env file in the backend directory with:"
    echo "  GOOGLE_MAPS_API_KEY=your_key_here"
    echo "  SECRET_KEY=your-secret-key"
    echo ""
    read -p "Do you want to create a .env file now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "# CheapFuel Backend Environment Variables" > .env
        echo "" >> .env
        read -p "Enter your Google Maps API Key: " api_key
        echo "GOOGLE_MAPS_API_KEY=$api_key" >> .env
        echo "SECRET_KEY=$(openssl rand -hex 32)" >> .env
        echo "✅ .env file created!"
    fi
fi

cd ..

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies (this may take a few minutes)..."
    npm install
else
    echo "Node modules already installed"
fi

# Create .env.local if it doesn't exist (Next.js)
if [ ! -f ".env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api" > .env.local
    echo "# Add your public Google Maps key (client-side)" >> .env.local
    echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY" >> .env.local
    echo "✅ Frontend .env.local file created"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the application:"
echo "  1. Backend:  cd backend && source venv/bin/activate && python app.py"
echo "  2. Frontend: cd frontend && npm run dev"
echo ""
echo "Or use the run script: ./run.sh"


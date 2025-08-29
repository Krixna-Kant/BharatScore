#!/bin/bash

echo "🚀 Setting up BharatScore React Native Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if React Native CLI is installed
if ! command -v npx react-native &> /dev/null; then
    echo "📦 Installing React Native CLI..."
    npm install -g @react-native-community/cli
fi

echo "✅ React Native CLI installed"

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please update .env file with your actual configuration values"
fi

# Android setup
echo "🤖 Setting up Android configuration..."

# Check if ANDROID_HOME is set
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME environment variable is not set"
    echo "   Please set it to your Android SDK path"
    echo "   Example: export ANDROID_HOME=/path/to/Android/Sdk"
fi

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "⚠️  Java is not installed. Please install JDK 11 or higher"
else
    echo "✅ Java version: $(java -version 2>&1 | head -n 1)"
fi

# iOS setup (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Setting up iOS configuration..."
    
    # Check if Xcode is installed
    if ! command -v xcodebuild &> /dev/null; then
        echo "⚠️  Xcode is not installed. Please install Xcode from the App Store"
    else
        echo "✅ Xcode installed"
        
        # Install iOS dependencies
        if [ -d "ios" ]; then
            echo "📦 Installing iOS dependencies..."
            cd ios && pod install && cd ..
        fi
    fi
else
    echo "ℹ️  iOS setup skipped (not on macOS)"
fi

# Create necessary directories
echo "📁 Creating project structure..."
mkdir -p src/{components,screens,services,hooks,utils}
mkdir -p android/app/src/main/java/com/bharatscore

echo "✅ Project structure created"

# Set up git hooks (if git is available)
if command -v git &> /dev/null; then
    echo "🔧 Setting up git hooks..."
    # Add pre-commit hook for linting
    echo '#!/bin/bash
npm run lint
' > .git/hooks/pre-commit
    chmod +x .git/hooks/pre-commit
    echo "✅ Git hooks configured"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Update .env file with your configuration:"
echo "   - CLERK_PUBLISHABLE_KEY"
echo "   - API_BASE_URL"
echo ""
echo "2. For Android development:"
echo "   - Install Android Studio"
echo "   - Set up Android SDK"
echo "   - Create/start Android emulator"
echo ""
echo "3. For iOS development (macOS only):"
echo "   - Install Xcode"
echo "   - Open ios/BharatScore.xcworkspace"
echo ""
echo "4. Start development:"
echo "   npm start          # Start Metro bundler"
echo "   npm run android    # Run on Android"
echo "   npm run ios        # Run on iOS (macOS only)"
echo ""
echo "📱 Happy coding with BharatScore Mobile!"

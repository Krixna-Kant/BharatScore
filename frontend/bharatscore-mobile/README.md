# BharatScore Mobile App

A React Native mobile application that connects to your existing BharatScore backend and includes SMS reading capabilities for Android devices.

## Features

- **Authentication**: Integrated with Clerk for user management
- **Dashboard**: View Bharat Score and profile information
- **SMS Reading**: Read and analyze SMS messages (Android only)
- **Profile Management**: Update user profile information
- **Application Forms**: Submit loan applications
- **Psychometric Testing**: Take behavioral assessments
- **Real-time Updates**: Live SMS monitoring and score updates

## Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- JDK 11 or higher
- Android SDK (API level 21+)

## Installation

### 1. Clone and Setup

```bash
cd frontend/bharatscore-mobile
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
API_BASE_URL=http://10.0.2.2:8000
```

**Note**: Use `10.0.2.2` for Android emulator or your actual backend IP for physical devices.

### 3. Android Setup

#### Permissions
The app requires the following Android permissions:
- `READ_SMS` - To read SMS messages
- `RECEIVE_SMS` - To receive incoming SMS notifications
- `INTERNET` - To connect to backend APIs
- `ACCESS_NETWORK_STATE` - For network connectivity checks

#### Build Configuration

1. **Update Android Manifest**: Ensure `android/app/src/main/AndroidManifest.xml` includes all required permissions.

2. **Configure Signing**: For production builds, configure app signing in `android/app/build.gradle`.

3. **Build Variants**: The app supports debug and release builds.

### 4. iOS Setup (macOS only)

1. Install iOS dependencies:
```bash
cd ios && pod install && cd ..
```

2. Open `ios/BharatScore.xcworkspace` in Xcode
3. Configure your development team and bundle identifier
4. Build and run on iOS simulator or device

## Running the App

### Development Mode

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Production Build

```bash
# Clean build
npm run clean

# Build Android APK
npm run build-android
```

## SMS Functionality

### Android SMS Reading

The app uses `react-native-get-sms-android` to read SMS messages. Key features:

- **Permission Handling**: Automatic SMS permission requests
- **Message Retrieval**: Read inbox, sent, and draft messages
- **Search Capability**: Search messages by content or sender
- **Real-time Updates**: Monitor incoming SMS messages
- **Data Privacy**: SMS data is processed locally and not stored permanently

### SMS Service Methods

```typescript
import SMSService from '../services/smsService';

// Request permission
const hasPermission = await SMSService.requestSMSPermission();

// Get recent messages
const messages = await SMSService.getRecentSMS(50);

// Search messages
const results = await SMSService.searchSMSByKeyword('bank');

// Get total count
const count = await SMSService.getSMSCount();
```

### Permission Flow

1. User opens SMS screen
2. App requests SMS permission
3. User grants permission
4. App reads and displays messages
5. Real-time SMS monitoring begins

## API Integration

### Backend Connection

The app connects to your existing FastAPI backend using the same endpoints:

- **Profile**: `/profile` (GET/POST)
- **Onboarding**: `/onboard` (POST)
- **Score**: `/score` (GET)
- **Applications**: `/applications` (GET/POST)

### Authentication

Uses Clerk for user authentication with JWT tokens stored in AsyncStorage.

## Testing

### Unit Tests

```bash
npm test
```

### SMS Testing

1. **Android Emulator**: Use Android Studio's SMS simulator
2. **Physical Device**: Send test SMS messages to your device
3. **Permission Testing**: Test permission denial scenarios

### API Testing

1. Ensure backend is running on specified URL
2. Test with valid/invalid authentication tokens
3. Verify error handling for network failures

## Troubleshooting

### Common Issues

1. **Metro Bundler Issues**
   ```bash
   npm start --reset-cache
   ```

2. **Android Build Failures**
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

3. **SMS Permission Denied**
   - Check device settings
   - Ensure app has SMS permission
   - Restart app after granting permission

4. **Backend Connection Issues**
   - Verify API_BASE_URL in .env
   - Check network connectivity
   - Ensure backend CORS settings allow mobile app

### Debug Mode

Enable debug logging:

```typescript
// In services/smsService.ts
console.log('SMS Debug:', messages);
```

## Security Considerations

1. **SMS Data**: Never store SMS content permanently
2. **API Keys**: Use environment variables for sensitive data
3. **Permissions**: Request minimal required permissions
4. **Network**: Use HTTPS for production API calls

## Performance Optimization

1. **SMS Loading**: Implement pagination for large SMS datasets
2. **Image Caching**: Use react-native-fast-image for profile images
3. **API Caching**: Implement React Query caching strategies
4. **Bundle Size**: Use ProGuard for Android release builds

## Deployment

### Android

1. Generate signed APK:
   ```bash
   npm run build-android
   ```

2. Upload to Google Play Store

### iOS

1. Archive in Xcode
2. Upload to App Store Connect

## Contributing

1. Follow React Native best practices
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add unit tests for new features
5. Follow the existing code style

## Support

For technical support or questions:
- Check the troubleshooting section
- Review React Native documentation
- Consult the backend API documentation

## License

This project is part of the BharatScore application suite.

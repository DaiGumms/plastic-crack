# Plastic Crack Mobile App

The React Native mobile application for Plastic Crack - a miniature collection management app.

## 🚀 Features

- **Collection Management**: Organize your miniature collections
- **Photo Capture**: Take photos of your models with the built-in camera
- **Progress Tracking**: Track painting progress and status
- **Search & Filter**: Find models quickly with advanced search
- **Cross-Platform**: Works on both iOS and Android

## 🏗️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 7
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: React Native Elements
- **Storage**: AsyncStorage + SQLite
- **Camera**: Expo Camera
- **Icons**: React Native Vector Icons

## 📦 Installation

1. Install dependencies:

```bash
npm install
```

2. Install Expo CLI globally (if not already installed):

```bash
npm install -g @expo/cli
```

## 🔧 Development

### Start the development server:

```bash
npm start
```

### Run on specific platforms:

```bash
npm run android    # Android emulator/device
npm run ios        # iOS simulator/device (macOS only)
npm run web        # Web browser
```

### Other commands:

```bash
npm run lint       # Run ESLint
npm run lint:fix   # Fix ESLint errors
npm run type-check # TypeScript type checking
```

## 📱 Platform Requirements

### iOS

- iOS 11.0 or later
- Xcode 12.0 or later (for development)
- macOS (for iOS development)

### Android

- Android 6.0 (API level 23) or later
- Android Studio (for development)

## 🏃‍♂️ Quick Start

1. Clone the repository
2. Navigate to the mobile directory
3. Install dependencies: `npm install`
4. Start the development server: `npm start`
5. Use the Expo Go app to scan the QR code and run on your device

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components
├── navigation/     # Navigation configuration
├── screens/        # Screen components
├── services/       # API services and RTK Query
├── store/          # Redux store configuration
├── types/          # TypeScript type definitions
└── utils/          # Utility functions and constants
```

## 🔗 API Integration

The app connects to the Plastic Crack backend API for:

- User authentication
- Collection and model management
- Image upload and storage
- Data synchronization

API endpoints are configured in `src/services/api.ts` using RTK Query.

## 📸 Camera Features

- Photo capture for model documentation
- Image compression and optimization
- Gallery access for existing photos
- Multiple photo support per model

## 🎨 UI/UX

- Material Design components via React Native Elements
- Responsive design for various screen sizes
- Dark/light theme support (planned)
- Intuitive navigation with bottom tabs

## 🚧 Development Status

This is part of Issue #8 - React Native project initialization. Current status:

- [x] React Native project with TypeScript
- [x] React Navigation setup
- [x] Redux Toolkit configuration
- [x] RTK Query for API calls
- [x] React Native Elements UI library
- [x] Platform-specific configurations
- [x] Project structure and basic navigation
- [ ] Authentication screens (Issue #12)
- [ ] Main app screens (Issue #13)
- [ ] Camera integration (Issue #26)

## 🤝 Contributing

1. Follow the established project structure
2. Use TypeScript for all new files
3. Follow React Native and Expo best practices
4. Add proper type definitions
5. Test on both iOS and Android platforms

## 📚 Documentation

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Redux Toolkit](https://redux-toolkit.js.org/)

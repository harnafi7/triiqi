# Triiqi APK Build Guide

This guide provides step-by-step instructions for building an Android APK from your Triiqi web application using Expo EAS Build.

## Prerequisites

1. An Expo account (sign up at https://expo.dev/signup)
2. Node.js installed on your local machine
3. A copy of the Triiqi logo (the existing generated-icon.png)

## Step 1: Create a New Expo Project Locally

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Create a new Expo project
npx create-expo-app triiqi-mobile

# Navigate to the project
cd triiqi-mobile
```

## Step 2: Configure the Project to Use WebView

1. Install required dependencies:

```bash
npm install react-native-webview
```

2. Replace the contents of App.js with this WebView wrapper:

```jsx
import React from 'react';
import { SafeAreaView, Text, StatusBar, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  // The app URL (your deployed Replit app)
  const appUrl = 'https://triiqi.replit.app';
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <WebView
        source={{ uri: appUrl }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading Triiqi...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView error: ', nativeEvent);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: 18,
    color: '#FF8800', // Triiqi orange color
    marginTop: 10,
  },
});
```

## Step 3: Configure App Information

1. Update the `app.json` file:

```json
{
  "expo": {
    "name": "Triiqi",
    "slug": "triiqi",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "androidStatusBar": {
      "backgroundColor": "#000000",
      "barStyle": "light-content"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.triiqi.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.triiqi.app"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": []
  }
}
```

## Step 4: Add the Triiqi Logo as App Icons

1. Copy your `generated-icon.png` to the following locations:
   - `./assets/icon.png` (1024x1024 px)
   - `./assets/splash.png` (2048x2048 px)
   - `./assets/adaptive-icon.png` (1024x1024 px)
   - `./assets/favicon.png` (48x48 px)

2. You may need to resize the images if necessary.

## Step 5: Install EAS CLI and Configure Build

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Log in to your Expo account:

```bash
eas login
```

3. Initialize EAS Build:

```bash
eas build:configure
```

4. Create an `eas.json` file:

```json
{
  "cli": {
    "version": ">= 5.9.3"
  },
  "build": {
    "development": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Step 6: Build the APK

1. Run the build command:

```bash
eas build -p android --profile preview
```

2. Follow the prompts from EAS CLI:
   - Choose to generate a new keystore if prompted
   - Wait for the build to complete (10-15 minutes typically)

3. Once the build is complete, EAS will provide a URL where you can download your APK file.

## Step 7: Install and Test the APK

1. Download the APK file from the provided URL
2. Transfer it to your Android device
3. Install the APK by tapping on it (you may need to enable installation from unknown sources in your device settings)
4. Open the Triiqi app

## Notes

- The WebView approach means your app is essentially loading the web version of Triiqi
- Ensure your web application is mobile-responsive
- You can set up push notifications and other native features by adding Expo plugins if needed in the future

## Troubleshooting

- If the app fails to load, check that your web URL is correct and accessible
- If you encounter build errors, check the EAS build logs for details
- For more advanced configurations, refer to the [Expo documentation](https://docs.expo.dev/)
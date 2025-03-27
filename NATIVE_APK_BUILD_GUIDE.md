# Triiqi Native Android App Build Guide

This guide provides detailed instructions for building a fully native React Native Android app for Triiqi. Unlike a WebView approach, this guide will help you create a true native application that uses React Native components.

## Prerequisites

1. Node.js and npm installed on your development machine
2. An Expo account (sign up at https://expo.dev/signup)
3. Android Studio (for testing with an emulator, optional)
4. Your Triiqi icon image (for app icons)

## Step 1: Set Up the Development Environment

First, install the necessary command-line tools:

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Install EAS CLI for building
npm install -g eas-cli

# Log in to your Expo account
eas login
```

## Step 2: Create a New React Native Project

Create a new React Native project using Expo's TypeScript template:

```bash
# Create a new project
npx create-expo-app triiqi-native --template blank-typescript

# Navigate to the project directory
cd triiqi-native
```

## Step 3: Install Essential Dependencies

Install the core dependencies needed for the app:

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context

# UI and Components
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-maps react-native-svg
npm install @react-native-picker/picker @react-native-community/datetimepicker

# API and State Management
npm install @tanstack/react-query axios
npm install @react-native-async-storage/async-storage

# Utilities
npm install date-fns
```

## Step 4: Configure the Project Structure

Create the essential project directories:

```bash
mkdir -p src/api
mkdir -p src/components
mkdir -p src/screens
mkdir -p src/navigation
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/styles
mkdir -p src/assets
mkdir -p src/types
```

## Step 5: Set Up the Theme and Styles

Create a theme file that matches your web app's colors and styles:

```typescript
// src/styles/theme.ts
export const colors = {
  primary: '#FF8800',        // Triiqi Orange
  primaryLight: '#FFA940',
  secondary: '#333333',
  accent: '#4CAF50',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  error: '#B00020',
  success: '#4CAF50',
  warning: '#FFC107',
  text: {
    primary: '#333333',
    secondary: '#757575',
    disabled: '#9E9E9E',
    inverse: '#FFFFFF',
  },
  border: '#E0E0E0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  h3: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
  },
  caption: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  button: {
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export const shadow = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
};
```

## Step 6: Set Up the API Client

Create an API client to connect to your Triiqi backend:

```typescript
// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual API URL
const API_URL = 'https://triiqi.replit.app/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authentication token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

## Step 7: Implement Authentication

Set up authentication functionality:

```typescript
// src/hooks/useAuth.ts
import { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/client';

type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          const response = await apiClient.get('/user');
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to load user', error);
        await AsyncStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      await AsyncStorage.setItem('auth_token', response.data.token);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    await AsyncStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Step 8: Create Basic Reusable Components

Create base UI components that match your web app:

```typescript
// src/components/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, typography, spacing } from '../styles/theme';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
};

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? colors.primary : colors.text.inverse} 
          size="small" 
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  small: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  medium: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  large: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.button,
  },
  primaryText: {
    color: colors.text.inverse,
  },
  secondaryText: {
    color: colors.text.inverse,
  },
  outlineText: {
    color: colors.primary,
  },
});
```

## Step 9: Set Up Navigation

Configure the app's navigation structure:

```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../styles/theme';

// Import screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { RideDetailsScreen } from '../screens/RideDetailsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ChatScreen } from '../screens/ChatScreen';

// Import icons
import { Feather } from '@expo/vector-icons';

// Define navigation types
type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  RideDetails: { rideId: number };
  Booking: { rideId: number };
  Chat: { userId: number };
};

type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Bookings: undefined;
  Profile: undefined;
  Messages: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Loading component
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// Main tabs when logged in
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Search') {
          iconName = 'search';
        } else if (route.name === 'Bookings') {
          iconName = 'calendar';
        } else if (route.name === 'Profile') {
          iconName = 'user';
        } else if (route.name === 'Messages') {
          iconName = 'message-square';
        }
        return <Feather name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.text.secondary,
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
  </Tab.Navigator>
);

// Root navigator
export const AppNavigator = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: colors.text.inverse,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {user ? (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabs} 
              options={{ headerShown: false }}
            />
            <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

## Step 10: Implement Basic Screens

Create the essential screens for your app:

### Login Screen
```typescript
// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, typography } from '../styles/theme';
import { Button } from '../components/Button';

export const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    try {
      const success = await login(username, password);
      if (!success) {
        Alert.alert('Login Failed', 'Invalid username or password');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Triiqi</Text>
        <Text style={styles.tagline}>Your ride-sharing companion</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Enter your username"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        <Button
          title="Login"
          onPress={handleLogin}
          loading={loading}
          fullWidth
        />

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerTextHighlight}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.sm,
  },
  appName: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  formContainer: {
    padding: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 16,
  },
  registerLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  registerText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  registerTextHighlight: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});
```

### Home Screen
```typescript
// src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadow } from '../styles/theme';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import { Button } from '../components/Button';
import { Feather } from '@expo/vector-icons';

const fetchRecentRides = async () => {
  const response = await apiClient.get('/rides/recent');
  return response.data;
};

export const HomeScreen = ({ navigation }) => {
  const { data: recentRides, isLoading } = useQuery({
    queryKey: ['recentRides'],
    queryFn: fetchRecentRides,
    placeholderData: [],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Welcome to Triiqi</Text>
          <Text style={styles.subGreeting}>Where do you want to go today?</Text>
        </View>

        <View style={styles.searchCard}>
          <Text style={styles.searchTitle}>Find a Ride</Text>
          <Button 
            title="Search Rides" 
            onPress={() => navigation.navigate('Search')}
            size="large"
            fullWidth
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Rides</Text>
          
          {isLoading ? (
            <Text style={styles.loadingText}>Loading rides...</Text>
          ) : recentRides.length > 0 ? (
            recentRides.map((ride) => (
              <TouchableOpacity
                key={ride.id}
                style={styles.rideCard}
                onPress={() => navigation.navigate('RideDetails', { rideId: ride.id })}
              >
                <View style={styles.routeInfo}>
                  <Text style={styles.cityName}>{ride.departureCity}</Text>
                  <View style={styles.routeLine}>
                    <Feather name="circle" size={12} color={colors.primary} />
                    <View style={styles.line} />
                    <Feather name="map-pin" size={12} color={colors.primary} />
                  </View>
                  <Text style={styles.cityName}>{ride.arrivalCity}</Text>
                </View>
                
                <View style={styles.rideDetails}>
                  <View style={styles.detailItem}>
                    <Feather name="calendar" size={16} color={colors.text.secondary} />
                    <Text style={styles.detailText}>
                      {new Date(ride.departureDate).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Feather name="clock" size={16} color={colors.text.secondary} />
                    <Text style={styles.detailText}>
                      {new Date(ride.departureDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Feather name="user" size={16} color={colors.text.secondary} />
                    <Text style={styles.detailText}>
                      {ride.availableSeats} seats
                    </Text>
                  </View>
                </View>
                
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>{ride.costPerSeat} MAD</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noRidesText}>No recent rides found</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
    color: colors.primary,
  },
  subGreeting: {
    ...typography.body,
    color: colors.text.secondary,
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadow.medium,
  },
  searchTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  noRidesText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
  rideCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.small,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cityName: {
    ...typography.h3,
    flex: 1,
  },
  routeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.xs,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...typography.caption,
    marginLeft: spacing.xs,
  },
  priceContainer: {
    alignSelf: 'flex-end',
  },
  price: {
    ...typography.h3,
    color: colors.primary,
  },
});
```

## Step 11: Set Up the App Entry Point

Update the App.js file to include your navigation and providers:

```jsx
// App.js
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/hooks/useAuth';
import { AppNavigator } from './src/navigation/AppNavigator';

// Create a client
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

## Step 12: Add App Icons

1. Create an `assets` folder in your project
2. Add the Triiqi logo from your project:
   - Copy to `./assets/icon.png` (1024x1024 px)
   - Create a splash screen image at `./assets/splash.png` (2048x2048 px)
   - Create an adaptive icon at `./assets/adaptive-icon.png` (1024x1024 px)
   - Create a favicon at `./assets/favicon.png` (48x48 px)

3. Also copy the icon to `./src/assets/icon.png` for use within the app

## Step 13: Configure app.json

Update the app.json file with your app's configuration:

```json
{
  "expo": {
    "name": "Triiqi",
    "slug": "triiqi-native",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
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
      "package": "com.triiqi.app",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Step 14: Configure eas.json

Create an eas.json file for EAS Build configuration:

```json
{
  "cli": {
    "version": ">= 5.9.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
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

## Step 15: Build the APK

Now you're ready to build your APK:

```bash
# Configure EAS Build
eas build:configure

# Build the APK for Android
eas build -p android --profile preview
```

During the build process:
1. EAS will upload your code to Expo's build servers
2. A Cloud build will be initiated
3. You'll receive a link to track the build progress
4. After the build completes (10-15 minutes), you'll receive a download link for the APK

## Step 16: Install and Test

1. Download the APK from the provided link
2. Transfer it to your Android device
3. Install the APK (enable "Install from Unknown Sources" if prompted)
4. Test the app thoroughly

## Continuing Development

After your initial build, you can continue developing the app by:

1. Implementing more screens (Bookings, Ride Details, etc.)
2. Adding more complex features (Maps, Real-time chat, etc.)
3. Refining the UI and UX

For subsequent builds, simply run:
```bash
eas build -p android --profile preview
```

## Troubleshooting

- **Build Failures**: Check the EAS build logs for detailed error information
- **API Connection Issues**: Verify your backend URL and ensure it's accessible
- **UI Rendering Problems**: Ensure proper usage of React Native components
- **Navigation Errors**: Verify your navigation configuration and screen imports

## Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [TanStack Query Documentation](https://tanstack.com/query/latest/docs/react/overview)
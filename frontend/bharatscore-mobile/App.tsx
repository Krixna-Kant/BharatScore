import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Import screens
import LandingScreen from './src/screens/LandingScreen';
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ApplyScreen from './src/screens/ApplyScreen';
import PsychometricTestScreen from './src/screens/PsychometricTestScreen';
import ApplicationsScreen from './src/screens/ApplicationsScreen';
import SupportScreen from './src/screens/SupportScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import SMSScreen from './src/screens/SMSScreen';
import RedirectorScreen from './src/screens/RedirectorScreen';

// Import components
import CustomDrawerContent from './src/components/CustomDrawerContent';
import TabBarIcon from './src/components/TabBarIcon';

const queryClient = new QueryClient();
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Tab Navigator for authenticated users
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => (
          <TabBarIcon route={route} focused={focused} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Apply" 
        component={ApplyScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="SMS" 
        component={SMSScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

// Drawer Navigator for additional screens
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
      <Drawer.Screen name="PsychometricTest" component={PsychometricTestScreen} />
      <Drawer.Screen name="Applications" component={ApplicationsScreen} />
      <Drawer.Screen name="Support" component={SupportScreen} />
      <Drawer.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    </Drawer.Navigator>
  );
}

// Main Stack Navigator
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Redirector" component={RedirectorScreen} />
      <Stack.Screen name="MainApp" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ClerkProvider publishableKey={process.env.CLERK_PUBLISHABLE_KEY || ''}>
            <NavigationContainer>
              <SignedOut>
                <AppNavigator />
              </SignedOut>
              <SignedIn>
                <AppNavigator />
              </SignedIn>
            </NavigationContainer>
          </ClerkProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

// Import your screens
import WelcomeScreen from './screens/WelcomeScreen';
import AdminLoginScreen from './screens/AdminLoginScreen';
import ScannerScreen from './screens/ScannerScreen';
import DeviceFormScreen from './screens/DeviceFormScreen';  
import ImageCaptureScreen from './screens/ImageCaptureScreen';
import SuccessScreen from './screens/SuccessScreen';
import AdminDashboard from './screens/AdminDashboard';
import KnoxStatusBadge from './components/KnoxStatusBadge';
import useStore from './services/store';

const Stack = createStackNavigator();

export default function App() {
  const hydrate = useStore((state) => state.hydrate);
  const hydrated = useStore((state) => state.hydrated);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrate, hydrated]);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#2196F3',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminLogin" 
            component={AdminLoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Scanner" 
            component={ScannerScreen}
            options={{ title: 'Scan Barcode' }}
          />
          <Stack.Screen 
            name="DeviceForm" 
            component={DeviceFormScreen}
            options={{ title: 'Device Details' }}
          />
          <Stack.Screen 
            name="ImageCapture" 
            component={ImageCaptureScreen}
            options={{ title: 'Capture Images' }}
          />
          <Stack.Screen 
            name="Success" 
            component={SuccessScreen}
            options={{ title: 'Success' }}
          />
          <Stack.Screen 
            name="AdminDashboard" 
            component={AdminDashboard}
            options={{ title: 'Admin Dashboard' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <View style={styles.statusBadgeContainer}>
        <KnoxStatusBadge />
      </View>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBadgeContainer: {
    position: 'absolute',
    top: 40,
    right: 16,
  },
});
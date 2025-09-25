import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

// Import your screens
import ScannerScreen from './screens/ScannerScreen';
import DeviceFormScreen from './screens/DeviceFormScreen';  
import ImageCaptureScreen from './screens/ImageCaptureScreen';
import SuccessScreen from './screens/SuccessScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Scanner"
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
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
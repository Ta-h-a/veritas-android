//react-native/app/screens/SuccessScreen.js

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function SuccessScreen({ navigation }) {
  const handleStartOver = () => {
    // Reset to welcome screen to maintain proper flow
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleGoHome = () => {
    navigation.navigate('Welcome');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.title}>Device Registered Successfully!</Text>
        <Text style={styles.message}>
          Your device has been registered and submitted for verification. 
          An administrator will review and approve your submission.
        </Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Register Another Device" 
            onPress={handleStartOver}
            color="#4CAF50"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button 
            title="Go to Home" 
            onPress={handleGoHome}
            color="#2196F3"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 200,
    marginBottom: 15,
  },
});
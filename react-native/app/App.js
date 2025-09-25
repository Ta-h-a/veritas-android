// Temporary simple App.js to test setup
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [count, setCount] = React.useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Veritas Device App</Text>
      <Text style={styles.text}>Setup Test</Text>
      <Text style={styles.counter}>Count: {count}</Text>
      <Button 
        title="Test Button" 
        onPress={() => setCount(count + 1)}
        color="#2196F3"
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2196F3',
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  counter: {
    fontSize: 16,
    marginBottom: 20,
  },
});
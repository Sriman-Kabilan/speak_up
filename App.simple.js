import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function App() {
  const handlePress = () => {
    Alert.alert('Success!', 'SpeakUp mobile app is working!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎙️ SpeakUp</Text>
      <Text style={styles.subtitle}>English Pronunciation Training</Text>
      
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>Test App</Text>
      </TouchableOpacity>
      
      <View style={styles.info}>
        <Text style={styles.infoText}>✅ React Native: Working</Text>
        <Text style={styles.infoText}>✅ Expo SDK 51: Working</Text>
        <Text style={styles.infoText}>✅ Mobile Ready: Yes</Text>
      </View>
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
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 50,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
});
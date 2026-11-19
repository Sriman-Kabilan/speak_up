import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/Button';

export default function HomeScreen({ navigation }) {

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.micIcon}>🎙️</Text>
      </View>
      <Text style={styles.title}>SpeakUp</Text>
      <Text style={styles.subtitle}>Master English Pronunciation</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Start Learning"
          onPress={() => navigation.navigate('Lessons')}
        />
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
  logoContainer: {
    marginBottom: 20,
  },
  micIcon: {
    fontSize: 80,
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
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  seedButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  seedText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
  },
  upgradeText: {
    fontSize: 14,
    color: '#4caf50',
    textDecorationLine: 'underline',
  },
  seedLoader: {
    marginTop: 20,
  },
  seedMessage: {
    fontSize: 14,
    marginBottom: 10,
    color: '#333',
  },
});

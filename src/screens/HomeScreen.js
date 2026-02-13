import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { seedFirestore } from '../services/seedData';
import Button from '../components/Button';

export default function HomeScreen({ navigation }) {
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage('');
    const result = await seedFirestore();
    setSeeding(false);
    setSeedMessage(result.success ? '✅ Database seeded!' : '❌ Error: ' + (result.error || 'Unknown error'));
    setTimeout(() => setSeedMessage(''), 3000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.micIcon}>🎙️</Text>
      </View>
      <Text style={styles.title}>SpeakUp</Text>
      <Text style={styles.subtitle}>Master English Pronunciation</Text>
      
      {seedMessage ? (
        <Text style={styles.seedMessage}>{seedMessage}</Text>
      ) : null}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Start Learning"
          onPress={() => navigation.navigate('Lessons')}
        />
        
        {seeding ? (
          <ActivityIndicator size="small" color="#2196F3" style={styles.seedLoader} />
        ) : (
          <TouchableOpacity onPress={handleSeed} style={styles.seedButton}>
            <Text style={styles.seedText}>Seed Database</Text>
          </TouchableOpacity>
        )}
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
  seedLoader: {
    marginTop: 20,
  },
  seedMessage: {
    fontSize: 14,
    marginBottom: 10,
    color: '#333',
  },
});

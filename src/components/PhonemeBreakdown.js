import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

export default function PhonemeBreakdown({ phonemes, visible, onClose, onPlayPhoneme }) {
  const [selectedPhoneme, setSelectedPhoneme] = useState(null);

  const getSeverityColor = (severity) => {
    if (severity === 0) return '#4caf50'; // Correct - green
    if (severity === 1) return '#ffeb3b'; // Minor - yellow
    if (severity === 2) return '#ff9800'; // Moderate - orange
    if (severity === 3) return '#ff5722'; // Significant - deep orange
    return '#f44336'; // Critical - red
  };

  const getSeverityLabel = (severity) => {
    if (severity === 0) return 'Correct';
    if (severity === 1) return 'Minor Issue';
    if (severity === 2) return 'Moderate Issue';
    if (severity === 3) return 'Significant Issue';
    return 'Critical Issue';
  };

  const handlePhonemePress = (phoneme) => {
    setSelectedPhoneme(phoneme);
  };

  const handlePlayAudio = (type) => {
    if (onPlayPhoneme && selectedPhoneme) {
      onPlayPhoneme(selectedPhoneme.phoneme, type);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🔤 Phoneme Breakdown</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.phonemeGrid}>
            {phonemes && phonemes.map((phoneme, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.phonemeBlock,
                  { backgroundColor: getSeverityColor(phoneme.severity) }
                ]}
                onPress={() => handlePhonemePress(phoneme)}
              >
                <Text style={styles.phonemeSymbol}>{phoneme.phoneme}</Text>
                <Text style={styles.phonemeLabel}>{phoneme.readable}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedPhoneme && (
            <View style={styles.detailPanel}>
              <Text style={styles.detailTitle}>
                {selectedPhoneme.phoneme} - {selectedPhoneme.readable}
              </Text>
              <Text style={styles.detailStatus}>
                Status: {getSeverityLabel(selectedPhoneme.severity)}
              </Text>
              
              {selectedPhoneme.isIncorrect && (
                <View style={styles.audioControls}>
                  <Text style={styles.audioTitle}>🎧 Practice Audio</Text>
                  <TouchableOpacity 
                    style={styles.audioButton}
                    onPress={() => handlePlayAudio('isolated')}
                  >
                    <Text style={styles.audioButtonText}>▶️ Isolated Sound</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.audioButton}
                    onPress={() => handlePlayAudio('slow')}
                  >
                    <Text style={styles.audioButtonText}>🐢 Slow Pronunciation</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.audioButton}
                    onPress={() => handlePlayAudio('articulation')}
                  >
                    <Text style={styles.audioButtonText}>👄 How to Articulate</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          <View style={styles.legend}>
            <Text style={styles.legendTitle}>Color Guide:</Text>
            <View style={styles.legendRow}>
              <View style={[styles.legendBox, { backgroundColor: '#4caf50' }]} />
              <Text style={styles.legendText}>Correct</Text>
              <View style={[styles.legendBox, { backgroundColor: '#ffeb3b' }]} />
              <Text style={styles.legendText}>Minor</Text>
              <View style={[styles.legendBox, { backgroundColor: '#ff9800' }]} />
              <Text style={styles.legendText}>Moderate</Text>
              <View style={[styles.legendBox, { backgroundColor: '#f44336' }]} />
              <Text style={styles.legendText}>Critical</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#666',
  },
  phonemeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  phonemeBlock: {
    padding: 12,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
    elevation: 2,
  },
  phonemeSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  phonemeLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  detailPanel: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailStatus: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  audioControls: {
    marginTop: 12,
  },
  audioTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  audioButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },
  audioButtonText: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
    marginRight: 12,
  },
});

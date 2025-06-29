import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type DailyProgressBarProps = {
  consumed: number;
  goal: number;
  color?: string; // optional to maintain backward compatibility
};

export default function DailyProgressBar({
  consumed,
  goal,
  color = '#66bb6a', // default green
}: DailyProgressBarProps) {
  const progress = Math.min(consumed / goal, 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Progress</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.percentage}>{Math.round(progress * 100)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#2E7D32',
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  percentage: {
    marginTop: 4,
    fontSize: 14,
    textAlign: 'right',
    color: '#444',
  },
});

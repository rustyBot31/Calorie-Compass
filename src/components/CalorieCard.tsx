// src/components/CalorieCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type CalorieCardProps = {
  consumed?: number;
  calories?: number;
  goal?: number;
};

export default function CalorieCard({ consumed, calories, goal }: CalorieCardProps) {
  const display = calories ?? consumed ?? 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Calories</Text>
      <Text style={styles.value}>{display} kcal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
  },
  percentage: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
});

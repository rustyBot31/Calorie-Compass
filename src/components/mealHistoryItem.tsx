import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';

interface MealHistoryItemProps {
  meal: string;
  calories: number;
  timestamp: string; // ISO string
}

export default function MealHistoryItem({ meal, calories, timestamp }: MealHistoryItemProps) {
  const formattedTime = dayjs(timestamp).format('ddd, MMM D, YYYY, h:mm A');
  return (
    <View style={styles.container}>
      <Text style={styles.meal}>{meal}</Text>
      <Text style={styles.details}>
        🔥 {calories} kcal · 🕒 {formattedTime}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
    backgroundColor: '#f0f4f0',
  },
  meal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  details: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
  },
});

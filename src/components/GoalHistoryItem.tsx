// components/GoalHistoryItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import dayjs from 'dayjs';

interface GoalHistoryItemProps {
  date: string;
  goal: number;
  consumed: number;
}

export default function GoalHistoryItem({ date, goal, consumed }: GoalHistoryItemProps) {
  const formattedDate = dayjs(date).format('dddd, MMM D, YYYY');
  const stayedUnder = consumed <= goal;

  return (
    <View style={[styles.container, stayedUnder ? styles.success : styles.danger]}>
      <Text style={styles.date}>{formattedDate}</Text>
      <Text style={styles.info}>
        🎯 Goal: {goal} kcal | 🔥 Consumed: {consumed} kcal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
  },
  success: {
    backgroundColor: '#e0f5e0', // Light green
  },
  danger: {
    backgroundColor: '#fbeaea', // Light red
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  info: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
  },
});

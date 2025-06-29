import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export type TipCardProps = {
  tip?: string;
  extraTip?: string;
  showAITitle?: boolean;
  showGeneralTitle?: boolean;
  color?: string; // NEW: For dynamic coloring
};

export default function TipCard({
  tip,
  extraTip,
  showAITitle = true,
  showGeneralTitle = false,
  color = '#4CAF50', // Default green
}: TipCardProps) {
  if (!tip && !extraTip) return null;

  return (
    <View style={[styles.card, { backgroundColor: color + '22', borderColor: color }]}>
      {tip && (
        <>
          {showAITitle && <Text style={[styles.title, { color }]}>{'AI Tip'}</Text>}
          <Text style={styles.tip}>{tip}</Text>
        </>
      )}

      {tip && extraTip && <View style={styles.divider} />}

      {extraTip && (
        <>
          {showGeneralTitle && <Text style={[styles.title, { color }]}>{'General Tip'}</Text>}
          <Text style={styles.extraTip}>{extraTip}</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  tip: {
    fontSize: 14,
    color: '#444',
  },
  extraTip: {
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  divider: {
    height: 12,
  },
});

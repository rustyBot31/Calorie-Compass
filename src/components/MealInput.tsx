import React from 'react';
import { View, TextInput, StyleSheet, Button } from 'react-native';

type MealInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
};

export default function MealInput({ value, onChangeText, onSubmit }: MealInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Describe your meal..."
        multiline
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  buttonContainer: {
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  
});

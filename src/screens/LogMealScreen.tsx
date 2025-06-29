import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import MealInput from '../components/MealInput';
import CalorieCard from '../components/CalorieCard';
import TipCard from '../components/TipCard';

import {
  previewCalories,
  saveMealToBackend,
  getTodayStatus,
  getDailyGoal,
} from '../utils/geminiApi';

import { getCurrentUserUid } from '../utils/firebaseAuthApi';

export default function LogMealScreen() {
  const [meal, setMeal] = useState('');
  const [calories, setCalories] = useState(null);
  const [tip, setTip] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [totalCaloriesToday, setTotalCaloriesToday] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(null);

  // Refresh status and goal when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchStatusAndGoal();
    }, [])
  );

  const fetchStatusAndGoal = async () => {
    try {
      const uid = await getCurrentUserUid();
      if (!uid) return;

      const { totalCalories } = await getTodayStatus(uid);
      const { goal } = await getDailyGoal(uid);

      setTotalCaloriesToday(totalCalories);
      setDailyGoal(goal);
    } catch (err) {
      console.error('Error fetching status or goal:', err);
    }
  };

  const handlePreview = async () => {
    if (!meal.trim()) return;
    setLoading(true);
    setCalories(null);
    setTip('');
    setAccepted(false);
    setStatusMessage(null);

    try {
      const { calories, tip } = await previewCalories(meal);
      setCalories(calories);
      setTip(tip);
    } catch (err) {
      console.error('Preview error:', err);
      setTip('⚠️ Failed to estimate. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setLoading(true);
    try {
      const uid = await getCurrentUserUid();
      if (!uid) throw new Error('User not logged in');

      await saveMealToBackend(uid, meal);
      setAccepted(true);
      setStatusMessage('✅ Meal saved!');
      await fetchStatusAndGoal();
    } catch (err) {
      console.error('Save error:', err);
      setStatusMessage('❌ Meal not saved.');
    } finally {
      setLoading(false);
      setTimeout(() => handleReset(), 1800);
    }
  };

  const handleReset = () => {
    setMeal('');
    setCalories(null);
    setTip('');
    setAccepted(false);
    setStatusMessage(null);
  };

  const renderStatusText = () => {
    if (totalCaloriesToday === null || dailyGoal === null) return null;

    const remaining = dailyGoal - totalCaloriesToday;

    if (remaining <= 0) {
      return (
        <Text style={[styles.statusText, { color: 'red' }]}>
          ⚠️ You've exceeded your daily goal!
        </Text>
      );
    } else if (remaining < 150) {
      return (
        <Text style={[styles.statusText, { color: '#fb8c00' }]}>
          ⚠️ Close to your daily limit: {remaining} kcal left
        </Text>
      );
    } else {
      return (
        <Text style={[styles.statusText, { color: '#2e7d32' }]}>
          ✅ {remaining} kcal remaining today
        </Text>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.header}>Log Your Meal 🍽️</Text>

      <MealInput value={meal} onChangeText={setMeal} onSubmit={handlePreview} />

      <TouchableOpacity style={styles.logButton} onPress={handlePreview} disabled={loading}>
        <Text style={styles.logButtonText}>
          {loading ? 'Estimating...' : 'Log Meal'}
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#66bb6a" style={{ marginTop: 16 }} />}

      {renderStatusText()}

      {calories !== null && (
        <View style={styles.resultContainer}>
          <CalorieCard calories={calories} />
          {tip ? <TipCard tip={tip} /> : null}

          {!accepted ? (
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.acceptButtonText}>✅ Accept Meal</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.acceptedText}>Meal accepted and saved!</Text>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {statusMessage && (
        <Text style={styles.statusMessage}>{statusMessage}</Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f4fdf4',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 12,
  },
  logButton: {
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
  logButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: '#ff8a65',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  acceptedText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 12,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});

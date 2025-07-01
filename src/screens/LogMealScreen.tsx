import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MealInput from '../components/MealInput';
import CalorieCard from '../components/CalorieCard';
import TipCard from '../components/TipCard';
import {
  previewCalories,
  saveMealToBackend,
  getTodayStatus,
} from '../utils/geminiApi';
import { getDailyGoal } from '../utils/goalApi';
import { getCurrentUserUid } from '../utils/firebaseAuthApi';

export default function LogMealScreen() {
  const [meal, setMeal] = useState('');
  const [calories, setCalories] = useState<number | null>(null);
  const [tip, setTip] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [totalCaloriesToday, setTotalCaloriesToday] = useState<number | null>(null);
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);

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
      const res = await getDailyGoal(uid);
      const goal = res ? res.goal : 0;

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
    if (dailyGoal === 0) {
      return (
        <Text style={[styles.statusText, { color: '#2E7D32' }]}>
          Set your goal for today!
        </Text>
      );
    }

    const remaining = dailyGoal - totalCaloriesToday;

    if (remaining <= 0) {
      return (
        <Text style={[styles.statusText, { color: '#d32f2f' }]}>
          ⚠️ You've exceeded your daily goal!
        </Text>
      );
    } else if (remaining < 150) {
      return (
        <Text style={[styles.statusText, { color: '#f57c00' }]}>
          ⚠️ Close to your daily limit: {remaining} kcal left
        </Text>
      );
    } else {
      return (
        <Text style={[styles.statusText, { color: '#388e3c' }]}>
          ✅ {remaining} kcal remaining today
        </Text>
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.outer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#f4fdf4',
  },
  container: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 16,
  },
  logButton: {
    backgroundColor: '#66bb6a',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
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
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 1,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
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
    backgroundColor: '#ff7043',
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
    color: '#388e3c',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 14,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 24,
    color: '#333',
  },
});

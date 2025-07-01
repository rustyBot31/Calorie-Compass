import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveDailyGoal, getDailyGoal, getRecentGoalsWithStatus } from '../utils/goalApi';
import GoalHistoryItem from '../components/GoalHistoryItem';

export default function SetGoalScreen() {
  const [goal, setGoal] = useState('');
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLockedForToday, setIsLockedForToday] = useState(false);
  const [recentGoals, setRecentGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGoalData = async () => {
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) return;

    try {
      const goalData = await getDailyGoal(uid);
      const today = new Date().toISOString().split('T')[0];
      if (goalData && goalData.date === today) {
        setGoal(goalData.goal.toString());
        setLocked(goalData.locked);
        setIsLockedForToday(goalData.locked);
      } else {
        setGoal('');
        setLocked(false);
        setIsLockedForToday(false);
      }

      const recent = await getRecentGoalsWithStatus(uid);
      setRecentGoals(recent);
    } catch (error) {
      console.error('Error loading goal or history:', error);
    } finally {
      setGoalsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadGoalData();
  }, []);

  const handleSaveGoal = async () => {
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) return Alert.alert('Error', 'User not found.');

    const parsedGoal = parseInt(goal);
    if (isNaN(parsedGoal)) return Alert.alert('Error', 'Please enter a valid number.');

    try {
      setLoading(true);
      await saveDailyGoal(uid, parsedGoal, locked);
      Alert.alert('Success', locked ? 'Goal saved and locked for today!' : 'Goal saved!');
      setIsLockedForToday(locked);

      const updatedGoals = await getRecentGoalsWithStatus(uid);
      setRecentGoals(updatedGoals);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => {
          setRefreshing(true);
          loadGoalData();
        }} />
      }
    >
      <Text style={styles.title}>🎯 Set Your Daily Calorie Goal</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Your Goal (kcal):</Text>
        <TextInput
          style={[styles.input, isLockedForToday && styles.disabledInput]}
          value={goal}
          onChangeText={setGoal}
          keyboardType="numeric"
          editable={!isLockedForToday}
          placeholder="e.g., 2200"
          placeholderTextColor="#aaa"
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Lock Goal for Today</Text>
          <Switch
            value={locked}
            onValueChange={setLocked}
            disabled={isLockedForToday}
            thumbColor={locked ? '#ffffff' : '#f4f3f4'}
            trackColor={{ false: '#ccc', true: '#66bb6a' }}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (loading || isLockedForToday) && styles.disabledButton,
          ]}
          onPress={handleSaveGoal}
          disabled={loading || isLockedForToday}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Goal'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.historyHeader}>📅 Past 7 Locked Goals</Text>

      {goalsLoading ? (
        <ActivityIndicator size="large" color="#66bb6a" style={{ marginTop: 16 }} />
      ) : recentGoals.length === 0 ? (
        <Text style={styles.noData}>No locked goals to show yet.</Text>
      ) : (
        recentGoals.map((item, index) => (
          <GoalHistoryItem
            key={index}
            date={item.date}
            goal={item.goal}
            consumed={item.totalCalories ?? 0}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f4fdf4',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    color: '#000',
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
  },
  historyHeader: {
    marginTop: 28,
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 12,
  },
  noData: {
    textAlign: 'center',
    fontSize: 15,
    color: '#999',
    marginTop: 16,
  },
});

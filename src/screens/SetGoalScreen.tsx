import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveDailyGoal, getDailyGoal } from '../utils/goalApi';
import { getRecentGoalsWithStatus } from '../utils/goalApi';
import GoalHistoryItem from '../components/GoalHistoryItem'; // ✅ Import the component

export default function SetGoalScreen() {
  const [goal, setGoal] = useState('');
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLockedForToday, setIsLockedForToday] = useState(false);
  const [recentGoals, setRecentGoals] = useState<any[]>([]);
  const [goalsLoading, setGoalsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const uid = await AsyncStorage.getItem('userId');
      if (uid) {
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
        }
      }
    })();
  }, []);

  const handleSaveGoal = async () => {
    const uid = await AsyncStorage.getItem('userId');
    if (!uid) {
      Alert.alert('Error', 'User not found.');
      return;
    }

    const parsedGoal = parseInt(goal);
    if (isNaN(parsedGoal)) {
      Alert.alert('Error', 'Please enter a valid number.');
      return;
    }

    try {
      setLoading(true);
      await saveDailyGoal(uid, parsedGoal, locked);
      Alert.alert(
        'Saved',
        locked ? 'Goal saved and locked for today!' : 'Goal saved for today!'
      );
      setIsLockedForToday(locked);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save goal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Set Your Daily Calorie Goal</Text>

      <TextInput
        style={styles.input}
        value={goal}
        onChangeText={setGoal}
        keyboardType="numeric"
        editable={!isLockedForToday}
        placeholder="e.g., 2200"
      />

      <View style={styles.switchContainer}>
        <Text style={{ fontSize: 16 }}>Lock Goal for Today</Text>
        <Switch
          value={locked}
          onValueChange={setLocked}
          disabled={isLockedForToday}
        />
      </View>

      <Button
        title={loading ? 'Saving...' : 'Save Goal'}
        onPress={handleSaveGoal}
        disabled={loading || isLockedForToday}
      />

      <Text style={styles.historyHeader}>📅 Last 7 Locked Goals</Text>
      {goalsLoading ? (
        <ActivityIndicator size="large" color="#333" style={{ marginTop: 20 }} />
      ) : recentGoals.length === 0 ? (
        <Text style={styles.noData}>No locked goals available.</Text>
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
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    fontSize: 16,
    marginBottom: 20,
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  historyHeader: {
    marginTop: 30,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    fontSize: 15,
    marginTop: 20,
  },
});

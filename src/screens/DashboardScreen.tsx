import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import CalorieCard from '../components/CalorieCard';
import DailyProgressBar from '../components/DailyProgressBar';
import TipCard from '../components/TipCard';
import MealHistoryItem from '../components/mealHistoryItem';
import { useFocusEffect } from '@react-navigation/native';
import { getTodayStatus, getRecentMeals, getDailyGoal } from '../utils/backendApi';
import { getCurrentUserUid } from '../utils/firebaseAuthApi';
import { BACKEND_URL } from '../../envVar';

const generalTips = [
  'Stay hydrated! Water supports every system in your body.',
  'Aim for whole foods over processed options.',
  'Fiber helps you feel full and supports digestion.',
  'Don’t skip meals — it can lead to overeating later.',
  'Pair carbs with protein to stay full longer.',
  'Healthy fats like avocado and nuts are great in moderation.',
  'Track your meals to stay mindful of your intake.',
  'Choose baked over fried foods when possible.',
  'Vegetables should fill half your plate.',
  'Try to eat slowly — it helps prevent overeating.',
  'Watch out for hidden sugars in sauces and drinks.',
  'Meal prep can help you stay on track all week.',
  'Listen to your hunger cues — eat when you’re hungry, stop when you’re full.',
  'Avoid eating out of boredom — find an activity instead.',
  'Try not to eat too close to bedtime.',
  'Include lean proteins like chicken, tofu, or beans.',
  'Drink a glass of water before meals to curb overeating.',
  'Don’t fear carbs — just choose complex ones like oats or brown rice.',
  'A colorful plate is often a nutritious one.',
  'Aim for at least 30 minutes of physical activity a day.',
];

export default function DashboardScreen({ navigation }: any) {
  const [dailyGoal, setDailyGoal] = useState<number | null>(null);
  const [consumed, setConsumed] = useState<number | null>(null);
  const [recentMeals, setRecentMeals] = useState<any[]>([]);
  const [rotatingTip, setRotatingTip] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [name, setName] = useState('');

  let tipInterval: NodeJS.Timeout;

  const fetchDashboardData = async () => {
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) {
        Alert.alert('Error', 'User ID not found.');
        return;
      }

      const goalData = await getDailyGoal(uid);
      const statusData = await getTodayStatus(uid);
      const recent = await getRecentMeals(uid);

      setDailyGoal(goalData?.goal ?? null);
      setConsumed(statusData?.totalCalories ?? 0);
      setRecentMeals(recent?.meals ?? []);

      const randomIndex = Math.floor(Math.random() * generalTips.length);
      setRotatingTip(generalTips[randomIndex]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      Alert.alert('Error', 'Could not load dashboard.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDashboardData().finally(() => setLoading(false));

      tipInterval = setInterval(() => {
        const index = Math.floor(Math.random() * generalTips.length);
        setRotatingTip(generalTips[index]);
      }, 300000); // 5 minutes

      return () => {
        if (tipInterval) clearInterval(tipInterval);
      };
    }, [])
  );

  useEffect(() => {
    const fetchName = async () => {
      const uid = await getCurrentUserUid();
      if (!uid) return;
      try {
        const res = await fetch(`${BACKEND_URL}/getUserProfile/${uid}`);
        const text = await res.text();
        const data = JSON.parse(text);
        setName(data.name || '');
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };

    fetchName();
  }, []);

  let tipMessage = '';
  let progressColor = '#4CAF50';
  if (consumed !== null && dailyGoal) {
    const percent = (consumed / dailyGoal) * 100;
    if (percent >= 100) {
      tipMessage = '🚨 You have crossed your limit.';
      progressColor = '#d32f2f';
    } else if (percent >= 90) {
      tipMessage = '🟠 Go light now.';
      progressColor = '#f57c00';
    } else if (percent >= 80) {
      tipMessage = '🟡 Be careful, you\'re close to your goal!';
      progressColor = '#fbc02d';
    } else {
      tipMessage = '✅ You\'re on track!';
      progressColor = '#4CAF50';
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Header title={`Welcome Back, ${name}!`} />

      {dailyGoal !== null && (
        <TouchableOpacity onPress={() => navigation.navigate('SetGoal')}>
          <Text style={styles.goalText}>🎯 Daily Goal: {dailyGoal} kcal</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#000" style={{ marginTop: 20 }} />
      ) : dailyGoal !== null ? (
        <>
          <CalorieCard consumed={consumed ?? 0} goal={dailyGoal} />
          <DailyProgressBar consumed={consumed ?? 0} goal={dailyGoal} color={progressColor} />
          <TipCard tip={tipMessage} extraTip={rotatingTip} color={progressColor} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Recent Meals</Text>
            {recentMeals.length > 0 ? (
              recentMeals.map((m, index) => (
                <MealHistoryItem
                  key={index}
                  meal={m.meal}
                  calories={m.calories}
                  timestamp={m.createdAt}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No meals logged today yet.</Text>
            )}
          </View>
        </>
      ) : (
        <Text style={styles.noGoalText}>
          You haven't set a calorie goal for today yet. Head over to "Set Goal"!
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f4fdf4',
    flexGrow: 1,
  },
  goalText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2e7d32',
    marginTop: 12,
    marginBottom: 16,
  },
  noGoalText: {
    marginTop: 40,
    fontSize: 16,
    textAlign: 'center',
    color: '#777',
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

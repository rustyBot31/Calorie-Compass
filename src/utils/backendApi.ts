import { getCurrentUserUid } from './firebaseAuthApi';
import axios from 'axios';
import { BACKEND_URL } from '../../envVar';
const BASE_URL = BACKEND_URL; // Replace with your backend URL

let cacheCalories = 0;
let cacheTip = '';

export interface CalorieEstimation {
  calories: number;
  tip: string;
}

export interface Meal {
  meal: string;
  calories: number;
  createdAt?: string;
}

export interface LockedGoal {
  goal: number;
  date: string;
  met: boolean;
}
export async function saveDailyGoal(uid: string, goal: number, locked: boolean) {
  const res = await fetch(`${BACKEND_URL}/saveGoal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ uid, goal, locked })
  });

  if (!res.ok) {
    const error = await res.json();
    console.warn('Failed to save daily goal:', error);
    throw new Error('Failed to save goal');
  }

  return res.json();
}

// ✅ Fixed: use /getGoal/:uid
export async function getDailyGoal(uid: string): Promise<{ goal: number; locked: boolean; date: string } | null> {
  const res = await fetch(`${BACKEND_URL}/getGoal/${uid}`);
  if (!res.ok) return null;

  const data = await res.json();
  return {
    goal: data.goal,
    locked: data.locked,
    date: data.date
  };
}
// 6. Get past 7 locked goals with success/fail
export async function getRecentGoalsWithStatus(uid: string): Promise<LockedGoal[]> {
  const res = await axios.get<{ lockedGoals: LockedGoal[] }>(
    `${BACKEND_URL}/getLockedGoalsWithStatus/${uid}`
  );
  return res.data.lockedGoals;
}

export interface DailyStatus {
  totalCalories: number;
  date: string; // Format: 'YYYY-MM-DD'
}

export interface GoalData {
  goal: number;
}



// 1. Estimate calories using Gemini
export async function previewCalories(meal: string): Promise<CalorieEstimation> {
  const uid = await getCurrentUserUid();
  if (!uid) throw new Error('User not logged in');

  const response = await fetch(`${BASE_URL}/estimateCaloriesOnly`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, meal }),
  });

  if (!response.ok) throw new Error('Failed to estimate calories');
  const data: CalorieEstimation = await response.json();

  cacheCalories = data.calories;
  cacheTip = data.tip;

  return data;
}

// 2. Save meal to backend using cached Gemini data
export async function saveMealToBackend(uid: string, meal: string): Promise<{ success: boolean }> {
  if (!cacheCalories || !cacheTip) {
    throw new Error('No cached Gemini data available');
  }

  const response = await fetch(`${BASE_URL}/logMeal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uid,
      meal,
      calories: cacheCalories,
      tip: cacheTip,
    }),
  });

  if (!response.ok) throw new Error('Failed to log meal');
  return await response.json();
}

// 3. Get today’s total consumed calories
export async function getTodayStatus(uid: string): Promise<DailyStatus> {
  const response = await fetch(`${BASE_URL}/getStatus/${uid}`);
  if (!response.ok) throw new Error('Failed to fetch status');
  return await response.json();
}

// 5. Get recent meals
export async function getRecentMeals(uid: string): Promise<{ meals: Meal[] } | null> {
  try {
    const res = await fetch(`${BASE_URL}/getRecentMeals/${uid}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching recent meals:', err);
    return null;
  }
}




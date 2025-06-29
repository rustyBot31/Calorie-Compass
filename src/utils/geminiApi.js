import { getCurrentUserUid } from './firebaseAuthApi';
import axios from 'axios';

const BASE_URL = ''; // your local/external backend

let cacheCalories = 0;
let cacheTip = '';

export async function previewCalories(meal) {
  const uid = await getCurrentUserUid();
  if (!uid) throw new Error('User not logged in');

  const response = await fetch(`${BASE_URL}/estimateCaloriesOnly`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, meal }),
  });

  if (!response.ok) throw new Error('Failed to estimate calories');
  const data = await response.json();

  cacheCalories = data.calories;
  cacheTip = data.tip;

  return data; // { calories, tip }
}

export async function saveMealToBackend(uid, meal) {
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

export async function getTodayStatus(uid) {
  const response = await fetch(`${BASE_URL}/getStatus/${uid}`);
  if (!response.ok) throw new Error('Failed to fetch status');
  return await response.json(); // { totalCalories: number, date: 'YYYY-MM-DD' }
}

export async function getDailyGoal(uid) {
  const response = await fetch(`${BASE_URL}/getGoal/${uid}`);
  if (!response.ok) throw new Error('Failed to fetch daily goal');
  return await response.json(); // returns { goal: number }
}

export async function getRecentMeals(uid) {
  try {
    const res = await fetch(`${BASE_URL}/getRecentMeals/${uid}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching recent meals:', err);
    return null;
  }
}

export async function getRecentGoalsWithStatus(uid) {
  const res = await axios.get(`${BASE_URL}/getLockedGoalsWithStatus/${uid}`);
  return res.data.lockedGoals; // Assumes backend returns { goals: [...] }
}
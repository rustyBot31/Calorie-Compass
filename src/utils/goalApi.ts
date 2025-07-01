import axios from "axios";
import { BACKEND_URL } from "../../envVar"; // Your local backend

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
const BACKEND_URL = ''; // Your local backend

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

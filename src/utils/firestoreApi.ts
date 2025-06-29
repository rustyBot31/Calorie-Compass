import AsyncStorage from '@react-native-async-storage/async-storage';

const PROJECT_ID = ''; //project id
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Format: "YYYY-MM-DD"
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

async function getIdToken(): Promise<string | null> {
  return await AsyncStorage.getItem('idToken');
}

// Save daily goal (with optional lock)
export async function saveDailyGoal(uid: string, goal: number, locked: boolean) {
  const token = await getIdToken();
  const date = getTodayDate();

  const userDocUrl = `${BASE_URL}/users/${uid}`;
  const goalDocUrl = `${userDocUrl}/goals/${date}`;

  // Step 1: Ensure parent user document exists
  await fetch(userDocUrl, {
    method: 'PATCH', // PATCH will create the document if it doesn't exist
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ fields: {} }) // empty document if not exists
  });

  // Step 2: Save the goal in subcollection
  const body = {
    fields: {
      goal: { integerValue: goal },
      locked: { booleanValue: locked },
      date: { stringValue: date }
    }
  };

  const res = await fetch(goalDocUrl, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Failed to save daily goal:', errText);
    throw new Error('Failed to save daily goal');
  }
}

// Fetch today's goal and lock status
export async function getDailyGoal(uid: string): Promise<{ goal: number; locked: boolean } | null> {
  const token = await getIdToken();
  const date = getTodayDate();
  const url = `${BASE_URL}/users/${uid}/goals/${date}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const errText = await res.text();
    console.error('Failed to get daily goal:', errText);
    throw new Error('Failed to get daily goal');
  }

  const data = await res.json();
  return {
    goal: parseInt(data.fields.goal.integerValue),
    locked: data.fields.locked.booleanValue
  };
}

import AsyncStorage from '@react-native-async-storage/async-storage';

const FIREBASE_API_KEY = ''; //FIREBASE_API_KEY
const BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';

// 🔐 Sign up a user with email + password
export async function signUpWithEmail(email: string, password: string) {
  const res = await fetch(`${BASE_URL}:signUp?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error?.message || 'Signup failed');

  await AsyncStorage.setItem('userToken', data.idToken);
  await AsyncStorage.setItem('userUid', data.localId);

  return data;
}

// 🔐 Login a user
export async function loginWithEmail(email: string, password: string) {
  const res = await fetch(`${BASE_URL}:signInWithPassword?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true,
    }),
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data.error?.message || 'Login failed');

  await AsyncStorage.setItem('userToken', data.idToken);
  await AsyncStorage.setItem('userUid', data.localId);

  return data;
}

// 🔓 Logout
export async function logout() {
  await AsyncStorage.multiRemove(['userToken', 'userUid']);
}

// 🆔 Get current UID (used in most app features)
export async function getCurrentUserUid(): Promise<string | null> {
  return await AsyncStorage.getItem('userUid');
}

// 🔐 Get ID token for authorization (used in backend calls)
export async function getIdToken(): Promise<string | null> {
  return await AsyncStorage.getItem('userToken');
}

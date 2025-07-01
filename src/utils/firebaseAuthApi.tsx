import AsyncStorage from '@react-native-async-storage/async-storage';

import { FIREBASE_API_KEY } from '../../envVar';//FIREBASE_API_KEY
const BASE_URL = 'https://identitytoolkit.googleapis.com/v1/accounts';
import { BACKEND_URL } from '../../envVar';

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
  await AsyncStorage.setItem('userId', data.localId);

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
  await AsyncStorage.setItem('userId', data.localId);

  return data;
}

// 🔓 Logout
export async function logout() {
  await AsyncStorage.multiRemove(['userToken', 'userId']);
}

// 🆔 Get current UID (used in most app features)
export async function getCurrentUserUid(): Promise<string | null> {
  return await AsyncStorage.getItem('userId');
}

// 🔐 Get ID token for authorization (used in backend calls)
export async function getIdToken(): Promise<string | null> {
  return await AsyncStorage.getItem('userToken');
}

// 📧 Send password reset email
export async function resetPassword(email: string): Promise<void> {
  const res = await fetch(`${BASE_URL}:sendOobCode?key=${FIREBASE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestType: 'PASSWORD_RESET',
      email,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to send password reset email');
  }
}

export const deleteUserAccount = async (uid: string): Promise<void> => {
  const response = await fetch(`${BACKEND_URL}/deleteUserAccount`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error?.error || 'Failed to delete account');
  }
};

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCurrentUserUid, getIdToken, logout } from '../utils/firebaseAuthApi';
import { BASE_URL } from '../utils/firestoreApi';
import { FIREBASE_API_KEY } from '../../envVar';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';


export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [uid, setUid] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userId = await getCurrentUserUid();
        const token = await getIdToken();

        if (!userId || !token) throw new Error('User not authenticated');

        setUid(userId);

        const res = await fetch(`${BASE_URL}/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch profile');

        const data = await res.json();
        setName(data.fields?.name?.stringValue || '');
        setEmail(data.fields?.email?.stringValue || '');
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }
    if (newPassword && newPassword.length < 6) {
      Alert.alert('Validation Error', 'Password must be at least 6 characters.');
      return;
    }

    setUpdating(true);
    try {
      const token = await getIdToken();
      if (!uid || !token) throw new Error('Missing user info');

      // Update Firestore name
      await fetch(`${BASE_URL}/users/${uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fields: { name: { stringValue: name } },
        }),
      });

      // Update password (if provided)
      if (newPassword.trim()) {
        await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idToken: token,
              password: newPassword,
              returnSecureToken: true,
            }),
          }
        );
        Alert.alert('Success', 'Password updated successfully');
      } else {
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setUpdating(false);
      setNewPassword('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Confirm Deletion',
      'This will permanently delete your account and all data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              const token = await getIdToken();
              if (!uid || !token) throw new Error('Missing auth info');

              // Delete user data (Firestore)
              await fetch(`${BASE_URL}/deleteUserData/${uid}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              // Delete Firebase Auth user
              await fetch(
                `https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${FIREBASE_API_KEY}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ idToken: token }),
                }
              );

              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
              Alert.alert('Account Deleted', 'Your account has been removed.');
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to delete account.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#2E7D32" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>👤 Profile</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput value={email} editable={false} style={[styles.input, styles.disabledInput]} />

      <Text style={styles.label}>Name</Text>
      <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Your name" />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        style={styles.input}
        secureTextEntry
        placeholder="Leave blank to skip"
      />

      <View style={styles.button}>
        <Button
          title={updating ? 'Updating...' : 'Update Profile'}
          onPress={handleUpdate}
          color="#2E7D32"
          disabled={updating}
        />
      </View>

      <View style={styles.button}>
        <Button title="Logout" onPress={handleLogout} color="#C62828" />
      </View>

      <View style={styles.button}>
        <Button
          title={deleting ? 'Deleting...' : 'Delete Account'}
          onPress={handleDeleteAccount}
          color="#8B0000"
          disabled={deleting}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#fff' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#2E7D32',
    textAlign: 'center',
  },
  label: { fontWeight: 'bold', marginTop: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  disabledInput: { backgroundColor: '#eee' },
  button: { marginTop: 24 },
});

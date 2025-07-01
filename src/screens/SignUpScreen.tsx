import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signUpWithEmail } from '../utils/firebaseAuthApi';
import { BASE_URL } from '../utils/firestoreApi';

export default function SignUpScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await signUpWithEmail(trimmedEmail, trimmedPassword);
    setLoading(false);

    if (result?.error?.message) {
      const msg = result.error.message;
      console.log(msg);
      if (msg.includes('EMAIL_EXISTS')) {
        Alert.alert('Sign Up Failed', 'An account with this email already exists.');
        
      } else {
        Alert.alert('Sign Up Failed', msg);
      }
      return;
    }

    if (result?.localId && result?.idToken) {
      await AsyncStorage.setItem('userId', result.localId);
      await AsyncStorage.setItem('userToken', result.idToken);

      try {
        await fetch(`${BASE_URL}/users/${result.localId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${result.idToken}`,
          },
          body: JSON.stringify({
            fields: {
              name: { stringValue: trimmedName },
              email: { stringValue: trimmedEmail },
            },
          }),
        });
      } catch (err) {
        console.error('Failed to save user profile:', err);
        Alert.alert('Warning', 'Signed up, but failed to save profile info.');
      }

      navigation.replace('Dashboard');
    } else {
      Alert.alert('Sign Up Failed', 'Unexpected error. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>CalorieCompass 🧭</Text>
      <Text style={styles.title}>Your Personalized Calorie Tracker!</Text>
      <Text style={styles.subtitle}>Hello there! 👋</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#aaa"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>
          Already have an account? <Text style={styles.linkBold}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    padding: 24,
  },
  appTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#1b5e20',
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 25,
    fontWeight: '500',
    marginBottom: 8,
    color: '#2e7d32',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 24,
    color: '#2e7d32',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  button: {
    backgroundColor: '#43a047',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  link: {
    color: '#555',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 4,
  },
  linkBold: {
    color: '#2e7d32',
    fontWeight: '600',
  },
});

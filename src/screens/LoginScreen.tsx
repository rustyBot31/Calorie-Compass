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
import { loginWithEmail } from '../utils/firebaseAuthApi';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithEmail(trimmedEmail, trimmedPassword);
      setLoading(false);

      if (result?.error) {
        const errorMsg = result.error.message || 'Unknown error occurred';

        if (
          errorMsg.includes('INVALID_LOGIN_CREDENTIALS')
        ) {
          Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
        } else if (errorMsg.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
          Alert.alert('Login Blocked', 'Too many failed attempts. Please try again later.');
        } else {
          Alert.alert('Login Error', errorMsg);
        }
      } else if (result?.localId) {
        await AsyncStorage.setItem('userId', result.localId);
        await AsyncStorage.setItem('userToken', result.idToken);
        navigation.replace('Dashboard');
      } else {
        Alert.alert('Login Failed', 'Unexpected error. Please try again.');
      }
    } catch (err: any) {
      setLoading(false);
      console.error('Login error:', err);
      Alert.alert('Login Failed', 'Something went wrong. Please check your network and try again.');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>CalorieCompass 🧭</Text>
      <Text style={styles.title}>Your Personalized Calorie Tracker!</Text>
      <Text style={styles.subtitle}>Welcome Back 👋</Text>

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
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.link}>
          Don't have an account?{' '}
          <Text style={styles.linkBold}>Sign up</Text>
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Forgot Password?</Text>
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

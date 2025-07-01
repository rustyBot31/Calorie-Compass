import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginWithEmail } from '../utils/firebaseAuthApi';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const result = await loginWithEmail(email, password);

    if (result.error || result.error?.message) {
      Alert.alert('Login Failed', result.error?.message || 'Unknown error');
    } else if (result.localId) {
      await AsyncStorage.setItem('userId', result.localId);
      await AsyncStorage.setItem('userToken', result.idToken);
      navigation.replace('Dashboard');
    } else {
      Alert.alert('Login Failed', 'Unexpected error. Try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appTitle}>CalorieCompass🧭</Text>
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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
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
    marginBottom: 32,
    color: '#2e7d32',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 32,
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
  link: {
    color: '#555',
    fontSize: 15,
    textAlign: 'center',
  },
  linkBold: {
    color: '#2e7d32',
    fontWeight: '600',
  },
});

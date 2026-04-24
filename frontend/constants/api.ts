import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export const API_URL = 'https://safe-kampus-backend.onrender.com';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('token');
  
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user_isim');
    await AsyncStorage.removeItem('user_rol');
    await AsyncStorage.removeItem('user_email');
    router.replace('/(auth)/login');
    throw new Error('Oturum süresi doldu.');
  }

  return response;
};
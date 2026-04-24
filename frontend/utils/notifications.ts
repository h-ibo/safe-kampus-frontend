import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

export async function registerForPushNotifications() {
  try {
    if (Platform.OS === 'web') return;
    
    const Notifications = await import('expo-notifications');
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') return;
    
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'de9762a8-64a9-45c9-be1c-6e6c344ec61e',
    });
    
    const token = await AsyncStorage.getItem('token');
    if (token && tokenData.data) {
      await fetch(`${API_URL}/users/push-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ push_token: tokenData.data }),
      });
    }
  } catch (e) {
    console.log('Push token alınamadı:', e);
  }
}

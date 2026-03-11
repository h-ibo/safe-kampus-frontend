import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification izni verilmedi.');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: "de9762a8-64a9-45c9-be1c-6e6c344ec61e" });
  const token = tokenData.data;

  try {
    const authToken = await AsyncStorage.getItem('token');
    if (authToken) {
      await fetch(`${API_URL}/users/push-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ push_token: token }),
      });
    }
  } catch (e) {
    console.error('Push token kaydedilemedi:', e);
  }

  return token;
}

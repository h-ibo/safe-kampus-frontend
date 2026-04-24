import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/api';

export async function registerForPushNotifications() {
  // Push notifications sadece APK build'de çalışır
  console.log('Push notifications: development build gerekli');
}

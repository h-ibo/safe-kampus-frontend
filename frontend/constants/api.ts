import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export const API_URL = 'https://safe-kampus-backend.onrender.com';

export const apiFetch = async (url: string, options: RequestInit = {}) => {
  const token = await AsyncStorage.getItem('token');
  
  // Header'ı temiz bir şekilde oluştur
  const authHeader = token ? (token.startsWith('Bearer ') ? token : `Bearer ${token}`) : '';

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        ...options.headers,
      },
    });

    // Oturum gerçekten geçersizse (401) sessizce login'e yönlendir
    if (response.status === 401) {
      console.warn("Oturum geçersiz, yönlendiriliyor...");
      await AsyncStorage.multiRemove(['token', 'user_isim', 'user_rol', 'user_email']);
      router.replace('/(auth)/login');
      return response; 
    }

    // 403 (Yetki Yok) hatasında sadece konsola yaz, uygulamayı kırma
    if (response.status === 403) {
      console.error("Yetkisiz erişim denemesi:", url);
      return response;
    }

    return response;
  } catch (error: any) {
    // İnternet kesilmesi vb. durumlarda console'da kalsın, ekrana Alert vermesin
    console.error("Ağ Hatası:", error.message);
    throw error;
  }
};
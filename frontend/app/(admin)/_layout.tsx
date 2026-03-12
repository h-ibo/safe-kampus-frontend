import { Tabs } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/api';

function TabIcon({ emoji, focused, badge }: { emoji: string; focused: boolean; badge?: number }) {
  return (
    <View>
      <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
      {badge ? (
        <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: '#e53e3e', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function AdminLayout() {
  const [mesajSayisi, setMesajSayisi] = useState(0);

  useEffect(() => {
    const fetchSayisi = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_URL}/chats/okunmamis-sayisi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMesajSayisi(data.sayi || 0);
      } catch (e) {}
    };
    fetchSayisi();
    const interval = setInterval(fetchSayisi, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d1526',
          borderTopColor: '#1e2d4a',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#e53e3e',
        tabBarInactiveTintColor: '#4a5568',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard', tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }} />
      <Tabs.Screen name="olaylar" options={{ title: 'Olaylar', tabBarIcon: ({ focused }) => <TabIcon emoji="🚨" focused={focused} /> }} />
      <Tabs.Screen name="kullanicilar" options={{ title: 'Kullanıcılar', tabBarIcon: ({ focused }) => <TabIcon emoji="👥" focused={focused} /> }} />
      <Tabs.Screen name="chat" options={{ title: 'Mesajlar', tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} badge={mesajSayisi} /> }} />
      <Tabs.Screen name="bildirimler" options={{ title: 'Bildirimler', tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} /> }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }} />
    </Tabs>
  );
}

import { Tabs } from 'expo-router';
import { Platform, Text, View, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';
import { API_URL } from '../../constants/api';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function FloatingChatButton() {
  const [mesajSayisi, setMesajSayisi] = useState(0);
  const [bildirimSayisi, setBildirimSayisi] = useState(0);
  const router = useRouter();
  const segments = useSegments();
  const isChatScreen = segments.includes('chat');

  useEffect(() => {
    const fetchSayisi = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${API_URL}/chats/meta/okunmamis-sayisi`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setMesajSayisi(data.sayi || 0);
        const res2 = await fetch(`${API_URL}/notifications/meta/okunmamis-sayisi`, { headers: { Authorization: `Bearer ${token}` } });
        const data2 = await res2.json();
        setBildirimSayisi(data2.sayi || 0);
      } catch (e) {}
    };
    fetchSayisi();
    const interval = setInterval(fetchSayisi, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isChatScreen) return null;
  return (
    <TouchableOpacity
      onPress={() => router.push('/(admin)/chat')}
      style={{
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 100 : 80,
        right: 16,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#e53e3e',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#e53e3e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 999,
      }}
    >
      <Text style={{ fontSize: 22 }}>💬</Text>
      {mesajSayisi > 0 && (
        <View style={{
          position: 'absolute', top: -2, right: -2,
          backgroundColor: '#1a56db', borderRadius: 10,
          minWidth: 18, height: 18,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>
            {mesajSayisi > 99 ? '99+' : mesajSayisi}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function AdminLayout() {
  return (
    <View style={{ flex: 1 }}>
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
        <Tabs.Screen name="bildirimler" options={{ title: 'Bildirimler', tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} badge={bildirimSayisi} /> }} />
        <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }} />
        <Tabs.Screen name="chat" options={{ href: null }} />
      </Tabs>
      <FloatingChatButton />
    </View>
  );
}

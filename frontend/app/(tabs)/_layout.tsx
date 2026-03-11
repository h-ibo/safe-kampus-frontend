import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/api';
import { useFocusEffect } from 'expo-router';

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}

function BildirimIcon({ focused }: { focused: boolean }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const fetch_unread = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('user_id');
        if (!token || !userId) return;
        const res = await fetch(`${API_URL}/notifications/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUnread(Array.isArray(data) ? data.filter((b: any) => !b.okundu).length : 0);
      } catch {}
    };
    fetch_unread();
    const interval = setInterval(fetch_unread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View>
      <Text style={{ fontSize: focused ? 26 : 22, opacity: focused ? 1 : 0.5 }}>🔔</Text>
      {unread > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -8,
          backgroundColor: '#e53e3e', borderRadius: 10,
          minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
          paddingHorizontal: 4,
        }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{unread}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
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
        tabBarActiveTintColor: '#1a56db',
        tabBarInactiveTintColor: '#4a5568',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Ana Sayfa', tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }} />
      <Tabs.Screen name="olaylarim" options={{ title: 'Olaylarım', tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} /> }} />
      <Tabs.Screen name="harita" options={{ title: 'Harita', tabBarIcon: ({ focused }) => <TabIcon emoji="🗺️" focused={focused} /> }} />
      <Tabs.Screen name="bildirimler" options={{ title: 'Bildirimler', tabBarIcon: ({ focused }) => <BildirimIcon focused={focused} /> }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="two" options={{ href: null }} />
    </Tabs>
  );
}

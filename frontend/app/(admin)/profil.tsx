import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function AdminProfil() {
  const [isim, setIsim] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('user_isim').then(i => i && setIsim(i));
    AsyncStorage.getItem('user_email').then(e => e && setEmail(e));
  }, []);

  const handleCikis = async () => {
    await AsyncStorage.multiRemove(['token', 'user_isim', 'user_email', 'user_rol']);
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>⚡ ADMIN</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{isim ? isim[0].toUpperCase() : '?'}</Text>
        </View>
        <Text style={styles.isim}>{isim}</Text>
        <Text style={styles.email}>{email}</Text>
        <TouchableOpacity style={styles.cikisBtn} onPress={handleCikis}>
          <Text style={styles.cikisBtnText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  adminBadge: { backgroundColor: '#1f0a0a', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#e53e3e' },
  adminBadgeText: { color: '#fc8181', fontSize: 11, fontWeight: '700' },
  content: { flex: 1, alignItems: 'center', padding: 24 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#e53e3e', justifyContent: 'center', alignItems: 'center', marginTop: 32, marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  isim: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  email: { color: '#4a5568', fontSize: 14, marginBottom: 32 },
  cikisBtn: { width: '100%', backgroundColor: '#1f0a0a', borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e53e3e' },
  cikisBtnText: { color: '#fc8181', fontSize: 15, fontWeight: '700' },
});

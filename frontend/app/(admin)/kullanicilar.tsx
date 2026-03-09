import { apiFetch } from '@/constants/api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

export default function AdminKullanicilar() {
  const [kullanicilar, setKullanicilar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const fetchKullanicilar = async () => {
      try {
        const res = await apiFetch('/users/');
        setKullanicilar(await res.json());
      } catch (e) { console.error(e); }
      finally { setYukleniyor(false); }
    };
    fetchKullanicilar();
  }, []);

  const renderKullanici = ({ item }: any) => (
    <View style={styles.kart}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.isim?.[0]?.toUpperCase() || '?'}</Text>
      </View>
      <View style={styles.bilgi}>
        <Text style={styles.isim}>{item.isim}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <View style={[styles.rolBadge, { backgroundColor: item.rol === 'admin' ? '#1f0a0a' : item.rol === 'guvenlik' ? '#0d1f35' : '#0a0f1a' }]}>
        <Text style={[styles.rolText, { color: item.rol === 'admin' ? '#fc8181' : item.rol === 'guvenlik' ? '#63b3ed' : '#4a5568' }]}>{item.rol}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kullanıcılar</Text>
      </View>
      {yukleniyor ? (
        <ActivityIndicator color="#e53e3e" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={kullanicilar}
          renderItem={renderKullanici}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.liste}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  liste: { padding: 16 },
  kart: { backgroundColor: '#0d1526', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1e2d4a', flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a56db', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  bilgi: { flex: 1 },
  isim: { color: '#fff', fontSize: 15, fontWeight: '700' },
  email: { color: '#4a5568', fontSize: 12, marginTop: 2 },
  rolBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  rolText: { fontSize: 11, fontWeight: '700' },
});
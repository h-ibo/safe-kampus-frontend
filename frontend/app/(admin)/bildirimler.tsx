import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/api';

export default function AdminBildirimlerScreen() {
  const [bildirimler, setBildirimler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yenileniyor, setYenileniyor] = useState(false);

  const fetchBildirimler = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('user_id');
      const res = await fetch(`${API_URL}/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBildirimler(Array.isArray(data) ? data.reverse() : []);
    } catch (e) {
      console.error(e);
    } finally {
      setYukleniyor(false);
      setYenileniyor(false);
    }
  }, []);

  useEffect(() => { fetchBildirimler(); }, []);

  const okunduIsaretle = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API_URL}/notifications/${id}/okundu`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setBildirimler(prev =>
        prev.map(b => b.id === id ? { ...b, okundu: true } : b)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const formatTarih = (tarih: string) => {
    const d = new Date(tarih);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (yukleniyor) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#e53e3e" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔔 Bildirimler</Text>
        <Text style={styles.headerSub}>
          {bildirimler.filter(b => !b.okundu).length} okunmamış
        </Text>
      </View>

      {bildirimler.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔕</Text>
          <Text style={styles.emptyText}>Henüz bildirim yok</Text>
        </View>
      ) : (
        <FlatList
          data={bildirimler}
          keyExtractor={item => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={yenileniyor}
              onRefresh={() => { setYenileniyor(true); fetchBildirimler(); }}
              tintColor="#e53e3e"
            />
          }
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, !item.okundu && styles.cardUnread]}
              onPress={() => okunduIsaretle(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardIcon}>{item.okundu ? '🔔' : '🔴'}</Text>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.cardMesaj, !item.okundu && styles.cardMesajUnread]}>
                  {item.mesaj}
                </Text>
                <Text style={styles.cardTarih}>{formatTarih(item.created_at)}</Text>
                {!item.okundu && (
                  <Text style={styles.okunduBtn}>Okundu işaretle →</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#4a5568', fontSize: 13, marginTop: 2 },
  emptyIcon: { fontSize: 64, marginBottom: 8 },
  emptyText: { color: '#4a5568', fontSize: 16 },
  card: { backgroundColor: '#0d1526', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', borderWidth: 1, borderColor: '#1e2d4a' },
  cardUnread: { borderColor: '#e53e3e', backgroundColor: '#1f0a0a' },
  cardLeft: { marginRight: 12, justifyContent: 'center' },
  cardIcon: { fontSize: 24 },
  cardRight: { flex: 1 },
  cardMesaj: { color: '#a0aec0', fontSize: 14, lineHeight: 20 },
  cardMesajUnread: { color: '#e2e8f0', fontWeight: '600' },
  cardTarih: { color: '#4a5568', fontSize: 12, marginTop: 6 },
  okunduBtn: { color: '#e53e3e', fontSize: 12, marginTop: 4, fontWeight: '600' },
});

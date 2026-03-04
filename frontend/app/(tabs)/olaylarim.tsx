import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DURUM_RENK: any = {
  beklemede: { bg: '#1f1a00', border: '#d69e2e', text: '#f6e05e' },
  inceleniyor: { bg: '#0d1f35', border: '#3182ce', text: '#63b3ed' },
  cozuldu: { bg: '#0a1f0a', border: '#38a169', text: '#68d391' },
};

export default function OlaylarimScreen() {
  const [olaylar, setOlaylar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const fetchOlaylar = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/olaylar/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOlaylar(data);
    } catch (e) {
      console.error(e);
    } finally {
      setYukleniyor(false);
    }
  };

  useEffect(() => { fetchOlaylar(); }, []);

  const renderOlay = ({ item }: any) => {
    const durum = DURUM_RENK[item.durum] || DURUM_RENK.beklemede;
    return (
      <View style={styles.kart}>
        <View style={styles.kartHeader}>
          <Text style={styles.olayTuru}>{item.olay_turu.toUpperCase()}</Text>
          <View style={[styles.durumBadge, { backgroundColor: durum.bg, borderColor: durum.border }]}>
            <Text style={[styles.durumText, { color: durum.text }]}>{item.durum}</Text>
          </View>
        </View>
        <View style={styles.kartRow}>
          <Text style={styles.icon}>📍</Text>
          <Text style={styles.konum}>{item.konum}</Text>
        </View>
        {item.aciklama ? (
          <Text style={styles.aciklama}>{item.aciklama}</Text>
        ) : null}
        <Text style={styles.tarih}>{new Date(item.created_at).toLocaleString('tr-TR')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Olaylarım</Text>
        <TouchableOpacity onPress={fetchOlaylar}>
          <Text style={styles.yenile}>↻ Yenile</Text>
        </TouchableOpacity>
      </View>

      {yukleniyor ? (
        <ActivityIndicator color="#1a56db" style={{ marginTop: 40 }} />
      ) : olaylar.length === 0 ? (
        <View style={styles.bos}>
          <Text style={styles.bosIcon}>📭</Text>
          <Text style={styles.bosText}>Henüz bildirim yapmadınız</Text>
        </View>
      ) : (
        <FlatList
          data={olaylar}
          renderItem={renderOlay}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  yenile: { color: '#4a7ab5', fontSize: 14, fontWeight: '600' },
  liste: { padding: 16 },
  kart: { backgroundColor: '#0d1526', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e2d4a' },
  kartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  olayTuru: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  durumBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  durumText: { fontSize: 11, fontWeight: '700' },
  kartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { fontSize: 14, marginRight: 6 },
  konum: { color: '#a0aec0', fontSize: 13 },
  aciklama: { color: '#718096', fontSize: 13, marginBottom: 8, lineHeight: 20 },
  tarih: { color: '#2d3748', fontSize: 11, marginTop: 4 },
  bos: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bosIcon: { fontSize: 48, marginBottom: 12 },
  bosText: { color: '#4a5568', fontSize: 15 },
});

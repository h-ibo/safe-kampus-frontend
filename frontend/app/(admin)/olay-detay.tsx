import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../constants/api';

const DURUMLAR = ['beklemede', 'inceleniyor', 'cozuldu'];

const durumRenk: any = {
  beklemede: '#d97706',
  inceleniyor: '#1a56db',
  cozuldu: '#16a34a',
};

const olayEmoji: any = {
  'Yangın': '🔥',
  'Kavga': '⚠️',
  'Hırsızlık': '🚨',
  'Sağlık': '🏥',
  'Şüpheli': '👁️',
  'ACİL YARDIM': '🆘',
  'Diğer': '📋',
};

export default function OlayDetay() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [olay, setOlay] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    const fetchOlay = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch(`${API_URL}/olaylar/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setOlay(data);
      } catch (e) { console.error(e); }
      finally { setYukleniyor(false); }
    };
    fetchOlay();
  }, [id]);

  const durumGuncelle = async (durum: string) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API_URL}/olaylar/${id}/durum?durum=${durum}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      setOlay({ ...olay, durum });
    } catch (e) { console.error(e); }
  };

  if (yukleniyor) return (
    <View style={styles.centered}>
      <ActivityIndicator color="#e53e3e" size="large" />
    </View>
  );

  if (!olay) return (
    <View style={styles.centered}>
      <Text style={styles.errorText}>Olay bulunamadı</Text>
    </View>
  );

  const MapView = Platform.OS !== 'web' ? require('react-native-maps').default : null;
  const Marker = Platform.OS !== 'web' ? require('react-native-maps').Marker : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Olay Detayı</Text>
      </View>

      <View style={styles.content}>
        {/* Olay Başlık */}
        <View style={styles.card}>
          <View style={styles.olayHeader}>
            <Text style={styles.olayEmoji}>{olayEmoji[olay.olay_turu] || '📋'}</Text>
            <View style={styles.olayInfo}>
              <Text style={styles.olayTuru}>{olay.olay_turu}</Text>
              <Text style={styles.olayId}>#{olay.id}</Text>
            </View>
            <View style={[styles.durumBadge, { backgroundColor: durumRenk[olay.durum] + '22', borderColor: durumRenk[olay.durum] }]}>
              <Text style={[styles.durumText, { color: durumRenk[olay.durum] }]}>{olay.durum}</Text>
            </View>
          </View>
        </View>

        {/* Detaylar */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📍 Konum</Text>
          <Text style={styles.detayText}>{olay.konum}</Text>
          {olay.aciklama && <>
            <Text style={[styles.sectionTitle, { marginTop: 12 }]}>📝 Açıklama</Text>
            <Text style={styles.detayText}>{olay.aciklama}</Text>
          </>}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>🕒 Tarih</Text>
          <Text style={styles.detayText}>{new Date(olay.created_at).toLocaleString('tr-TR')}</Text>
        </View>

        {/* Harita */}
        {olay.latitude && olay.longitude && MapView && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>🗺️ Harita</Text>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: olay.latitude,
                longitude: olay.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
              }}
              scrollEnabled={false}
            >
              <Marker
                coordinate={{ latitude: olay.latitude, longitude: olay.longitude }}
                title={olay.olay_turu}
                description={olay.konum}
                pinColor="#e53e3e"
              />
            </MapView>
          </View>
        )}

        {/* Durum Güncelle */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🔄 Durum Güncelle</Text>
          <View style={styles.durumlar}>
            {DURUMLAR.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.durumBtn, olay.durum === d && styles.durumBtnAktif]}
                onPress={() => durumGuncelle(d)}
              >
                <Text style={[styles.durumBtnText, olay.durum === d && styles.durumBtnTextAktif]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070b14' },
  errorText: { color: '#fff', fontSize: 16 },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  backBtn: { color: '#e53e3e', fontSize: 16, marginBottom: 8 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  content: { padding: 16 },
  card: { backgroundColor: '#0d1526', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e2d4a' },
  olayHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  olayEmoji: { fontSize: 36 },
  olayInfo: { flex: 1 },
  olayTuru: { color: '#fff', fontSize: 18, fontWeight: '800' },
  olayId: { color: '#4a5568', fontSize: 13 },
  durumBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1 },
  durumText: { fontSize: 12, fontWeight: '700' },
  sectionTitle: { color: '#4a7ab5', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 6 },
  detayText: { color: '#e2e8f0', fontSize: 14, lineHeight: 22 },
  map: { height: 200, borderRadius: 12, marginTop: 8 },
  durumlar: { flexDirection: 'row', gap: 8, marginTop: 8 },
  durumBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1e2d4a', alignItems: 'center' },
  durumBtnAktif: { backgroundColor: '#e53e3e', borderColor: '#e53e3e' },
  durumBtnText: { color: '#4a5568', fontSize: 12, fontWeight: '600' },
  durumBtnTextAktif: { color: '#fff' },
});

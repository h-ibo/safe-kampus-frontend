import { apiFetch } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminDashboard() {
  const [olaylar, setOlaylar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [isim, setIsim] = useState('');
  const [duyuruBaslik, setDuyuruBaslik] = useState('');
  const [duyuruIcerik, setDuyuruIcerik] = useState('');
  const [duyuruGonderiyor, setDuyuruGonderiyor] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('user_isim').then(i => i && setIsim(i));
    fetchOlaylar();
  }, []);

  const fetchOlaylar = async () => {
    try {
      const res = await apiFetch('/olaylar/');
      const data = await res.json();
      setOlaylar(data);
    } catch (e) {
      console.error(e);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleDuyuruGonder = async () => {
    if (!duyuruBaslik.trim() || !duyuruIcerik.trim()) {
      Alert.alert('Hata', 'Başlık ve içerik boş olamaz.');
      return;
    }
    setDuyuruGonderiyor(true);
    try {
      const res = await apiFetch('/announcements/', {
        method: 'POST',
        body: JSON.stringify({ baslik: duyuruBaslik, icerik: duyuruIcerik }),
      });
      if (!res.ok) throw new Error('Duyuru gönderilemedi.');
      Alert.alert('Başarılı', 'Duyuru yayınlandı!');
      setDuyuruBaslik('');
      setDuyuruIcerik('');
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setDuyuruGonderiyor(false);
    }
  };

  const beklemede = olaylar.filter(o => o.durum === 'beklemede').length;
  const inceleniyor = olaylar.filter(o => o.durum === 'inceleniyor').length;
  const cozuldu = olaylar.filter(o => o.durum === 'cozuldu').length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBadge}>⚡ KOMUTA MERKEZİ</Text>
          <Text style={styles.headerTitle}>Hoş geldin, {isim}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={[styles.statKart, { borderColor: '#d69e2e' }]}>
            <Text style={styles.statSayi}>{beklemede}</Text>
            <Text style={styles.statLabel}>Beklemede</Text>
            <Text style={styles.statIcon}>⏳</Text>
          </View>
          <View style={[styles.statKart, { borderColor: '#3182ce' }]}>
            <Text style={styles.statSayi}>{inceleniyor}</Text>
            <Text style={styles.statLabel}>İnceleniyor</Text>
            <Text style={styles.statIcon}>🔍</Text>
          </View>
          <View style={[styles.statKart, { borderColor: '#38a169' }]}>
            <Text style={styles.statSayi}>{cozuldu}</Text>
            <Text style={styles.statLabel}>Çözüldü</Text>
            <Text style={styles.statIcon}>✅</Text>
          </View>
          <View style={[styles.statKart, { borderColor: '#e53e3e' }]}>
            <Text style={styles.statSayi}>{olaylar.length}</Text>
            <Text style={styles.statLabel}>Toplam</Text>
            <Text style={styles.statIcon}>📊</Text>
          </View>
        </View>

        {/* Duyuru Oluştur */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📢 Duyuru Yayınla</Text>
          <TextInput
            style={styles.input}
            placeholder="Duyuru başlığı..."
            placeholderTextColor="#4a5568"
            value={duyuruBaslik}
            onChangeText={setDuyuruBaslik}
          />
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Duyuru içeriği..."
            placeholderTextColor="#4a5568"
            value={duyuruIcerik}
            onChangeText={setDuyuruIcerik}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.duyuruBtn, duyuruGonderiyor && { opacity: 0.6 }]}
            onPress={handleDuyuruGonder}
            disabled={duyuruGonderiyor}
          >
            {duyuruGonderiyor
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.duyuruBtnText}>YAYINLA →</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Son olaylar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Son Olaylar</Text>
            <TouchableOpacity onPress={fetchOlaylar}>
              <Text style={styles.yenile}>↻ Yenile</Text>
            </TouchableOpacity>
          </View>

          {yukleniyor ? (
            <ActivityIndicator color="#e53e3e" style={{ marginTop: 20 }} />
          ) : olaylar.length === 0 ? (
            <Text style={styles.bosText}>Henüz olay yok</Text>
          ) : (
            olaylar.slice(0, 5).map((olay: any) => (
              <View key={olay.id} style={styles.olayKart}>
                <View style={styles.olayHeader}>
                  <Text style={styles.olayTuru}>{olay.olay_turu.toUpperCase()}</Text>
                  <View style={[styles.durumBadge, {
                    backgroundColor: olay.durum === 'beklemede' ? '#1f1a00' : olay.durum === 'inceleniyor' ? '#0d1f35' : '#0a1f0a',
                    borderColor: olay.durum === 'beklemede' ? '#d69e2e' : olay.durum === 'inceleniyor' ? '#3182ce' : '#38a169',
                  }]}>
                    <Text style={[styles.durumText, {
                      color: olay.durum === 'beklemede' ? '#f6e05e' : olay.durum === 'inceleniyor' ? '#63b3ed' : '#68d391',
                    }]}>{olay.durum}</Text>
                  </View>
                </View>
                <Text style={styles.olayKonum}>📍 {olay.konum}</Text>
                <Text style={styles.olayTarih}>{new Date(olay.created_at).toLocaleString('tr-TR')}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerBadge: { color: '#e53e3e', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  scroll: { padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statKart: { flex: 1, minWidth: '45%', backgroundColor: '#0d1526', borderRadius: 16, padding: 16, borderWidth: 1, alignItems: 'center' },
  statSayi: { color: '#fff', fontSize: 32, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: '#4a5568', fontSize: 12, fontWeight: '600' },
  statIcon: { fontSize: 24, marginTop: 8 },
  section: { backgroundColor: '#0d1526', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1e2d4a', marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 12 },
  yenile: { color: '#4a7ab5', fontSize: 13, fontWeight: '600' },
  bosText: { color: '#4a5568', textAlign: 'center', paddingVertical: 20 },
  input: { backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1e2d4a', color: '#e2e8f0', fontSize: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  textarea: { height: 100, textAlignVertical: 'top' },
  duyuruBtn: { backgroundColor: '#1a56db', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  duyuruBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
  olayKart: { backgroundColor: '#111827', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1e2d4a' },
  olayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  olayTuru: { color: '#fff', fontSize: 14, fontWeight: '800' },
  durumBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  durumText: { fontSize: 11, fontWeight: '700' },
  olayKonum: { color: '#718096', fontSize: 13, marginBottom: 4 },
  olayTarih: { color: '#2d3748', fontSize: 11 },
});
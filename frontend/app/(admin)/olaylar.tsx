import { apiFetch } from '@/constants/api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DURUMLAR = ['beklemede', 'inceleniyor', 'cozuldu'];

export default function AdminOlaylar() {
  const [olaylar, setOlaylar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const fetchOlaylar = async () => {
    setYukleniyor(true);
    try {
      const res = await apiFetch('/olaylar/');
      setOlaylar(await res.json());
    } catch (e) { console.error(e); }
    finally { setYukleniyor(false); }
  };

  const durumGuncelle = async (id: number, durum: string) => {
    try {
      await apiFetch(`/olaylar/${id}/durum?durum=${durum}`, { method: 'PUT' });
      fetchOlaylar();
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchOlaylar(); }, []);

  const renderOlay = ({ item }: any) => (
    <View style={styles.kart}>
      <View style={styles.kartHeader}>
        <Text style={styles.olayTuru}>{item.olay_turu.toUpperCase()}</Text>
        <Text style={styles.olayId}>#{item.id}</Text>
      </View>
      <Text style={styles.konum}>📍 {item.konum}</Text>
      {item.aciklama ? <Text style={styles.aciklama}>{item.aciklama}</Text> : null}
      <Text style={styles.tarih}>{new Date(item.created_at).toLocaleString('tr-TR')}</Text>
      <View style={styles.durumlar}>
        {DURUMLAR.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.durumBtn, item.durum === d && styles.durumBtnAktif]}
            onPress={() => durumGuncelle(item.id, d)}
          >
            <Text style={[styles.durumBtnText, item.durum === d && styles.durumBtnTextAktif]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tüm Olaylar</Text>
        <TouchableOpacity onPress={fetchOlaylar}>
          <Text style={styles.yenile}>↻ Yenile</Text>
        </TouchableOpacity>
      </View>
      {yukleniyor ? (
        <ActivityIndicator color="#e53e3e" style={{ marginTop: 40 }} />
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
  kartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  olayTuru: { color: '#fff', fontSize: 15, fontWeight: '800' },
  olayId: { color: '#4a5568', fontSize: 13 },
  konum: { color: '#a0aec0', fontSize: 13, marginBottom: 4 },
  aciklama: { color: '#718096', fontSize: 13, marginBottom: 8 },
  tarih: { color: '#2d3748', fontSize: 11, marginBottom: 12 },
  durumlar: { flexDirection: 'row', gap: 8 },
  durumBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1e2d4a', alignItems: 'center' },
  durumBtnAktif: { backgroundColor: '#1a56db', borderColor: '#1a56db' },
  durumBtnText: { color: '#4a5568', fontSize: 11, fontWeight: '600' },
  durumBtnTextAktif: { color: '#fff' },
});
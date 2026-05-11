import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '@/constants/api';

const DURUMLAR = ['beklemede', 'inceleniyor', 'cozuldu'];

const durumRenk: any = {
  beklemede: '#d97706',
  inceleniyor: '#1a56db',
  cozuldu: '#16a34a',
};

const olayEmoji: any = {
  'Yangın': '🔥', 'Kavga': '⚠️', 'Hırsızlık': '🚨',
  'Sağlık': '🏥', 'Şüpheli': '👁️', 'ACİL YARDIM': '🆘', 'Diğer': '📋',
};

export default function GuvenlikOlaylar() {
  const router = useRouter();
  const [olaylar, setOlaylar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const fetchOlaylar = async () => {
    setYukleniyor(true);
    try {
      const res = await apiFetch('/olaylar/');
      const data = await res.json();
      setOlaylar(Array.isArray(data) ? data : []);
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
    <TouchableOpacity
      style={[styles.kart, item.olay_turu === 'ACİL YARDIM' && styles.kartAcil]}
      onPress={() => router.push({ pathname: '/(guvenlik)/olay-detay', params: { id: item.id } })}
    >
      <View style={styles.kartHeader}>
        <Text style={styles.olayEmoji}>{olayEmoji[item.olay_turu] || '📋'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.olayTuru}>{item.olay_turu.toUpperCase()}</Text>
          <Text style={styles.konum}>📍 {item.konum}</Text>
        </View>
        <View style={[styles.durumBadge, { backgroundColor: durumRenk[item.durum] + '22', borderColor: durumRenk[item.durum] }]}>
          <Text style={[styles.durumText, { color: durumRenk[item.durum] }]}>{item.durum}</Text>
        </View>
      </View>
      {item.aciklama ? <Text style={styles.aciklama}>{item.aciklama}</Text> : null}
      <Text style={styles.tarih}>{new Date(item.created_at).toLocaleString('tr-TR')}</Text>
      <View style={styles.durumlar}>
        {DURUMLAR.map(d => (
          <TouchableOpacity
            key={d}
            style={[styles.durumBtn, item.durum === d && styles.durumBtnAktif]}
            onPress={(e) => { durumGuncelle(item.id, d); }}
          >
            <Text style={[styles.durumBtnText, item.durum === d && styles.durumBtnTextAktif]}>{d}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚨 Olaylar</Text>
        <TouchableOpacity onPress={fetchOlaylar}>
          <Text style={styles.yenile}>↻ Yenile</Text>
        </TouchableOpacity>
      </View>
      {yukleniyor ? (
        <ActivityIndicator color="#16a34a" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={olaylar}
          renderItem={renderOlay}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.liste}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>Aktif olay yok</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  yenile: { color: '#16a34a', fontSize: 14, fontWeight: '600' },
  liste: { padding: 16 },
  kart: { backgroundColor: '#0d1526', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1e2d4a' },
  kartAcil: { borderColor: '#e53e3e', backgroundColor: '#1a0a0a' },
  kartHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  olayEmoji: { fontSize: 28 },
  olayTuru: { color: '#fff', fontSize: 14, fontWeight: '800' },
  konum: { color: '#a0aec0', fontSize: 12, marginTop: 2 },
  durumBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  durumText: { fontSize: 11, fontWeight: '700' },
  aciklama: { color: '#718096', fontSize: 13, marginBottom: 8 },
  tarih: { color: '#2d3748', fontSize: 11, marginBottom: 10 },
  durumlar: { flexDirection: 'row', gap: 8 },
  durumBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1e2d4a', alignItems: 'center' },
  durumBtnAktif: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  durumBtnText: { color: '#4a5568', fontSize: 11, fontWeight: '600' },
  durumBtnTextAktif: { color: '#fff' },
  centered: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#4a5568', fontSize: 15 },
});

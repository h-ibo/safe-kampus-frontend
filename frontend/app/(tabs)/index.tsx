import { apiFetch } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated, Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const OLAY_TURLERI = [
  { id: 'yangin', label: 'Yangın', icon: '🔥', renk: '#e53e3e' },
  { id: 'kavga', label: 'Kavga', icon: '⚠️', renk: '#d69e2e' },
  { id: 'hirsizlik', label: 'Hırsızlık', icon: '🚨', renk: '#805ad5' },
  { id: 'saglik', label: 'Sağlık', icon: '🏥', renk: '#38a169' },
  { id: 'sarbest', label: 'Şüpheli', icon: '👁', renk: '#3182ce' },
  { id: 'diger', label: 'Diğer', icon: '📋', renk: '#718096' },
];

export default function AnaSayfa() {
  const [secilenTur, setSecilenTur] = useState('');
  const [konum, setKonum] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [kullanici, setKullanici] = useState('');
  const [duyurular, setDuyurular] = useState<any[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: false }).start();
    AsyncStorage.getItem('user_isim').then(i => i && setKullanici(i));
    fetchDuyurular();
  }, []);

  const fetchDuyurular = async () => {
    try {
      const res = await apiFetch('/announcements/');
      const data = await res.json();
      setDuyurular(Array.isArray(data) ? [...data].reverse() : []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCikis = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user_email');
    router.replace('/(auth)/login');
  };

  const handleAcil = async () => {
    setYukleniyor(true);
    try {
      const response = await apiFetch('/olaylar/', {
        method: 'POST',
        body: JSON.stringify({
          olay_turu: 'ACİL YARDIM',
          konum: 'Konum belirsiz',
          aciklama: 'ACİL YARDIM talebi! Kullanıcı yardım istiyor.'
        }),
      });
      if (!response.ok) throw new Error('Gönderim başarısız.');
      alert('🆘 ACİL YARDIM talebi güvenlik birimine iletildi!');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleGonder = async () => {
    if (!secilenTur) { alert('Lütfen olay türü seçin.'); return; }
    if (!konum) { alert('Lütfen konum girin.'); return; }
    setYukleniyor(true);
    try {
      const response = await apiFetch('/olaylar/', {
        method: 'POST',
        body: JSON.stringify({ olay_turu: secilenTur, konum, aciklama }),
      });
      if (!response.ok) throw new Error('Gönderim başarısız.');
      setBasarili(true);
      Animated.spring(successAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: false }).start();
      setTimeout(() => {
        setBasarili(false);
        successAnim.setValue(0);
        setSecilenTur('');
        setKonum('');
        setAciklama('');
      }, 3000);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreet}>Merhaba 👋</Text>
          <Text style={styles.headerEmail}>{kullanici}</Text>
        </View>
        <TouchableOpacity style={styles.cikisBtn} onPress={handleCikis}>
          <Text style={styles.cikisBtnText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.acilBtn} activeOpacity={0.85} onPress={handleAcil}>
          <Text style={styles.acilBtnIcon}>🆘</Text>
          <View>
            <Text style={styles.acilBtnTitle}>ACİL YARDIM</Text>
            <Text style={styles.acilBtnSub}>Güvenlik birimine anında bağlan</Text>
          </View>
        </TouchableOpacity>

        {duyurular.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📢 Duyurular</Text>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {duyurular.map((d: any) => (
              <View key={d.id} style={styles.duyuruKart}>
                <Text style={styles.duyuruBaslik}>{d.baslik}</Text>
                <Text style={styles.duyuruIcerik}>{d.icerik}</Text>
                <Text style={styles.duyuruTarih}>{new Date(d.created_at).toLocaleString('tr-TR')}</Text>
              </View>
            ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Olay Bildir</Text>
          <Text style={styles.cardSub}>Kampüste gördüğünüz bir olayı bildirin</Text>
          <Text style={styles.label}>OLAY TÜRÜ</Text>
          <View style={styles.turGrid}>
            {OLAY_TURLERI.map((tur) => (
              <TouchableOpacity
                key={tur.id}
                style={[styles.turKart, secilenTur === tur.id && { borderColor: tur.renk, backgroundColor: tur.renk + '22' }]}
                onPress={() => setSecilenTur(tur.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.turIcon}>{tur.icon}</Text>
                <Text style={[styles.turLabel, secilenTur === tur.id && { color: tur.renk }]}>{tur.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>KONUM</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={styles.input}
              placeholder="Bina adı, kat, oda no..."
              placeholderTextColor="#4a5568"
              value={konum}
              onChangeText={setKonum}
            />
          </View>

          <Text style={styles.label}>AÇIKLAMA</Text>
          <View style={[styles.inputWrapper, styles.textareaWrapper]}>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Olayı kısaca açıklayın..."
              placeholderTextColor="#4a5568"
              value={aciklama}
              onChangeText={setAciklama}
              multiline
              numberOfLines={4}
            />
          </View>

          <TouchableOpacity
            style={[styles.gonderBtn, yukleniyor && styles.gonderBtnDisabled]}
            onPress={handleGonder}
            disabled={yukleniyor}
            activeOpacity={0.85}
          >
            {yukleniyor ? <ActivityIndicator color="#fff" /> : <Text style={styles.gonderBtnText}>BİLDİR →</Text>}
          </TouchableOpacity>
        </View>

        {basarili && (
          <Animated.View style={[styles.successBox, { transform: [{ scale: successAnim }] }]}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>Olayınız güvenlik birimine iletildi!</Text>
          </Animated.View>
        )}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerGreet: { color: '#4a5568', fontSize: 13 },
  headerEmail: { color: '#e2e8f0', fontSize: 15, fontWeight: '700' },
  cikisBtn: { backgroundColor: '#1e2d4a', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  cikisBtnText: { color: '#4a7ab5', fontSize: 13, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 40 },
  acilBtn: { backgroundColor: '#7b0000', borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e53e3e' },
  acilBtnIcon: { fontSize: 36 },
  acilBtnTitle: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  acilBtnSub: { color: '#fc8181', fontSize: 12, marginTop: 2 },
  card: { backgroundColor: '#0d1526', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1e2d4a' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 16 },
  cardSub: { color: '#4a5568', fontSize: 13, marginBottom: 20 },
  duyuruKart: { backgroundColor: '#111827', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1e3a5f' },
  duyuruBaslik: { color: '#fff', fontSize: 14, fontWeight: '700', marginBottom: 6 },
  duyuruIcerik: { color: '#718096', fontSize: 13, lineHeight: 20, marginBottom: 6 },
  duyuruTarih: { color: '#2d3748', fontSize: 11 },
  label: { color: '#4a7ab5', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 10 },
  turGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  turKart: { width: (width - 32 - 40 - 20) / 3, backgroundColor: '#111827', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#1e2d4a' },
  turIcon: { fontSize: 24, marginBottom: 6 },
  turLabel: { color: '#718096', fontSize: 12, fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1e2d4a', paddingHorizontal: 14, marginBottom: 16 },
  textareaWrapper: { alignItems: 'flex-start', paddingTop: 12 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#e2e8f0', fontSize: 15, paddingVertical: 14 },
  textarea: { height: 100, textAlignVertical: 'top' },
  gonderBtn: { backgroundColor: '#1a56db', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  gonderBtnDisabled: { opacity: 0.6 },
  gonderBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  successBox: { backgroundColor: '#0a1f0a', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#276749', flexDirection: 'row', gap: 12 },
  successIcon: { fontSize: 28 },
  successText: { color: '#68d391', fontSize: 14, fontWeight: '600', flex: 1 },
});
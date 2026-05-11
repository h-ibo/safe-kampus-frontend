import { apiFetch } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfilScreen() {
  const [isim, setIsim] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [ogrenciNo, setOgrenciNo] = useState('');
  const [bolum, setBolum] = useState('');
  const [fakulte, setFakulte] = useState('');
  const [yeniIsim, setYeniIsim] = useState('');
  const [duzenle, setDuzenle] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [eskiSifre, setEskiSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [sifreDuzenle, setSifreDuzenle] = useState(false);
  const [sifreYukleniyor, setSifreYukleniyor] = useState(false);

  useEffect(() => {
    fetchProfil();
  }, []);

  const fetchProfil = async () => {
  try {
    const res = await apiFetch('/users/me');
    if (!res.ok) throw new Error('Profil alınamadı.');
    const data = await res.json();
    setIsim(data.isim || '');
    setEmail(data.email || '');
    setTelefon(data.telefon || '');
    setOgrenciNo(data.ogrenci_no || '');
    setBolum(data.bolum || '');
    setFakulte(data.fakulte || '');
    await AsyncStorage.setItem('user_isim', data.isim || '');
  } catch (e) {
    console.error(e);
  }
};

  const handleCikis = async () => {
    await AsyncStorage.multiRemove(['token', 'user_isim', 'user_email', 'user_rol']);
    router.replace('/(auth)/login');
  };

  const handleGuncelle = async () => {
    if (!yeniIsim.trim()) { Alert.alert('Hata', 'İsim boş olamaz.'); return; }
    setYukleniyor(true);
    try {
      const res = await apiFetch(`/users/profil-guncelle?isim=${encodeURIComponent(yeniIsim)}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Güncelleme başarısız.');
      await AsyncStorage.setItem('user_isim', yeniIsim);
      setIsim(yeniIsim);
      setDuzenle(false);
      Alert.alert('Başarılı', 'İsminiz güncellendi!');
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setYukleniyor(false);
    }
  };

  const handleSifreDegistir = async () => {
    if (!eskiSifre || !yeniSifre) { Alert.alert('Hata', 'Tüm alanları doldurun.'); return; }
    if (yeniSifre.length < 6) { Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalı.'); return; }
    setSifreYukleniyor(true);
    try {
      const res = await apiFetch(`/users/sifre-guncelle?eski_sifre=${encodeURIComponent(eskiSifre)}&yeni_sifre=${encodeURIComponent(yeniSifre)}`, { method: 'PUT' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Şifre değiştirilemedi.');
      }
      Alert.alert('Başarılı', 'Şifreniz güncellendi!');
      setEskiSifre('');
      setYeniSifre('');
      setSifreDuzenle(false);
    } catch (e: any) {
      Alert.alert('Hata', e.message);
    } finally {
      setSifreYukleniyor(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity onPress={() => { setDuzenle(!duzenle); setYeniIsim(isim); }}>
          <Text style={styles.duzenleBtn}>{duzenle ? 'İptal' : '✏️ Düzenle'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{isim ? isim[0].toUpperCase() : '?'}</Text>
        </View>
        <Text style={styles.isim}>{isim}</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.infoKart}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>👤 Ad Soyad</Text>
            {duzenle ? (
              <TextInput
                style={styles.input}
                value={yeniIsim}
                onChangeText={setYeniIsim}
                placeholder="Yeni isminiz"
                placeholderTextColor="#4a5568"
              />
            ) : (
              <Text style={styles.infoValue}>{isim}</Text>
            )}
          </View>
          <View style={styles.ayrac} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>✉ E-posta</Text>
            <Text style={styles.infoValue}>{email}</Text>
          </View>
          {telefon ? <>
            <View style={styles.ayrac} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📱 Telefon</Text>
              <Text style={styles.infoValue}>{telefon}</Text>
            </View>
          </> : null}
          {ogrenciNo ? <>
            <View style={styles.ayrac} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🎓 Öğrenci No</Text>
              <Text style={styles.infoValue}>{ogrenciNo}</Text>
            </View>
          </> : null}
          {bolum ? <>
            <View style={styles.ayrac} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📚 Bölüm</Text>
              <Text style={styles.infoValue}>{bolum}</Text>
            </View>
          </> : null}
          {fakulte ? <>
            <View style={styles.ayrac} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🏛️ Fakülte</Text>
              <Text style={styles.infoValue}>{fakulte}</Text>
            </View>
          </> : null}
        </View>

        {duzenle && (
          <TouchableOpacity
            style={[styles.kaydetBtn, yukleniyor && { opacity: 0.6 }]}
            onPress={handleGuncelle}
            disabled={yukleniyor}
          >
            {yukleniyor ? <ActivityIndicator color="#fff" /> : <Text style={styles.kaydetBtnText}>KAYDET →</Text>}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.sifreDuzenleBtn}
          onPress={() => setSifreDuzenle(!sifreDuzenle)}
        >
          <Text style={styles.sifreDuzenleBtnText}>{sifreDuzenle ? 'İptal' : '🔒 Şifre Değiştir'}</Text>
        </TouchableOpacity>

        {sifreDuzenle && (
          <View style={styles.infoKart}>
            <TextInput
              style={styles.sifreInput}
              placeholder="Mevcut şifre"
              placeholderTextColor="#4a5568"
              value={eskiSifre}
              onChangeText={setEskiSifre}
              secureTextEntry
            />
            <View style={styles.ayrac} />
            <TextInput
              style={styles.sifreInput}
              placeholder="Yeni şifre (en az 6 karakter)"
              placeholderTextColor="#4a5568"
              value={yeniSifre}
              onChangeText={setYeniSifre}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.kaydetBtn, { marginTop: 12 }, sifreYukleniyor && { opacity: 0.6 }]}
              onPress={handleSifreDegistir}
              disabled={sifreYukleniyor}
            >
              {sifreYukleniyor ? <ActivityIndicator color="#fff" /> : <Text style={styles.kaydetBtnText}>ŞİFREYİ GÜNCELLE →</Text>}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.cikisBtn} onPress={handleCikis}>
          <Text style={styles.cikisBtnText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  duzenleBtn: { color: '#4a7ab5', fontSize: 14, fontWeight: '600' },
  content: { alignItems: 'center', padding: 24, paddingBottom: 40 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1a56db', justifyContent: 'center', alignItems: 'center', marginTop: 32, marginBottom: 16 },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  isim: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 4 },
  email: { color: '#4a5568', fontSize: 14, marginBottom: 32 },
  infoKart: { width: '100%', backgroundColor: '#0d1526', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1e2d4a', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { color: '#4a5568', fontSize: 14 },
  infoValue: { color: '#e2e8f0', fontSize: 14, fontWeight: '600', flex: 1, textAlign: 'right' },
  input: { color: '#e2e8f0', fontSize: 14, borderBottomWidth: 1, borderBottomColor: '#4a7ab5', paddingVertical: 4, minWidth: 150, textAlign: 'right' },
  sifreInput: { color: '#e2e8f0', fontSize: 14, paddingVertical: 10 },
  ayrac: { height: 1, backgroundColor: '#1e2d4a', marginVertical: 4 },
  kaydetBtn: { width: '100%', backgroundColor: '#1a56db', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  kaydetBtnText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  sifreDuzenleBtn: { width: '100%', backgroundColor: '#0d1526', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#1e2d4a' },
  sifreDuzenleBtnText: { color: '#4a7ab5', fontSize: 14, fontWeight: '600' },
  cikisBtn: { width: '100%', backgroundColor: '#1f0a0a', borderRadius: 12, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e53e3e' },
  cikisBtnText: { color: '#fc8181', fontSize: 15, fontWeight: '700' },
});
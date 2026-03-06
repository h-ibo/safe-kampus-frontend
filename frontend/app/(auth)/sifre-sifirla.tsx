import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

export default function SifreSifirlaScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [yeniSifre, setYeniSifre] = useState('');
  const [tekrar, setTekrar] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [hata, setHata] = useState('');

  const handleSifirla = async () => {
    if (!yeniSifre || !tekrar) { setHata('Lütfen tüm alanları doldurun.'); return; }
    if (yeniSifre !== tekrar) { setHata('Şifreler eşleşmiyor.'); return; }
    if (yeniSifre.length < 6) { setHata('Şifre en az 6 karakter olmalı.'); return; }
    setHata('');
    setYukleniyor(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/auth/sifre-sifirla?token=${token}&yeni_sifre=${encodeURIComponent(yeniSifre)}`,
        { method: 'POST' }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Bir hata oluştu.');
      setBasarili(true);
    } catch (e: any) {
      setHata(e.message);
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔐</Text>
        </View>

        <Text style={styles.title}>Yeni Şifre</Text>
        <Text style={styles.subtitle}>Hesabınız için yeni bir şifre belirleyin.</Text>

        {basarili ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Şifre Güncellendi!</Text>
            <Text style={styles.successText}>Yeni şifrenizle giriş yapabilirsiniz.</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>YENİ ŞİFRE</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#4a5568"
                value={yeniSifre}
                onChangeText={setYeniSifre}
                secureTextEntry
              />
            </View>

            <Text style={[styles.inputLabel, { marginTop: 12 }]}>ŞİFRE TEKRAR</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#4a5568"
                value={tekrar}
                onChangeText={setTekrar}
                secureTextEntry
              />
            </View>

            {hata ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {hata}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.btn, yukleniyor && styles.btnDisabled]}
              onPress={handleSifirla}
              disabled={yukleniyor}
            >
              {yukleniyor
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>ŞİFREYİ GÜNCELLE →</Text>
              }
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 80 },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  icon: { fontSize: 64 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  subtitle: { color: '#4a5568', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  formCard: { backgroundColor: '#0d1526', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#1e2d4a' },
  inputLabel: { color: '#4a7ab5', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1e2d4a', paddingHorizontal: 14, marginBottom: 8 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#e2e8f0', fontSize: 15, paddingVertical: 14 },
  errorBox: { backgroundColor: '#1f0a0a', borderRadius: 10, padding: 12, marginVertical: 12, borderLeftWidth: 3, borderLeftColor: '#e53e3e' },
  errorText: { color: '#fc8181', fontSize: 13 },
  btn: { backgroundColor: '#1a56db', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  successBox: { backgroundColor: '#0a1f0a', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#276749' },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: { color: '#68d391', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  successText: { color: '#4a5568', fontSize: 14, textAlign: 'center', marginBottom: 24 },
  loginBtn: { backgroundColor: '#1a56db', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24 },
  loginBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

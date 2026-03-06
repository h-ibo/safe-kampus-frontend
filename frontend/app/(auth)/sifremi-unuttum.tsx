import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';

export default function SifremiUnuttumScreen() {
  const [email, setEmail] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basarili, setBasarili] = useState(false);
  const [hata, setHata] = useState('');

  const handleGonder = async () => {
    if (!email) { setHata('Lütfen email adresinizi girin.'); return; }
    setHata('');
    setYukleniyor(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/auth/sifre-sifirla-talep?email=${encodeURIComponent(email)}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Bir hata oluştu.');
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
      <View style={styles.bgCircle} />

      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔑</Text>
        </View>

        <Text style={styles.title}>Şifremi Unuttum</Text>
        <Text style={styles.subtitle}>
          Email adresinizi girin, şifre sıfırlama linki gönderelim.
        </Text>

        {basarili ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Email Gönderildi!</Text>
            <Text style={styles.successText}>
              Eğer bu email kayıtlıysa sıfırlama linki gönderildi. Lütfen emailinizi kontrol edin.
            </Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginBtnText}>Giriş Sayfasına Dön</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.inputLabel}>E-POSTA</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>✉</Text>
              <TextInput
                style={styles.input}
                placeholder="ornek@universite.edu.tr"
                placeholderTextColor="#4a5568"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {hata ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠ {hata}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.gonderBtn, yukleniyor && styles.gonderBtnDisabled]}
              onPress={handleGonder}
              disabled={yukleniyor}
              activeOpacity={0.85}
            >
              {yukleniyor
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.gonderBtnText}>SIFIRLAMA LİNKİ GÖNDER →</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>İptal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  bgCircle: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: '#0d1f35', top: -80, right: -60 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60 },
  backButton: { marginBottom: 32 },
  backButtonText: { color: '#4a7ab5', fontSize: 15, fontWeight: '600' },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  icon: { fontSize: 64 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
  subtitle: { color: '#4a5568', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  formCard: { backgroundColor: '#0d1526', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#1e2d4a' },
  inputLabel: { color: '#4a7ab5', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1e2d4a', paddingHorizontal: 14, marginBottom: 16 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#e2e8f0', fontSize: 15, paddingVertical: 14 },
  errorBox: { backgroundColor: '#1f0a0a', borderRadius: 10, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#e53e3e' },
  errorText: { color: '#fc8181', fontSize: 13 },
  gonderBtn: { backgroundColor: '#1a56db', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  gonderBtnDisabled: { opacity: 0.6 },
  gonderBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  cancelBtn: { alignItems: 'center', marginTop: 16 },
  cancelBtnText: { color: '#4a5568', fontSize: 14 },
  successBox: { backgroundColor: '#0a1f0a', borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#276749' },
  successIcon: { fontSize: 48, marginBottom: 16 },
  successTitle: { color: '#68d391', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  successText: { color: '#4a5568', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  loginBtn: { backgroundColor: '#1a56db', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, alignItems: 'center' },
  loginBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

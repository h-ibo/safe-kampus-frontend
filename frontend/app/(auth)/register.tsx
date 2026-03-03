import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const [isim, setIsim] = useState('');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [basarili, setBasarili] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    if (!isim || !email || !sifre || !sifreTekrar) {
      setHata('Lütfen tüm alanları doldurun.');
      return;
    }
    if (sifre !== sifreTekrar) {
      setHata('Şifreler eşleşmiyor.');
      return;
    }
    if (sifre.length < 6) {
      setHata('Şifre en az 6 karakter olmalıdır.');
      return;
    }
    setHata('');
    setYukleniyor(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isim, email, sifre }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Kayıt başarısız.');
      setBasarili(true);
      setTimeout(() => router.replace('/(auth)/login'), 1500);
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
      <View style={styles.bgAccent} />
      <View style={styles.bgDot} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          
          {/* Geri butonu */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>

          {/* Başlık */}
          <View style={styles.header}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>YENİ HESAP</Text>
            </View>
            <Text style={styles.title}>Kayıt Ol</Text>
            <Text style={styles.subtitle}>SafeKampus'a katılın ve kampüsünüzü güvenli tutun</Text>
          </View>

          {/* Başarı mesajı */}
          {basarili ? (
            <View style={styles.successBox}>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successText}>Hesabınız oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...</Text>
            </View>
          ) : (
            <View style={styles.formCard}>

              <InputField
                label="AD SOYAD"
                icon="👤"
                placeholder="Adınız Soyadınız"
                value={isim}
                onChangeText={setIsim}
              />

              <InputField
                label="E-POSTA"
                icon="✉"
                placeholder="ornek@universite.edu.tr"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <InputField
                label="ŞİFRE"
                icon="🔒"
                placeholder="En az 6 karakter"
                value={sifre}
                onChangeText={setSifre}
                secureTextEntry
              />

              <InputField
                label="ŞİFRE TEKRAR"
                icon="🔒"
                placeholder="Şifrenizi tekrar girin"
                value={sifreTekrar}
                onChangeText={setSifreTekrar}
                secureTextEntry
              />

              {hata ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠ {hata}</Text>
                </View>
              ) : null}

              {/* Şifre gücü göstergesi */}
              {sifre.length > 0 && (
                <View style={styles.strengthContainer}>
                  <Text style={styles.strengthLabel}>Şifre Gücü:</Text>
                  <View style={styles.strengthBar}>
                    <View style={[
                      styles.strengthFill,
                      { width: `${Math.min(sifre.length * 10, 100)}%` as any },
                      sifre.length < 6 ? styles.strengthWeak :
                      sifre.length < 10 ? styles.strengthMedium : styles.strengthStrong
                    ]} />
                  </View>
                  <Text style={styles.strengthText}>
                    {sifre.length < 6 ? 'Zayıf' : sifre.length < 10 ? 'Orta' : 'Güçlü'}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.registerButton, yukleniyor && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={yukleniyor}
                activeOpacity={0.85}
              >
                {yukleniyor ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>HESAP OLUŞTUR →</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.loginLinkText}>
                  Zaten hesabınız var mı? <Text style={styles.loginLinkAccent}>Giriş Yap</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputField({ label, icon, placeholder, value, onChangeText, keyboardType, autoCapitalize, secureTextEntry }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#4a5568"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize || 'sentences'}
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b14',
  },
  bgAccent: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#0d1f35',
    top: -100,
    left: -50,
  },
  bgDot: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1a0d0d',
    bottom: 100,
    right: -50,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 60,
  },
  backButton: {
    marginBottom: 24,
  },
  backButtonText: {
    color: '#4a7ab5',
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    marginBottom: 32,
  },
  headerBadge: {
    backgroundColor: '#0d1f35',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e3a5f',
  },
  headerBadgeText: {
    color: '#4a7ab5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  subtitle: {
    color: '#4a5568',
    fontSize: 14,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#0d1526',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: '#1e2d4a',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#4a7ab5',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2d4a',
    paddingHorizontal: 14,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#e2e8f0',
    fontSize: 15,
    paddingVertical: 14,
  },
  errorBox: {
    backgroundColor: '#1f0a0a',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#e53e3e',
  },
  errorText: {
    color: '#fc8181',
    fontSize: 13,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  strengthLabel: {
    color: '#4a5568',
    fontSize: 12,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#1e2d4a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthWeak: { backgroundColor: '#e53e3e' },
  strengthMedium: { backgroundColor: '#d69e2e' },
  strengthStrong: { backgroundColor: '#38a169' },
  strengthText: {
    color: '#4a5568',
    fontSize: 12,
    width: 40,
  },
  registerButton: {
    backgroundColor: '#1a56db',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1a56db',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginLinkText: {
    color: '#4a5568',
    fontSize: 14,
  },
  loginLinkAccent: {
    color: '#4a7ab5',
    fontWeight: '700',
  },
  successBox: {
    backgroundColor: '#0a1f0a',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#276749',
  },
  successIcon: {
    fontSize: 48,
    color: '#38a169',
    marginBottom: 16,
  },
  successText: {
    color: '#68d391',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
});

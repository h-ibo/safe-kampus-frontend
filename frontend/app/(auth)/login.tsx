import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: false }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: false }),
      Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: false }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !sifre) {
      setHata("Lütfen tüm alanları doldurun.");
      return;
    }
    setHata("");
    setYukleniyor(true);
    try {
      const response = await fetch("https://safe-kampus-backend-production.up.railway.app/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, sifre }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Giriş başarısız.");
      await AsyncStorage.setItem("token", data.access_token);
      await AsyncStorage.setItem("user_isim", data.isim);
      await AsyncStorage.setItem("user_rol", data.rol);
      await AsyncStorage.setItem("user_email", email);
      await AsyncStorage.setItem("user_id", data.id.toString());
      try {
        const { registerForPushNotifications } = await import("../../utils/notifications");
        await registerForPushNotifications();
      } catch (e) { console.log("Push token hatasi:", e); }
      if (data.rol === "admin" || data.rol === "guvenlik") {
        router.replace("/(admin)");
      } else {
        router.replace("/(tabs)");
      }
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
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgLine} />

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        
        <Animated.View style={[styles.logoContainer, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoIcon}>
            <View style={styles.logoShield}>
              <Text style={styles.logoShieldText}>S</Text>
            </View>
          </View>
          <Text style={styles.logoText}>SAFE<Text style={styles.logoAccent}>KAMPUS</Text></Text>
          <Text style={styles.logoTagline}>Kampüs Güvenlik Sistemi</Text>
        </Animated.View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Giriş Yap</Text>
          <Text style={styles.formSubtitle}>Hesabınıza erişin</Text>

          <View style={styles.inputGroup}>
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
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ŞİFRE</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputIcon}>🔒</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#4a5568"
                value={sifre}
                onChangeText={setSifre}
                secureTextEntry={!sifreGoster}
              />
              <TouchableOpacity onPress={() => setSifreGoster(!sifreGoster)}>
                <Text style={styles.inputIconRight}>{sifreGoster ? '👁' : '👁‍🗨'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => router.push('/(auth)/sifremi-unuttum')}
          >
            <Text style={styles.forgotButtonText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          {hata ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {hata}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.loginButton, yukleniyor && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={yukleniyor}
            activeOpacity={0.85}
          >
            {yukleniyor ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>GİRİŞ YAP →</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>
          

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Hesap Oluştur</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>© 2025 SafeKampus • Güvenli Kampüs Platformu</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  bgCircle1: { position: 'absolute', width: 350, height: 350, borderRadius: 175, backgroundColor: '#0d2137', top: -100, right: -80, opacity: 0.8 },
  bgCircle2: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: '#1a0a0a', bottom: 50, left: -80, opacity: 0.9 },
  bgLine: { position: 'absolute', width: 2, height: '100%', backgroundColor: '#1e3a5f', left: width * 0.15, opacity: 0.3 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  logoIcon: { marginBottom: 12 },
  logoShield: { width: 64, height: 64, backgroundColor: '#1a56db', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  logoShieldText: { color: '#fff', fontSize: 32, fontWeight: '900' },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: 4 },
  logoAccent: { color: '#1a56db' },
  logoTagline: { color: '#4a5568', fontSize: 12, letterSpacing: 2, marginTop: 4 },
  formCard: { backgroundColor: '#0d1526', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#1e2d4a' },
  formTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 4 },
  formSubtitle: { color: '#4a5568', fontSize: 14, marginBottom: 28 },
  inputGroup: { marginBottom: 18 },
  inputLabel: { color: '#4a7ab5', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111827', borderRadius: 12, borderWidth: 1, borderColor: '#1e2d4a', paddingHorizontal: 14 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  inputIconRight: { fontSize: 16, marginLeft: 10 },
  input: { flex: 1, color: '#e2e8f0', fontSize: 15, paddingVertical: 14 },
  errorBox: { backgroundColor: '#1f0a0a', borderRadius: 10, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#e53e3e' },
  errorText: { color: '#fc8181', fontSize: 13 },
  loginButton: { backgroundColor: '#1a56db', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#1e2d4a' },
  dividerText: { color: '#4a5568', fontSize: 12, marginHorizontal: 12 },
  registerButton: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#1e2d4a' },
  registerButtonText: { color: '#4a7ab5', fontSize: 15, fontWeight: '600' },
  footer: { color: '#2d3748', fontSize: 11, textAlign: 'center', marginTop: 24, letterSpacing: 0.5 },
  forgotButton: { alignItems: 'flex-end', marginBottom: 16 },
  forgotButtonText: { color: '#4a7ab5', fontSize: 13 },
});

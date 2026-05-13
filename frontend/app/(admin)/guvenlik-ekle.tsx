import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function GuvenlikEkleScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    isim: '',
    email: '',
    sifre: '',
    telefon: ''
  });
  const [yukleniyor, setYukleniyor] = useState(false);

  const handleEkle = async () => {
    if (!form.isim || !form.email || !form.sifre) {
      Alert.alert("Hata", "Lütfen zorunlu alanları doldurun.");
      return;
    }

    setYukleniyor(true);
    try {
      const token = await AsyncStorage.getItem('token'); // Admin token'ını al
      const response = await fetch('https://safe-kampus-backend.onrender.com/users/create-security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Başarılı", "Güvenlik görevlisi başarıyla oluşturuldu.");
        router.back(); // Başarılıysa geri dön
      } else {
        Alert.alert("Hata", result.detail || "Bir sorun oluştu.");
      }
    } catch (error) {
      Alert.alert("Hata", "Sunucuya bağlanılamadı.");
    } finally {
      setYukleniyor(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.baslik}>Yeni Güvenlik Görevlisi</Text>
      
      <TextInput 
        placeholder="Ad Soyad" 
        style={styles.input} 
        onChangeText={(text) => setForm({...form, isim: text})}
      />
      <TextInput 
        placeholder="E-posta" 
        style={styles.input} 
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(text) => setForm({...form, email: text})}
      />
      <TextInput 
        placeholder="Şifre" 
        secureTextEntry 
        style={styles.input} 
        onChangeText={(text) => setForm({...form, sifre: text})}
      />
      <TextInput 
        placeholder="Telefon (Opsiyonel)" 
        style={styles.input} 
        keyboardType="phone-pad"
        onChangeText={(text) => setForm({...form, telefon: text})}
      />

      <TouchableOpacity 
        style={[styles.buton, yukleniyor && {backgroundColor: '#ccc'}]} 
        onPress={handleEkle}
        disabled={yukleniyor}
      >
        <Text style={styles.butonMetin}>{yukleniyor ? 'Ekleniyor...' : 'Görevliyi Kaydet'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  baslik: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1a56db' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 8, marginBottom: 15 },
  buton: { backgroundColor: '#1a56db', padding: 18, borderRadius: 8, alignItems: 'center' },
  butonMetin: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
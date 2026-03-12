import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../constants/api';

export default function ChatScreen() {
  const [guvenlikListesi, setGuvenlikListesi] = useState<any[]>([]);
  const [seciliKisi, setSeciliKisi] = useState<any>(null);
  const [mesajlar, setMesajlar] = useState<any[]>([]);
  const [yeniMesaj, setYeniMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const init = async () => {
      const id = await AsyncStorage.getItem('user_id');
      setUserId(id);
      fetchGuvenlikListesi();
    };
    init();
  }, []);

  useEffect(() => {
    if (seciliKisi) {
      fetchMesajlar();
      const interval = setInterval(fetchMesajlar, 5000);
      return () => clearInterval(interval);
    }
  }, [seciliKisi]);

  const fetchGuvenlikListesi = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/chats/guvenlik-listesi`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setGuvenlikListesi(data);
    } catch (e) { console.error(e); }
  };

  const fetchMesajlar = async () => {
    if (!seciliKisi) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/chats/${seciliKisi.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMesajlar(Array.isArray(data) ? data : []);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) { console.error(e); }
  };

  const mesajGonder = async () => {
    if (!yeniMesaj.trim() || !seciliKisi) return;
    try {
      const token = await AsyncStorage.getItem('token');
      await fetch(`${API_URL}/chats/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: seciliKisi.id, mesaj: yeniMesaj }),
      });
      setYeniMesaj('');
      fetchMesajlar();
    } catch (e) { console.error(e); }
  };

  const resimSec = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişimi gerekiyor.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0].base64) {
      const token = await AsyncStorage.getItem('token');
      const uploadRes = await fetch(`${API_URL}/chats/resim-yukle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image: `data:image/jpeg;base64,${result.assets[0].base64}` }),
      });
      const uploadData = await uploadRes.json();
      await fetch(`${API_URL}/chats/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ receiver_id: seciliKisi.id, image_url: uploadData.image_url }),
      });
      fetchMesajlar();
    }
  };

  const formatTarih = (tarih: string) => {
    const d = new Date(tarih);
    return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!seciliKisi) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💬 Mesajlar</Text>
          <Text style={styles.headerSub}>Güvenlik birimiyle iletişim</Text>
        </View>
        <FlatList
          data={guvenlikListesi}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.kisiCard} onPress={() => setSeciliKisi(item)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.isim[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.kisiIsim}>{item.isim}</Text>
                <Text style={styles.kisiRol}>{item.rol === 'admin' ? '👑 Admin' : '🛡️ Güvenlik'}</Text>
              </View>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyIcon}>👮</Text>
              <Text style={styles.emptyText}>Güvenlik personeli bulunamadı</Text>
            </View>
          }
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setSeciliKisi(null)}>
          <Text style={styles.backBtn}>← Geri</Text>
        </TouchableOpacity>
        <View style={styles.headerKisi}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarSmallText}>{seciliKisi.isim[0]}</Text>
          </View>
          <Text style={styles.headerTitle}>{seciliKisi.isim}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={mesajlar}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        renderItem={({ item }) => {
          const benim = item.sender_id.toString() === userId;
          return (
            <View style={[styles.bubble, benim ? styles.bubbleBenim : styles.bubbleKarsi]}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.mesajResim} resizeMode="cover" />
              ) : (
                <Text style={[styles.bubbleText, benim ? styles.bubbleTextBenim : styles.bubbleTextKarsi]}>
                  {item.mesaj}
                </Text>
              )}
              <Text style={[styles.bubbleTarih, benim ? { color: '#93c5fd' } : { color: '#4a5568' }]}>
                {formatTarih(item.created_at)}
              </Text>
            </View>
          );
        }}
      />

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.resimBtn} onPress={resimSec}>
          <Text style={styles.resimBtnText}>📷</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={yeniMesaj}
          onChangeText={setYeniMesaj}
          placeholder="Mesaj yaz..."
          placeholderTextColor="#4a5568"
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={mesajGonder}>
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#4a5568', fontSize: 13, marginTop: 2 },
  headerKisi: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  backBtn: { color: '#1a56db', fontSize: 16, marginBottom: 8 },
  kisiCard: { backgroundColor: '#0d1526', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1e2d4a' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1a56db', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '800' },
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1a56db', alignItems: 'center', justifyContent: 'center' },
  avatarSmallText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  kisiIsim: { color: '#fff', fontSize: 16, fontWeight: '700' },
  kisiRol: { color: '#4a5568', fontSize: 13, marginTop: 2 },
  arrow: { color: '#4a5568', fontSize: 24, marginLeft: 'auto' },
  centered: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { color: '#4a5568', fontSize: 15 },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12, marginBottom: 8 },
  bubbleBenim: { alignSelf: 'flex-end', backgroundColor: '#1a56db', borderBottomRightRadius: 4 },
  bubbleKarsi: { alignSelf: 'flex-start', backgroundColor: '#0d1526', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#1e2d4a' },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTextBenim: { color: '#fff' },
  bubbleTextKarsi: { color: '#e2e8f0' },
  bubbleTarih: { fontSize: 11, marginTop: 4, textAlign: 'right' },
  mesajResim: { width: 200, height: 150, borderRadius: 12 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#0d1526', borderTopWidth: 1, borderTopColor: '#1e2d4a', gap: 8 },
  resimBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1e2d4a', alignItems: 'center', justifyContent: 'center' },
  resimBtnText: { fontSize: 18 },
  input: { flex: 1, backgroundColor: '#111827', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#e2e8f0', fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: '#1e2d4a' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a56db', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 18 },
});

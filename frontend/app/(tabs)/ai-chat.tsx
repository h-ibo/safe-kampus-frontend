import { apiFetch } from '@/constants/api';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AIChatScreen() {
  const [mesajlar, setMesajlar] = useState<any[]>([
    { id: 0, tip: 'ai', metin: 'Merhaba! Ben Harran Üniversitesi AI asistanıyım. Size üniversite hakkında bilgi verebilirim. Ne sormak istersiniz?' }
  ]);
  const [soru, setSoru] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const soruGonder = async () => {
    if (!soru.trim() || yukleniyor) return;
    const soruMetni = soru.trim();
    setSoru('');
    
    setMesajlar(prev => [...prev, { id: Date.now(), tip: 'kullanici', metin: soruMetni }]);
    setYukleniyor(true);
    
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    
    try {
      const res = await apiFetch('/ai-chat/', {
        method: 'POST',
        body: JSON.stringify({ soru: soruMetni }),
      });
      const data = await res.json();
      setMesajlar(prev => [...prev, { id: Date.now() + 1, tip: 'ai', metin: data.cevap }]);
    } catch (e) {
      setMesajlar(prev => [...prev, { id: Date.now() + 1, tip: 'ai', metin: 'Bir hata oluştu, lütfen tekrar deneyin.' }]);
    } finally {
      setYukleniyor(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const renderMesaj = ({ item }: any) => {
    const benim = item.tip === 'kullanici';
    return (
      <View style={[styles.bubble, benim ? styles.bubbleBenim : styles.bubbleAI]}>
        {!benim && <Text style={styles.aiLabel}>🤖 AI Asistan</Text>}
        <Text style={[styles.bubbleText, benim ? styles.textBenim : styles.textAI]}>
          {item.metin}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 AI Asistan</Text>
        <Text style={styles.headerSub}>Harran Üniversitesi Bilgi Sistemi</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={mesajlar}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.liste}
        renderItem={renderMesaj}
      />

      {yukleniyor && (
        <View style={styles.yukleniyor}>
          <ActivityIndicator color="#1a56db" size="small" />
          <Text style={styles.yukleniyorText}>AI düşünüyor...</Text>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={soru}
          onChangeText={setSoru}
          placeholder="Üniversite hakkında soru sorun..."
          placeholderTextColor="#4a5568"
          multiline
          onSubmitEditing={soruGonder}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!soru.trim() || yukleniyor) && styles.sendBtnDisabled]}
          onPress={soruGonder}
          disabled={!soru.trim() || yukleniyor}
        >
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
  headerSub: { color: '#4a5568', fontSize: 12, marginTop: 2 },
  liste: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '80%', borderRadius: 18, padding: 14, marginBottom: 12 },
  bubbleBenim: { alignSelf: 'flex-end', backgroundColor: '#1a56db', borderBottomRightRadius: 4 },
  bubbleAI: { alignSelf: 'flex-start', backgroundColor: '#0d1526', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#1e2d4a' },
  aiLabel: { color: '#4a7ab5', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  textBenim: { color: '#fff' },
  textAI: { color: '#e2e8f0' },
  yukleniyor: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingHorizontal: 16 },
  yukleniyorText: { color: '#4a5568', fontSize: 13 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#0d1526', borderTopWidth: 1, borderTopColor: '#1e2d4a', gap: 8 },
  input: { flex: 1, backgroundColor: '#111827', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#e2e8f0', fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: '#1e2d4a' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1a56db', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 18 },
});

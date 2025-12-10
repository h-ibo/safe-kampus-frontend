import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [serverMessage, setServerMessage] = useState<string>('Bağlanıyor...');
  const [loading, setLoading] = useState<boolean>(true);
  const [errorDetails, setErrorDetails] = useState<string>('');

  // 10.117.23.213 senin IP adresindi, burası doğru.
  const API_URL = 'http://10.117.23.213:8000';

  const testConnection = async () => {
    setLoading(true);
    setErrorDetails('');
    setServerMessage('Bağlanıyor...');

    try {
      console.log(`İstek atılıyor: ${API_URL}/`);
      
      const response = await axios.get(`${API_URL}/`, { timeout: 5000 });

      console.log('Cevap geldi:', response.data);
      setServerMessage(JSON.stringify(response.data, null, 2));
      
    } catch (error: any) { // <-- DÜZELTME BURADA: ': any' ekledik
      console.error('Bağlantı Hatası:', error);
      
      let errorMessage = 'Bağlantı başarısız!';
      if (error.message) errorMessage += `\n(${error.message})`;
      if (error.response) {
        errorMessage += `\nStatus: ${error.response.status}`;
      }
      
      setServerMessage('HATA OLUŞTU');
      setErrorDetails(errorMessage + '\n\nİPUCU: Telefon ve Bilgisayar aynı Wi-Fi ağında mı?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>SafeKampus Projesi</Text>
        <Text style={styles.subtitle}>Backend Bağlantı Testi</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Hedef Sunucu:</Text>
          <Text style={styles.ipAddress}>{API_URL}</Text>
          
          <View style={styles.separator} />

          <Text style={styles.label}>Durum:</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <>
              <Text style={errorDetails ? styles.errorText : styles.successText}>
                {serverMessage}
              </Text>
              {errorDetails ? <Text style={styles.errorDetails}>{errorDetails}</Text> : null}
            </>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button title="Bağlantıyı Tekrar Dene" onPress={testConnection} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30 },
  card: { backgroundColor: 'white', width: '100%', padding: 20, borderRadius: 15, elevation: 5, marginBottom: 20 },
  label: { fontSize: 14, color: '#888', marginBottom: 5, fontWeight: '600' },
  ipAddress: { fontSize: 18, fontWeight: 'bold', color: '#333', fontFamily: 'monospace' },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  successText: { fontSize: 18, color: 'green', fontWeight: 'bold' },
  errorText: { fontSize: 18, color: 'red', fontWeight: 'bold' },
  errorDetails: { marginTop: 10, fontSize: 14, color: '#d9534f', backgroundColor: '#fff5f5', padding: 10, borderRadius: 5 },
  buttonContainer: { width: '100%' }
});
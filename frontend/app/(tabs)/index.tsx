import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native'; // React Native bileşenlerini import et

export default function TabOneScreen() { // Dosya adına göre fonksiyon adını değiştirebilirsin
  // 1. State Değişkenleri (React Web ile aynı)
  const [apiVerisi, setApiVerisi] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);

  // 2. useEffect ile API Çağrısı (React Web ile aynı mantık)
  useEffect(() => {
    // Backend API'mızın URL'si (Bilgisayarının IP'si yerine localhost kullanıyoruz çünkü web modundayız)
    const backendUrl = 'http://127.0.0.1:8000/api/test';

    fetch(backendUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP hatası! Durum: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setApiVerisi(data);
        setYukleniyor(false);
      })
      .catch(error => {
        console.error("API çağrısı sırasında hata oluştu:", error);
        setHata(`Veri alınamadı: ${error.message}`);
        setYukleniyor(false);
      });

  }, []); // Sadece ilk render'da çalıştır

  // 3. Veriyi Ekranda Gösterme (React Native bileşenleri ile)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Backend API Testi:</Text>

      {/* Yükleniyor durumu */}
      {yukleniyor && <Text>Veri yükleniyor...</Text>}

      {/* Hata durumu */}
      {hata && <Text style={styles.errorText}>Hata: {hata}</Text>}

      {/* Başarılı veri durumu */}
      {apiVerisi && (
        <View style={styles.dataContainer}>
          <Text>Backend'den Gelen Yanıt:</Text>
          {/* JSON verisini string'e çevirip gösterelim */}
          <Text style={styles.jsonText}>{JSON.stringify(apiVerisi, null, 2)}</Text>
          {/* Direkt veriye erişim */}
          {/* TypeScript kullanıyorsak apiVerisi.data hata verebilir, şimdilik any varsayıyoruz */}
          <Text>Veri Alanı: {(apiVerisi as any)?.data}</Text>
        </View>
      )}
    </View>
  );
}

// --- Basit Stil Tanımlamaları ---
// React Native'de stil için CSS yerine JavaScript objeleri kullanılır
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dataContainer: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    width: '100%',
  },
  jsonText: {
    fontFamily: 'monospace', // JSON'u daha okunaklı göstermek için
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 5,
  },
  errorText: {
    color: 'red',
    marginTop: 15,
  },
});
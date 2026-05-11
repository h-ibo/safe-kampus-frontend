import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
// Harita bileşenlerini doğrudan import ediyoruz
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; 

export default function HaritaScreen() {
  const [olaylar, setOlaylar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [konum, setKonum] = useState<any>(null);
  const mapRef = useRef<MapView>(null);

  // Başlangıç bölgesi: Konum alınana kadar Harran Üniversitesi
  const [region, setRegion] = useState({
    latitude: 37.1591,
    longitude: 38.7969,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Konum İzni ve Canlı Konum Alımı
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          
          const currentCoords = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          setKonum(loc.coords);
          setRegion(currentCoords);
          
          // Haritayı kullanıcının bulunduğu yere yumuşakça kaydır
          mapRef.current?.animateToRegion(currentCoords, 1000);
        }

        // 2. Olay Verilerini Çekme
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('https://safe-kampus-backend.onrender.com/olaylar/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // Sadece geçerli koordinatları olan olayları filtrele
          setOlaylar(data.filter((o: any) => o.latitude && o.longitude));
        }
      } catch (e) {
        console.error("Veri yükleme hatası:", e);
      } finally {
        setYukleniyor(false);
      }
    };

    init();
  }, []);

  // Web platformu desteği kısıtlıdır
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🗺️ Kampüs Haritası</Text>
        </View>
        <View style={styles.centered}>
          <Text style={styles.icon}>🗺️</Text>
          <Text style={styles.text}>Harita sadece mobil uygulamada çalışır</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Kampüs Haritası</Text>
        <Text style={styles.headerSub}>{olaylar.length} konumlu olay listeleniyor</Text>
      </View>

      {yukleniyor ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#1a56db" size="large" />
          <Text style={styles.loadingText}>Konum ve veriler yükleniyor...</Text>
        </View>
      ) : (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE} // Android'de beyaz ekranı önlemek için Google sağlayıcısını zorla
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}      // Mavi noktayı gösterir
          showsMyLocationButton={true}  // Sağ üstte "Beni Bul" butonu ekler
          followsUserLocation={true}    // Sen hareket ettikçe harita seni takip eder
          showsCompass={true}
          loadingEnabled={true}         // Harita yüklenirken placeholder gösterir
        >
          {olaylar.map((olay: any) => (
            <Marker
              key={olay.id}
              coordinate={{ 
                latitude: Number(olay.latitude), 
                longitude: Number(olay.longitude) 
              }}
              title={olay.olay_turu}
              description={olay.konum}
              pinColor="#e53e3e"
            />
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 16, 
    backgroundColor: '#0d1526', 
    borderBottomWidth: 1, 
    borderBottomColor: '#1e2d4a',
    zIndex: 10
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#94a3b8', fontSize: 14, marginTop: 8 },
  icon: { fontSize: 64, marginBottom: 8 },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
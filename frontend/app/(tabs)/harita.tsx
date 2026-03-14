import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export default function HaritaScreen() {
  const [olaylar, setOlaylar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [konum, setKonum] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      // Konum izni
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setKonum(loc.coords);
      }
      // Olayları getir
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await fetch('https://safe-kampus-backend-production.up.railway.app/olaylar/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setOlaylar(Array.isArray(data) ? data.filter((o: any) => o.latitude && o.longitude) : []);
      } catch (e) {
        console.error(e);
      } finally {
        setYukleniyor(false);
      }
    };
    init();
  }, []);

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

  const MapView = require('react-native-maps').default;
  const { Marker } = require('react-native-maps');

  const initialRegion = konum ? {
    latitude: konum.latitude,
    longitude: konum.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : {
    latitude: 37.1591,
    longitude: 38.7969,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Kampüs Haritası</Text>
        <Text style={styles.headerSub}>{olaylar.length} konumlu olay</Text>
      </View>
      {yukleniyor ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#1a56db" size="large" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {olaylar.map((olay: any) => (
            <Marker
              key={olay.id}
              coordinate={{ latitude: olay.latitude, longitude: olay.longitude }}
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
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  headerSub: { color: '#4a5568', fontSize: 13, marginTop: 2 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  icon: { fontSize: 64, marginBottom: 8 },
  text: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

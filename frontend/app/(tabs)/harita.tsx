import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function HaritaScreen() {
  const [konum, setKonum] = useState<Location.LocationObject | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const mevcutKonum = await Location.getCurrentPositionAsync({});
        setKonum(mevcutKonum);
      }
      setYukleniyor(false);
    })();
  }, []);

  if (yukleniyor) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.text}>Konum alınıyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kampüs Haritası</Text>
      </View>
      <View style={styles.centered}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.text}>Konumun:</Text>
        {konum && (
          <>
            <Text style={styles.konum}>Enlem: {konum.coords.latitude.toFixed(6)}</Text>
            <Text style={styles.konum}>Boylam: {konum.coords.longitude.toFixed(6)}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16, marginTop: 12 },
  icon: { fontSize: 48, marginBottom: 12 },
  konum: { color: '#3b82f6', fontSize: 14, marginTop: 8 },
});
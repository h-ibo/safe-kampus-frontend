import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HaritaScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kampüs Haritası</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.icon}>🗺️</Text>
        <Text style={styles.text}>Harita yakında eklenecek</Text>
        <Text style={styles.sub}>Leaflet veya Google Maps entegrasyonu</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070b14' },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: '#0d1526', borderBottomWidth: 1, borderBottomColor: '#1e2d4a' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  icon: { fontSize: 64, marginBottom: 16 },
  text: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  sub: { color: '#4a5568', fontSize: 13 },
});

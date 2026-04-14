import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { HydrationCard } from '@/components/HydrationCard';
import { ObjectiveCard } from '@/components/ObjectiveCard';
import { ChallengeCard } from '@/components/ChallengeCard';
import { RankingCard } from '@/components/RankingCard';
import { HistoryCard } from '@/components/HistoryCard';
import { useBLE } from '@/hooks/useBLE'; 

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [menuVisible, setMenuVisible] = useState(false);
  const [hydrationAmount, setHydrationAmount] = useState(1.8);
  const [hydrationGoal] = useState(3.2);
  const {
    isConnected,
    isScanning,
    weight,
    statusMsg,
    connectToESP32,
    disconnect,
    tareLoadCell,
    logs,
  } = useBLE();

  // Mock data
  const rankings = [
    { id: '1', name: 'Sarah', water: 3.8 },
    { id: '2', name: 'Mehdi', water: 3.5 },
    { id: '3', name: 'Toi', water: hydrationAmount, isCurrentUser: true },
    { id: '4', name: 'Lina', water: 2.9 },
    { id: '5', name: 'Alex', water: 2.7 },
  ].sort((a, b) => b.water - a.water);

  const historyData = [
    { day: 'L', amount: 2.1 },
    { day: 'M', amount: 2.8 },
    { day: 'M', amount: 2.5 },
    { day: 'J', amount: 3.0 },
    { day: 'V', amount: 2.7 },
    { day: 'S', amount: 3.2 },
    { day: 'D', amount: hydrationAmount },
  ];

  const handleAddWater = (amount: number) => {
    setHydrationAmount(Math.min(hydrationAmount + amount, hydrationGoal + 1));
  };

  const handleMenuItemPress = (item: string) => {
    // TODO: Navigate to different screens based on menu item
    console.log('Menu item pressed:', item);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        onMenuPress={() => setMenuVisible(true)}
        onNotificationsPress={() => console.log('Notifications')}
        onProfilePress={() => console.log('Profile')}
        notificationCount={3}
      />

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onItemPress={handleMenuItemPress}
      />

      <View style={styles.bleContainer}>
        <Text style={styles.bleStatus}>{statusMsg}</Text>
        {weight !== null && (
          <Text style={styles.bleWeight}>💧 {weight.toFixed(2)} L</Text>
        )}
        <TouchableOpacity
          style={[styles.bleButton, isConnected ? styles.bleButtonDisconnect : styles.bleButtonConnect]}
          onPress={isConnected ? disconnect : connectToESP32}
          disabled={isScanning}
        >
          {isScanning
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.bleButtonText}>
                {isConnected ? ' Deconnecter' : ' Connecter ESP32'}
              </Text>
          }
        </TouchableOpacity>

        {isConnected && (
          <TouchableOpacity
            style={[styles.bleButton, styles.bleButtonTare]}
            onPress={tareLoadCell}
          >
            <Text style={styles.bleButtonText}>Tarer la balance</Text>
          </TouchableOpacity>
        )}

      </View>

      <View style={styles.logContainer}>
        <Text style={styles.logTitle}>BLE Log</Text>
        <ScrollView style={styles.logBox}>
          {logs && logs.length > 0 ? (
            logs.map((l, idx) => (
              <Text key={idx} style={styles.logLine}>{l}</Text>
            ))
          ) : (
            <Text style={styles.logEmpty}>No BLE messages yet.</Text>
          )}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hydration Card */}
        <HydrationCard
          current={hydrationAmount}
          goal={hydrationGoal}
          onAddWater={handleAddWater}
        />

        {/* Objective Card */}
        <ObjectiveCard objective={hydrationGoal} region="Rhône-Alpes" />

        {/* Challenges Section */}
        <View style={styles.sectionContainer}>
          <ChallengeCard
            name="Défi hydra... pour les nuls"
            progress={68}
            isOngoing={true}
          />
          <ChallengeCard
            name="Semaine de l'hydratation"
            progress={45}
            isOngoing={false}
          />
        </View>

        {/* Ranking Card */}
        <RankingCard rankings={rankings} />

        {/* History Card */}
        <HistoryCard data={historyData} weeklyProgress={12} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginVertical: 12,
  },
  bleContainer: {
    paddingHorizontal: 16, paddingVertical: 10,
    alignItems: 'center', gap: 6,
  },
  bleStatus: { fontSize: 13, color: '#666' },
  bleWeight: { fontSize: 18, fontWeight: 'bold', color: '#2196F3' },
  bleButton: {
    paddingVertical: 12, paddingHorizontal: 32,
    borderRadius: 25, width: '80%', alignItems: 'center',
  },
  bleButtonConnect:    { backgroundColor: '#2196F3' },
  bleButtonDisconnect: { backgroundColor: '#f44336' },
  bleButtonTare: { backgroundColor: '#2e7d32' },
  bleButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  logContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  logTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  logBox: { maxHeight: 120, backgroundColor: '#fafafa', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#eee' },
  logLine: { fontSize: 12, color: '#333', marginBottom: 4 },
  logEmpty: { fontSize: 12, color: '#999', fontStyle: 'italic' },
});

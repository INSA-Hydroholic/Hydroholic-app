import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  TextInput,
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
import { LoadCellGraph } from '@/components/LoadCellGraph';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/services/api';
import { challengesApi } from '@/services/api';

const MAX_LOAD_CELL_POINTS = 1000;
const CONSUMPTION_REFRESH_MS = 10_000;

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [menuVisible, setMenuVisible] = useState(false);
  const [hydrationAmount, setHydrationAmount] = useState(1.8);
  const [hydrationGoal] = useState(3.2);
  const [totalWaterDrank, setTotalWaterDrank] = useState(0);
  const [loadCellHistory, setLoadCellHistory] = useState<Array<{ value: number; label: string }>>([]);
  const {
    isConnected,
    isScanning,
    weight,
    scaleFactor,
    statusMsg,
    connectToESP32,
    disconnect,
    tareLoadCell,
    requestScaleFactor,
    updateScaleFactor,
    logs,
  } = useBLE();
  const [scaleInput, setScaleInput] = useState('');

  const { user } = useAuth();
  const [userChallenges, setUserChallenges] = useState<any[]>([]);

useEffect(() => {
  if (!user?.id) return;
  challengesApi.getAll()
    .then((res) => {
      const all = Array.isArray(res) ? res : [];
      const userId = String(user.id);
      // Solo los que el usuario ya joined
      const mine = all.filter((c) =>
        (c.participants ?? []).some((p: any) => String(p.userID) === userId)
      );
      setUserChallenges(mine);
    })
    .catch(console.error);
}, [user?.id]);

// Función de progreso (igual que en ChallengesScreen):
const getChallengeProgress = (challenge: any) => {
  const userId = String(user?.id ?? '');
  const objective = Number(challenge.objective_ml || 0);
  const participant = (challenge.participants ?? []).find(
    (p: any) => String(p.userID) === userId
  );
  const progress = Number(participant?.progress_ml ?? 0);
  if (!objective || !progress) return 0;
  return Math.max(0, Math.min(100, Math.round((progress / objective) * 100)));
};

  useEffect(() => {
    if (scaleFactor !== null) {
      setScaleInput(scaleFactor.toFixed(6));
    }
  }, [scaleFactor]);

  useEffect(() => {
    if (weight === null || !Number.isFinite(weight)) {
      return;
    }

    const roundedWeight = Math.round(weight);

    setLoadCellHistory((prev) => {
      const hasSameValue = prev.length > 0 && prev[prev.length - 1].value === roundedWeight;
      if (hasSameValue) {
        return prev;
      }

      const point = {
        value: roundedWeight,
        label: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };

      return [...prev, point].slice(-MAX_LOAD_CELL_POINTS);
    });
  }, [weight]);

  useEffect(() => {
    const fetchConsumption = async () => {
      const userId = user?.id;
      if (userId === undefined || userId === null) {
        return;
      }

      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);

      try {
        const response = await usersApi.getConsumption(String(userId), startOfDay.toISOString(), now.toISOString());
        const totalVolume = Number(response?.totalVolume);
        if (Number.isFinite(totalVolume)) {
          setTotalWaterDrank(Math.abs(totalVolume) / 1000);
        }
      } catch (error) {
        console.log('Error fetching water consumption:', error);
      }
    };

    fetchConsumption();

    const intervalId = setInterval(() => {
      void fetchConsumption();
    }, CONSUMPTION_REFRESH_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [user?.id]);

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

  const handleScaleUpdate = async () => {
    const parsed = Number(scaleInput.replace(',', '.').trim());
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return;
    }
    await updateScaleFactor(parsed);
  };

  const formatWaterAmount = (amount: number) => {
    if (amount >= 1) {
      return `${amount.toFixed(2)} L`;
    }
    return `${Math.round(amount * 1000)} mL`;
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
        <Text style={styles.bleWeight}>💧 {formatWaterAmount(totalWaterDrank)}</Text>
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
          <>
            <TouchableOpacity
              style={[styles.bleButton, styles.bleButtonTare]}
              onPress={tareLoadCell}
            >
              <Text style={styles.bleButtonText}>Tarer la balance</Text>
            </TouchableOpacity>

            <View style={styles.scaleCard}>
              <Text style={styles.scaleTitle}>Facteur de calibration</Text>
              <Text style={styles.scaleCurrentValue}>
                {scaleFactor !== null ? scaleFactor.toFixed(6) : 'Non charge'}
              </Text>

              <TextInput
                value={scaleInput}
                onChangeText={setScaleInput}
                keyboardType="decimal-pad"
                placeholder="Ex: 2280.000000"
                placeholderTextColor="#8a8a8a"
                style={styles.scaleInput}
              />

              <View style={styles.scaleActionsRow}>
                <TouchableOpacity
                  style={[styles.scaleActionButton, styles.scaleReadButton]}
                  onPress={requestScaleFactor}
                >
                  <Text style={styles.bleButtonText}>Lire</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.scaleActionButton, styles.scaleUpdateButton]}
                  onPress={handleScaleUpdate}
                >
                  <Text style={styles.bleButtonText}>Mettre a jour</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

      </View>

      <LoadCellGraph points={loadCellHistory} />

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
        {userChallenges.length > 0 && (
          <View style={styles.sectionContainer}>
            {userChallenges.slice(0, 2).map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                name={challenge.title}
                progress={getChallengeProgress(challenge)}
                isOngoing={challenge.status === 'active'}
              />
            ))}
          </View>
        )}

        <RankingCard />
        <HistoryCard />
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
  scaleCard: {
    width: '90%',
    backgroundColor: '#f3f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe8ff',
    padding: 12,
    gap: 8,
  },
  scaleTitle: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  scaleCurrentValue: { fontSize: 16, fontWeight: '700', color: '#0f4fa8' },
  scaleInput: {
    borderWidth: 1,
    borderColor: '#c8d6f0',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1f2937',
    fontSize: 15,
  },
  scaleActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scaleActionButton: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  scaleReadButton: { backgroundColor: '#0b7fab' },
  scaleUpdateButton: { backgroundColor: '#6b46c1' },
  logContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  logTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  logBox: { maxHeight: 120, backgroundColor: '#fafafa', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#eee' },
  logLine: { fontSize: 12, color: '#333', marginBottom: 4 },
  logEmpty: { fontSize: 12, color: '#999', fontStyle: 'italic' },
});

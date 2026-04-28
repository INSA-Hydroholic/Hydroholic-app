import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { profileApi, hydrationApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

const HYDRATION_REMINDER_THRESHOLD_MS = 3 * 60 * 60 * 1000;
const HYDRATION_REMINDER_STORAGE_PREFIX = 'hydration-reminder:v1';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface HydrationCardProps {
  current?: number;
  goal?: number;
  onAddWater?: (amount: number) => void; // opcional, solo para notificar al padre
}

export const HydrationCard: React.FC<HydrationCardProps> = ({
  current: initialCurrent,
  goal: initialGoal,
  onAddWater,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [current, setCurrent] = useState(initialCurrent ?? 0);
  const [goal, setGoal] = useState(initialGoal ?? 2); // 2L por defecto
  const [isLoading, setIsLoading] = useState(true);
  const [addingAmount, setAddingAmount] = useState<number | null>(null);
  const [lastHydrationAt, setLastHydrationAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof initialCurrent === 'number' && Number.isFinite(initialCurrent)) {
      setCurrent(initialCurrent);
    }
  }, [initialCurrent]);

  useEffect(() => {
    if (typeof initialGoal === 'number' && Number.isFinite(initialGoal)) {
      setGoal(initialGoal);
    }
  }, [initialGoal]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    void Notifications.setNotificationChannelAsync('hydration-reminders', {
      name: 'Hydration reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }, []);

  const syncHydrationReminder = useCallback(
    async (nextCurrent: number, nextGoal: number, nextLastHydrationAt: string | null) => {
      if (!user?.id) {
        return;
      }

      const permission = await Notifications.getPermissionsAsync();
      if (permission.status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync();
        if (requested.status !== 'granted') {
          return;
        }
      }

      const storageKey = `${HYDRATION_REMINDER_STORAGE_PREFIX}:${String(user.id)}`;
      const storedRaw = await AsyncStorage.getItem(storageKey);
      const stored = storedRaw ? (JSON.parse(storedRaw) as { notificationId: string }) : null;

      if (nextCurrent >= nextGoal) {
        if (stored?.notificationId) {
          await Notifications.cancelScheduledNotificationAsync(stored.notificationId).catch(() => {});
        }
        await AsyncStorage.removeItem(storageKey);
        return;
      }

      if (stored?.notificationId) {
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Hydroholic',
          body: 'Tu n\'as pas bu depuis un moment. Pense à boire de l\'eau pour avancer vers ton objectif.',
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: HYDRATION_REMINDER_THRESHOLD_MS / 1000,
          repeats: true,
        },
      });

      await AsyncStorage.setItem(storageKey, JSON.stringify({ notificationId }));
    },
    [user?.id]
  );


  const fetchCurrent = useCallback(async () => {
  if (!user?.id) return;

  const logs = (await profileApi.getWaterHistory(String(user.id))) as Array<{
    weight: number;
    measured_at: string;
  }>;

  const totalMilliliters = logs.reduce((sum, log) => sum + Number(log.weight ?? 0), 0);
  const latestLog = logs.reduce<{
    weight: number;
    measured_at: string;
  } | null>((latest, log) => {
    if (!latest) {
      return log;
    }

    return new Date(log.measured_at).getTime() > new Date(latest.measured_at).getTime() ? log : latest;
  }, null);

  setCurrent(Math.round((totalMilliliters / 1000) * 100) / 100);
  setLastHydrationAt(latestLog?.measured_at ?? null);
}, [user?.id]);


  const fetchData = useCallback(async () => {
  if (!user?.id) return;
  setIsLoading(true);
  try {
    const profile = await profileApi.getById(String(user.id));
    const goalL = Number(profile?.daily_goal ?? 2000) / 1000;
    setGoal(Math.round(goalL * 100) / 100);

    await fetchCurrent(); // ← reutiliza la misma función
  } catch (e) {
    console.error('Erreur chargement:', e);
  } finally {
    setIsLoading(false);
  }
}, [user?.id, fetchCurrent]);

  useEffect(() => { void fetchData(); }, [fetchData]);

    useEffect(() => {
      if (!user?.id || isLoading) {
        return;
      }

      void syncHydrationReminder(current, goal, lastHydrationAt);
    }, [current, goal, isLoading, lastHydrationAt, syncHydrationReminder, user?.id]);

  const handleAddWater = async (liters: number) => {
  if (!user?.id || addingAmount !== null) return;
  setAddingAmount(liters);
  try {
    await hydrationApi.pushMeasurement({
      userId: String(user.id),
      weight: liters * 1000,
      source: 'app',
      measured_at: Date.now(),
    });
    onAddWater?.(liters);
    await fetchCurrent();
  } catch (e) {
    console.error('Erreur ajout eau:', e);
  } finally {
    setAddingAmount(null);
  }
};

  const percentage = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - current);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Ton hydratation aujourd'hui</Text>

      <View style={styles.progressContainer}>
        <Image
          source={require('../assets/images/hydroholic/logo.png')}
          style={styles.waterDropLogo}
        />
        <View style={[styles.progressCircle, {
          borderColor: percentage >= 100 ? Palette.secondary : Palette.primary,
          backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f9f9f9',
        }]}>
          {isLoading ? (
            <ActivityIndicator color={Palette.primary} />
          ) : (
            <>
              <Text style={[styles.percentage, { color: Palette.primary }]}>{percentage}%</Text>
              <Text style={[styles.hydrationText, { color: colors.text }]}>
                {current.toFixed(1)}L / {goal.toFixed(1)}L
              </Text>
            </>
          )}
        </View>
      </View>

      <Text style={[styles.motivationalText, { color: Palette.secondary }]}>
        {isLoading
          ? 'Chargement...'
          : remaining > 0
            ? `Encore ${remaining.toFixed(1)}L pour atteindre ton objectif`
            : '🎉 Bravo, objectif atteint!'}
      </Text>

      <View style={styles.buttonsContainer}>
        {[
          { label: '+250ml', amount: 0.25, color: Palette.accent },
          { label: '+500ml', amount: 0.5,  color: Palette.secondary },
          { label: '+1L',    amount: 1,    color: Palette.dark },
        ].map(({ label, amount, color }) => (
          <Pressable
            key={label}
            style={[styles.button, { backgroundColor: color, opacity: addingAmount !== null ? 0.6 : 1 }]}
            onPress={() => void handleAddWater(amount)}
            disabled={addingAmount !== null}>
            {addingAmount === amount
              ? <ActivityIndicator size="small" color={colors.background} />
              : <Text style={[styles.buttonText, { color: colors.background }]}>{label}</Text>
            }
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: 16, padding: 20, marginHorizontal: 16, marginVertical: 12, borderWidth: 1 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 10, gap: 10 },
  waterDropLogo: { width: 150, height: 150, resizeMode: 'contain' },
  progressCircle: { width: 160, height: 160, borderRadius: 80, borderWidth: 8, alignItems: 'center', justifyContent: 'center' },
  percentage: { fontSize: 48, fontWeight: 'bold' },
  hydrationText: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  motivationalText: { fontSize: 14, textAlign: 'center', marginVertical: 16, fontStyle: 'italic' },
  buttonsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 8 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  buttonText: { fontSize: 12, fontWeight: '600' },
});
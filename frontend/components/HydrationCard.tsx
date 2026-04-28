import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { profileApi, hydrationApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface HydrationCardProps {
  onAddWater?: (amount: number) => void; // opcional, solo para notificar al padre
}

export const HydrationCard: React.FC<HydrationCardProps> = ({ onAddWater }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [current, setCurrent] = useState(0);
  const [goal, setGoal] = useState(2); // 2L por defecto
  const [isLoading, setIsLoading] = useState(true);
  const [addingAmount, setAddingAmount] = useState<number | null>(null);


  const fetchCurrent = useCallback(async () => {
  if (!user?.id) return;
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const consumption = await profileApi.getConsumption(
    String(user.id),
    startOfDay.toISOString(),
    endOfDay.toISOString()
  );
  const liters = Number((consumption as any)?.totalVolume ?? 0) / 1000;
  setCurrent(Math.round(liters * 100) / 100);

  console.log(consumption);
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
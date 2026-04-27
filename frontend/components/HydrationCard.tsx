import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { profileApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface HydrationCardProps {
  current : number;
  goal: number;        // en litros, viene del perfil (daily_goal / 1000)
  onAddWater: (amount: number) => void;
}

export const HydrationCard: React.FC<HydrationCardProps> = ({ goal, onAddWater }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();

  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    profileApi
      .getConsumption(String(user.id), startOfDay.toISOString(), endOfDay.toISOString())
      .then((res: any) => {
        // backend devuelve { totalVolume: number } en gramos
        const liters = (Number(res?.totalVolume ?? 0) / 1000);
        setCurrent(Math.round(liters * 100) / 100);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user?.id]);

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16, padding: 20, marginHorizontal: 16,
    marginVertical: 12, borderWidth: 1,
  },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 20, textAlign: 'center' },
  progressContainer: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', marginVertical: 10, gap: 10,
  },
  waterDropLogo: { width: 150, height: 150, resizeMode: 'contain' },
  progressCircle: {
    width: 160, height: 160, borderRadius: 80, borderWidth: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  percentage: { fontSize: 48, fontWeight: 'bold' },
  hydrationText: { fontSize: 14, marginTop: 8 },
  motivationalText: {
    fontSize: 14, textAlign: 'center',
    marginVertical: 16, fontStyle: 'italic',
  },
});
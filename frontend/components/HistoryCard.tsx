import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { profileApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

type Log = { id: number; userID: number; weight: number; measured_at: string };
type DayData = { day: string; amount: number };

const buildLast7Days = (logs: Log[]): DayData[] => {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    const dateStr = d.toISOString().slice(0, 10);
    const total = logs
      .filter((l) => l.measured_at.slice(0, 10) === dateStr)
      .reduce((acc, l) => acc + l.weight, 0);
    return { day: label, amount: Math.round(total / 10) / 100 }; // g → L
  });
};

export const HistoryCard: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [data, setData] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    profileApi.getWaterHistory(String(user.id))
      .then((logs) => setData(buildLast7Days(logs as Log[])))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const maxAmount = Math.max(...data.map((d) => d.amount), 0.1);
  const daysWithWater = data.filter((d) => d.amount > 0).length;
  const weeklyProgress = Math.round((daysWithWater / 7) * 100);

  const getBarColor = (amount: number) => {
    const ratio = amount / maxAmount;
    if (ratio === 0) return Palette.light;
    if (ratio < 0.33) return '#7acfb050';
    if (ratio < 0.66) return '#7acfb0';
    return Palette.secondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Historique rapide</Text>

      {isLoading ? (
        <ActivityIndicator color={Palette.primary} style={{ marginVertical: 24 }} />
      ) : (
        <>
          <View style={styles.chartContainer}>
            {data.map((item, index) => (
              <View key={index} style={styles.barItem}>
                <Text style={[styles.barValue, { color: colors.icon }]}>
                  {item.amount > 0 ? `${item.amount.toFixed(1)}` : ''}
                </Text>
                <View style={styles.barWrapper}>
                  <View style={[styles.bar, {
                    height: `${(item.amount / maxAmount) * 100}%`,
                    backgroundColor: getBarColor(item.amount),
                  }]} />
                </View>
                <Text style={[styles.dayLabel, { color: colors.icon }]}>{item.day}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statsContainer}>
            <View style={[styles.statBadge, { backgroundColor: Palette.accent + '20', borderColor: Palette.accent }]}>
              <Text style={[styles.statText, { color: Palette.accent }]}>
                Régularité cette semaine : <Text style={{ fontWeight: '700' }}>{weeklyProgress}%</Text>
              </Text>
            </View>
          </View>
        </>
      )}

      <Pressable style={styles.viewMore}>
        <Text style={[styles.viewMoreText, { color: Palette.secondary }]}>→ Voir l'historique complet</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: 16, padding: 16, marginHorizontal: 16, marginVertical: 12, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 150, marginVertical: 16 },
  barItem: { alignItems: 'center', flex: 1, gap: 4 },
  barValue: { fontSize: 9, marginBottom: 2 },
  barWrapper: { width: 24, height: 120, borderRadius: 4, backgroundColor: Palette.light + '50', overflow: 'hidden', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4 },
  dayLabel: { fontSize: 10, marginTop: 4 },
  statsContainer: { marginVertical: 12 },
  statBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  statText: { fontSize: 12 },
  viewMore: { marginTop: 12 },
  viewMoreText: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
});
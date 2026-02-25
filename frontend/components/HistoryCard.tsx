import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface HistoryData {
  day: string;
  amount: number;
}

interface HistoryCardProps {
  data: HistoryData[];
  weeklyProgress: number;
}

export const HistoryCard: React.FC<HistoryCardProps> = ({ data, weeklyProgress }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const maxAmount = Math.max(...data.map((d) => d.amount), 3);

  const getBarColor = (amount: number, index: number) => {
    const intensity = amount / maxAmount;
    if (intensity === 0) return Palette.light;
    if (intensity < 0.33) return '#7acfb050';
    if (intensity < 0.66) return '#7acfb0';
    return Palette.secondary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Historique rapide</Text>

      <View style={styles.chartContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barItem}>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${(item.amount / maxAmount) * 100}%`,
                    backgroundColor: getBarColor(item.amount, index),
                  },
                ]}
              />
            </View>
            <Text style={[styles.dayLabel, { color: colors.icon }]}>{item.day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.statsContainer}>
        <View
          style={[
            styles.statBadge,
            {
              backgroundColor: Palette.accent + '20',
              borderColor: Palette.accent,
            },
          ]}>
          <Text style={[styles.statText, { color: Palette.accent }]}>
            Régularité cette semaine : <Text style={{ fontWeight: '700' }}>+{weeklyProgress}%</Text>
          </Text>
        </View>
      </View>

      <Pressable style={styles.viewMore}>
        <Text style={[styles.viewMoreText, { color: Palette.secondary }]}>
          → Voir l'historique complet
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
    marginVertical: 16,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  barWrapper: {
    width: 24,
    height: 120,
    borderRadius: 4,
    backgroundColor: Palette.light + '50',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  statsContainer: {
    marginVertical: 12,
  },
  statBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statText: {
    fontSize: 12,
  },
  viewMore: {
    marginTop: 12,
  },
  viewMoreText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

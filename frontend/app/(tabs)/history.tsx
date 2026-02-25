import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  Dimensions,
} from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [menuVisible, setMenuVisible] = useState(false);

  // Mock data - 30 days
  const generateHistoryData = () => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
        amount: Math.random() * 2 + 1.5,
      });
    }
    return data;
  };

  const historyData = generateHistoryData();
  const maxAmount = Math.max(...historyData.map((d) => d.amount));

  const weeksData = [
    { week: 'Semaine 1', avg: 2.8, completed: 78 },
    { week: 'Semaine 2', avg: 2.9, completed: 85 },
    { week: 'Semaine 3', avg: 2.6, completed: 72 },
    { week: 'Semaine 4', avg: 3.1, completed: 92 },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        onMenuPress={() => setMenuVisible(true)}
        onNotificationsPress={() => console.log('Notifications')}
        onProfilePress={() => console.log('Profile')}
      />

      <SideMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onItemPress={() => {}}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Monthly Chart */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Historique du mois</Text>

          <View style={styles.chartContainer}>
            {historyData.map((item, index) => (
              <View key={index} style={styles.dayBar}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(item.amount / maxAmount) * 100}%`,
                        backgroundColor: item.amount >= 3 ? Palette.secondary : Palette.light,
                      },
                    ]}
                  />
                </View>
                {index % 7 === 0 && (
                  <Text style={[styles.dayLabel, { color: colors.icon }]}>{item.date}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Weekly Stats */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques par semaine</Text>

          {weeksData.map((week, index) => (
            <View key={index} style={[styles.weekItem, { borderBottomColor: colors.border }]}>
              <View style={styles.weekInfo}>
                <Text style={[styles.weekName, { color: colors.text }]}>{week.week}</Text>
                <Text style={[styles.weekAverage, { color: colors.icon }]}>
                  Moyenne: {week.avg.toFixed(1)}L
                </Text>
              </View>

              <View style={styles.weekProgress}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${week.completed}%`,
                      backgroundColor: week.completed >= 85 ? Palette.accent : Palette.secondary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.percentage, { color: Palette.primary }]}>
                {week.completed}%
              </Text>
            </View>
          ))}
        </View>

        {/* Monthly Stats */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques du mois</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Moyenne</Text>
              <Text style={[styles.statValue, { color: Palette.primary }]}>2.8L</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Max</Text>
              <Text style={[styles.statValue, { color: Palette.secondary }]}>3.8L</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Min</Text>
              <Text style={[styles.statValue, { color: Palette.dark }]}>1.2L</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Jours complétés</Text>
              <Text style={[styles.statValue, { color: Palette.accent }]}>24/30</Text>
            </View>
          </View>
        </View>
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
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 16,
  },
  dayBar: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  barWrapper: {
    width: '90%',
    height: 150,
    borderRadius: 3,
    backgroundColor: Palette.light + '50',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 3,
  },
  dayLabel: {
    fontSize: 8,
    marginTop: 4,
  },
  weekItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  weekInfo: {
    minWidth: 100,
  },
  weekName: {
    fontSize: 12,
    fontWeight: '600',
  },
  weekAverage: {
    fontSize: 11,
    marginTop: 4,
  },
  weekProgress: {
    flex: 1,
    height: 8,
    backgroundColor: Palette.light + '50',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: 150,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Palette.light + '20',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});

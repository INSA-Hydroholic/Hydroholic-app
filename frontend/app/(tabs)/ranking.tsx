import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  Pressable,
} from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { RankingCard } from '@/components/RankingCard';
import { Button } from '@/components/Button';

export default function RankingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'jour' | 'semaine' | 'mois'>('jour');

  // Mock data for different periods
  const rankingsData = {
    jour: [
      { id: '1', name: 'Sarah', water: 3.8 },
      { id: '2', name: 'Mehdi', water: 3.5 },
      { id: '3', name: 'Toi', water: 3.2, isCurrentUser: true },
      { id: '4', name: 'Lina', water: 2.9 },
      { id: '5', name: 'Alex', water: 2.7 },
      { id: '6', name: 'Marie', water: 2.5 },
      { id: '7', name: 'Pierre', water: 2.3 },
      { id: '8', name: 'Emma', water: 2.0 },
    ],
    semaine: [
      { id: '1', name: 'Sarah', water: 26.4 },
      { id: '2', name: 'Mehdi', water: 24.5 },
      { id: '3', name: 'Toi', water: 22.4, isCurrentUser: true },
      { id: '4', name: 'Lina', water: 20.3 },
      { id: '5', name: 'Alex', water: 18.9 },
      { id: '6', name: 'Marie', water: 17.5 },
      { id: '7', name: 'Pierre', water: 16.1 },
      { id: '8', name: 'Emma', water: 14.0 },
    ],
    mois: [
      { id: '1', name: 'Sarah', water: 84.0 },
      { id: '2', name: 'Mehdi', water: 82.5 },
      { id: '3', name: 'Toi', water: 78.2, isCurrentUser: true },
      { id: '4', name: 'Lina', water: 76.3 },
      { id: '5', name: 'Alex', water: 72.9 },
      { id: '6', name: 'Marie', water: 70.5 },
      { id: '7', name: 'Pierre', water: 68.1 },
      { id: '8', name: 'Emma', water: 64.0 },
    ],
  };

  const currentRankings = rankingsData[selectedPeriod];
  const userPosition = currentRankings.findIndex((r) => r.isCurrentUser) + 1;

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
        {/* Period Selection */}
        <View style={styles.periodSelector}>
          {(['jour', 'semaine', 'mois'] as const).map((period) => (
            <Pressable
              key={period}
              style={[
                styles.periodButton,
                {
                  backgroundColor:
                    selectedPeriod === period ? Palette.primary : colors.lightGray,
                },
              ]}
              onPress={() => setSelectedPeriod(period)}>
              <Text
                style={[
                  styles.periodButtonText,
                  { color: selectedPeriod === period ? '#fff' : colors.text },
                ]}>
                {period === 'jour' ? 'Aujourd\'hui' : period === 'semaine' ? 'Cette semaine' : 'Ce mois'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* User Position Card */}
        <View
          style={[
            styles.userPositionCard,
            {
              backgroundColor: Palette.accent + '20',
              borderColor: Palette.accent,
            },
          ]}>
          <Text style={[styles.userPositionLabel, { color: colors.icon }]}>
            Ta position
          </Text>
          <View style={styles.userPositionValue}>
            <Text style={[styles.position, { color: Palette.primary }]}>
              #{userPosition}
            </Text>
            <Text style={[styles.positionTotal, { color: colors.text }]}>
              sur {currentRankings.length}
            </Text>
          </View>
        </View>

        {/* Full Ranking */}
        <RankingCard rankings={currentRankings} />

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.categoryTitle, { color: colors.text }]}>
            Classements spécialisés
          </Text>

          <Pressable
            style={[
              styles.categoryButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}>
            <Text style={[styles.categoryButtonText, { color: Palette.secondary }]}>
              🏆 Défi hebdomadaire
            </Text>
            <Text style={[styles.categoryButtonArrow, { color: colors.icon }]}>→</Text>
          </Pressable>

          <Pressable
            style={[
              styles.categoryButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}>
            <Text style={[styles.categoryButtonText, { color: Palette.accent }]}>
              🎯 Régularité mensuelle
            </Text>
            <Text style={[styles.categoryButtonArrow, { color: colors.icon }]}>→</Text>
          </Pressable>

          <Pressable
            style={[
              styles.categoryButton,
              { backgroundColor: colors.background, borderColor: colors.border },
            ]}>
            <Text style={[styles.categoryButtonText, { color: Palette.dark }]}>
              ⭐ Parmi tes amis
            </Text>
            <Text style={[styles.categoryButtonArrow, { color: colors.icon }]}>→</Text>
          </Pressable>
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
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userPositionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    alignItems: 'center',
  },
  userPositionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  userPositionValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  position: {
    fontSize: 36,
    fontWeight: '700',
  },
  positionTotal: {
    fontSize: 14,
  },
  categoriesSection: {
    marginTop: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonArrow: {
    fontSize: 14,
  },
});

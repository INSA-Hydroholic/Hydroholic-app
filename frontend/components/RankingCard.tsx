import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface RankingItem {
  id: string;
  name: string;
  water: number;
  isCurrentUser?: boolean;
}

interface RankingCardProps {
  rankings: RankingItem[];
}

export const RankingCard: React.FC<RankingCardProps> = ({ rankings }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0:
        return '🥇';
      case 1:
        return '🥈';
      case 2:
        return '🥉';
      default:
        return `${position + 1}.`;
    }
  };

  const renderRankingItem = ({ item, index }: { item: RankingItem; index: number }) => (
    <View
      style={[
        styles.rankingItem,
        {
          backgroundColor: item.isCurrentUser ? Palette.accent + '20' : 'transparent',
          borderBottomColor: colors.border,
        },
      ]}>
      <View style={styles.rankingLeft}>
        <Text style={[styles.medal, { color: Palette.secondary }]}>{getMedalEmoji(index)}</Text>
        <Text style={[styles.rankingName, { color: colors.text, fontWeight: item.isCurrentUser ? '700' : '500' }]}>
          {item.isCurrentUser ? 'Toi' : item.name}
        </Text>
      </View>
      <Text style={[styles.rankingWater, { color: Palette.primary, fontWeight: '600' }]}>
        {item.water.toFixed(1)}L
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Classement du jour</Text>

      <FlatList
        data={rankings}
        renderItem={renderRankingItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      <Text style={[styles.viewAll, { color: Palette.secondary }]}>→ Voir tous les classements</Text>
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
    marginBottom: 12,
  },
  rankingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  rankingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medal: {
    fontSize: 20,
    width: 20,
    textAlign: 'center',
  },
  rankingName: {
    fontSize: 14,
  },
  rankingWater: {
    fontSize: 14,
  },
  viewAll: {
    fontSize: 12,
    marginTop: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

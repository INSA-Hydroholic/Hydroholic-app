import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { rankingApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

type RankingEntry = {
  userID: number;
  username: string;
  _sum: { weight: number | null };
};

export const RankingCard: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { user } = useAuth();
  const [data, setData] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    rankingApi.getAll()
      .then((res) => setData(Array.isArray(res) ? res : []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const getMedalEmoji = (i: number) => ['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`;

  const renderItem = ({ item, index }: { item: RankingEntry; index: number }) => {
    const isMe = item.userID === user?.id;
    const liters = ((item._sum.weight ?? 0) / 1000).toFixed(1);

    return (
      <View style={[
        styles.rankingItem,
        { borderBottomColor: colors.border, backgroundColor: isMe ? Palette.accent + '20' : 'transparent' },
      ]}>
        <View style={styles.rankingLeft}>
          <Text style={[styles.medal, { color: Palette.secondary }]}>{getMedalEmoji(index)}</Text>
          <Text style={[styles.rankingName, { color: colors.text, fontWeight: isMe ? '700' : '500' }]}>
            {isMe ? `${item.username} (toi)` : item.username}
          </Text>
        </View>
        <Text style={[styles.rankingWater, { color: Palette.primary }]}>{liters}L</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Classement général</Text>
      {isLoading
        ? <ActivityIndicator color={Palette.primary} style={{ marginVertical: 16 }} />
        : data.length === 0
          ? <Text style={[styles.empty, { color: colors.icon }]}>Aucune donnée disponible.</Text>
          : <FlatList data={data} renderItem={renderItem} keyExtractor={(item) => String(item.userID)} scrollEnabled={false} />
      }
      <Text style={[styles.viewAll, { color: Palette.secondary }]}>→ Voir tous les classements</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: 16, padding: 16, marginHorizontal: 16, marginVertical: 12, borderWidth: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  rankingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderRadius: 8 },
  rankingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  medal: { fontSize: 20, width: 24, textAlign: 'center' },
  rankingName: { fontSize: 14 },
  rankingWater: { fontSize: 14, fontWeight: '600' },
  viewAll: { fontSize: 12, marginTop: 12, fontWeight: '500', textAlign: 'center' },
  empty: { fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 },
});
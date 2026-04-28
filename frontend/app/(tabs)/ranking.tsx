import React, { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, SafeAreaView,
  Text, Pressable, ActivityIndicator,
} from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { rankingApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

type RankingEntry = {
  userID: number;
  username: string;
  _sum: { weight: number | null };
};

const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [menuVisible, setMenuVisible] = useState(false);
  const { user } = useAuth();

  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await rankingApi.getAll();
      setRanking(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Impossible de charger le classement.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const userId = user?.id;
  const userPosition = ranking.findIndex((r) => r.userID === userId) + 1;
  const maxWeight = Math.max(...ranking.map((r) => r._sum.weight ?? 0), 1);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        onMenuPress={() => setMenuVisible(true)}
        onNotificationsPress={() => {}}
        onProfilePress={() => {}}
      />
      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} onItemPress={() => {}} />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* User position card */}
        {userPosition > 0 && (
          <View style={[styles.positionCard, { borderColor: Palette.accent, backgroundColor: Palette.accent + '15' }]}>
            <Text style={[styles.positionLabel, { color: colors.icon }]}>Ta position</Text>
            <Text style={[styles.positionValue, { color: Palette.primary }]}>#{userPosition}</Text>
            <Text style={[styles.positionSub, { color: colors.icon }]}>sur {ranking.length} joueurs</Text>
          </View>
        )}

        {/* Ranking list */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Classement général</Text>
          <Text style={[styles.sectionSub, { color: colors.icon }]}>Basé sur la consommation totale d'eau</Text>

          {isLoading ? (
            <ActivityIndicator color={Palette.primary} style={{ marginVertical: 32 }} />
          ) : error ? (
            <Text style={[styles.errorText, { color: Palette.dark }]}>{error}</Text>
          ) : ranking.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.icon }]}>Aucune donnée disponible.</Text>
          ) : (
            ranking.map((entry, i) => {
              const isMe = entry.userID === userId;
              const totalL = ((entry._sum.weight ?? 0) / 1000).toFixed(2);
              const barWidth = ((entry._sum.weight ?? 0) / maxWeight) * 100;

              return (
                <View
                  key={entry.userID}
                  style={[
                    styles.rankRow,
                    isMe && { backgroundColor: Palette.secondary + '15', borderRadius: 10, paddingHorizontal: 8 },
                  ]}>
                  {/* Position */}
                  <Text style={styles.medal}>
                    {i < 3 ? MEDALS[i] : `#${i + 1}`}
                  </Text>

                  {/* Name + bar */}
                  <View style={styles.rankInfo}>
                    <View style={styles.rankNameRow}>
                      <Text style={[styles.rankName, { color: colors.text }, isMe && { color: Palette.secondary, fontWeight: '700' }]}>
                        {entry.username}{isMe ? ' (toi)' : ''}
                      </Text>
                      <Text style={[styles.rankValue, { color: colors.icon }]}>{totalL} L</Text>
                    </View>
                    <View style={[styles.rankBarTrack, { backgroundColor: colors.border }]}>
                      <View style={[styles.rankBar, {
                        width: `${barWidth}%`,
                        backgroundColor: isMe ? Palette.secondary : i === 0 ? '#FFD700' : Palette.primary + '99',
                      }]} />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Refresh button */}
        <Pressable onPress={() => void load()} style={styles.refreshBtn}>
          <Text style={[styles.refreshText, { color: Palette.secondary }]}>↻ Actualiser</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  positionCard: {
    borderRadius: 16, borderWidth: 2,
    padding: 20, alignItems: 'center', marginBottom: 12,
  },
  positionLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  positionValue: { fontSize: 48, fontWeight: '800', lineHeight: 56 },
  positionSub: { fontSize: 12, marginTop: 4 },
  card: { borderRadius: 16, padding: 20, marginVertical: 8, borderWidth: 1 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sectionSub: { fontSize: 11, marginBottom: 16 },
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  medal: { fontSize: 20, width: 32, textAlign: 'center' },
  rankInfo: { flex: 1 },
  rankNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rankName: { fontSize: 13, fontWeight: '500' },
  rankValue: { fontSize: 12 },
  rankBarTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  rankBar: { height: '100%', borderRadius: 3 },
  errorText: { fontSize: 13, fontWeight: '600', textAlign: 'center', paddingVertical: 16 },
  emptyText: { fontSize: 13, fontStyle: 'italic', textAlign: 'center', paddingVertical: 16 },
  refreshBtn: { alignItems: 'center', paddingVertical: 16 },
  refreshText: { fontSize: 13, fontWeight: '600' },
});
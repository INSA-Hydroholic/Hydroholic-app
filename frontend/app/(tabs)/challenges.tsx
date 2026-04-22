import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { Button } from '@/components/Button';
import { challengesApi } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

type ApiChallenge = {
  id: string;
  name: string;
  type: string;
  duration: string;
  objective: number;
  creatorId?: string;
  participants?: Array<string | number>;
  progressByUser?: Record<string, number>;
};

const toChallengeArray = (payload: any): ApiChallenge[] => {
  if (Array.isArray(payload)) return payload as ApiChallenge[];
  if (Array.isArray(payload?.challenges)) return payload.challenges as ApiChallenge[];
  if (Array.isArray(payload?.data)) return payload.data as ApiChallenge[];
  return [];
};

export default function ChallengesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { user } = useAuth();

  const [menuVisible, setMenuVisible] = useState(false);
  const [allChallenges, setAllChallenges] = useState<ApiChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const userId = String(user?.id ?? '');

  const loadChallenges = useCallback(async (isPullToRefresh = false) => {
    if (isPullToRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setErrorMsg('');
    try {
      const response = await challengesApi.getAll();
      setAllChallenges(toChallengeArray(response));
    } catch (error: any) {
      setErrorMsg(error?.message || 'Impossible de charger les defis.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadChallenges();
  }, [loadChallenges]);

  const isUserInChallenge = useCallback((challenge: ApiChallenge) => {
    if (!userId) return false;
    const participants = challenge.participants ?? [];
    return participants.map(String).includes(userId);
  }, [userId]);

  const ongoingChallenges = useMemo(() => {
    return allChallenges.filter(isUserInChallenge);
  }, [allChallenges, isUserInChallenge]);

  const availableChallenges = useMemo(() => {
    return allChallenges.filter((challenge) => !isUserInChallenge(challenge));
  }, [allChallenges, isUserInChallenge]);

  const getUserProgressPercent = useCallback((challenge: ApiChallenge) => {
    if (!userId) return 0;

    const objective = Number(challenge.objective || 0);
    const progress = Number(challenge.progressByUser?.[userId] ?? 0);

    if (!Number.isFinite(objective) || objective <= 0) return 0;
    if (!Number.isFinite(progress) || progress <= 0) return 0;

    return Math.max(0, Math.min(100, Math.round((progress / objective) * 100)));
  }, [userId]);

  const getParticipantsCount = useCallback((challenge: ApiChallenge) => {
    return Array.isArray(challenge.participants) ? challenge.participants.length : 0;
  }, []);

  const handleJoinChallenge = useCallback(async (challengeId: string) => {
    if (!userId) {
      Alert.alert('Connexion requise', 'Tu dois etre connecte pour rejoindre un defi.');
      return;
    }

    try {
      setJoiningId(challengeId);
      await challengesApi.join(challengeId, userId);
      await loadChallenges(true);
      Alert.alert('Succes', 'Tu as rejoint le defi.');
    } catch (error: any) {
      Alert.alert('Erreur', error?.message || 'Impossible de rejoindre le defi.');
    } finally {
      setJoiningId(null);
    }
  }, [loadChallenges, userId]);

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
        <Button
          title="+ Créer un défi"
          onPress={() => router.push('/create-challenge')}
          size="large"
          style={styles.createButton}
          variant="primary"
        />

        <Button
          title={isRefreshing ? 'Actualisation...' : 'Rafraichir'}
          onPress={() => void loadChallenges(true)}
          size="small"
          variant="outline"
        />

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Palette.primary} />
            <Text style={[styles.helperText, { color: colors.icon }]}>Chargement des defis...</Text>
          </View>
        ) : (
          <>
            {errorMsg ? (
              <View style={styles.centerBox}>
                <Text style={[styles.errorText, { color: Palette.dark }]}>{errorMsg}</Text>
              </View>
            ) : null}

            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Defis en cours</Text>

              {ongoingChallenges.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.icon }]}>Aucun defi en cours pour le moment.</Text>
              ) : (
                ongoingChallenges.map((challenge) => {
                  const progress = getUserProgressPercent(challenge);

                  return (
                    <View
                      key={challenge.id}
                      style={[
                        styles.detailedCard,
                        { backgroundColor: colors.background, borderColor: colors.border },
                      ]}>
                      <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{challenge.name}</Text>
                        <Text style={[styles.cardBadge, { color: Palette.secondary }]}>EN COURS</Text>
                      </View>

                      <View style={styles.cardInfo}>
                        <View style={styles.infoItem}>
                          <Text style={[styles.infoLabel, { color: colors.icon }]}>Type</Text>
                          <Text style={[styles.infoValue, { color: colors.text }]}>{challenge.type}</Text>
                        </View>

                        <View style={styles.infoItem}>
                          <Text style={[styles.infoLabel, { color: colors.icon }]}>Duree</Text>
                          <Text style={[styles.infoValue, { color: colors.text }]}>
                            {challenge.duration}
                          </Text>
                        </View>

                        <View style={styles.infoItem}>
                          <Text style={[styles.infoLabel, { color: colors.icon }]}>Objectif</Text>
                          <Text style={[styles.infoValue, { color: colors.text }]}>
                            {challenge.objective}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.progressContainer}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${progress}%`,
                              backgroundColor: Palette.secondary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: colors.icon }]}>
                        {progress}% complete
                      </Text>
                    </View>
                  );
                })
              )}
            </View>

            <View style={{ marginTop: 24 }}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Defis disponibles</Text>

              {availableChallenges.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.icon }]}>Aucun defi disponible pour le moment.</Text>
              ) : (
                availableChallenges.map((challenge) => (
                  <View
                    key={challenge.id}
                    style={[
                      styles.detailedCard,
                      { backgroundColor: colors.background, borderColor: colors.border },
                    ]}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{challenge.name}</Text>
                    </View>

                    <View style={styles.cardInfo}>
                      <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: colors.icon }]}>Type</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>{challenge.type}</Text>
                      </View>

                      <View style={styles.infoItem}>
                        <Text style={[styles.infoLabel, { color: colors.icon }]}>Participants</Text>
                        <Text style={[styles.infoValue, { color: colors.text }]}>
                          {getParticipantsCount(challenge)} personnes
                        </Text>
                      </View>
                    </View>

                    <View style={styles.actionsContainer}>
                      <Button
                        title={joiningId === challenge.id ? 'Rejoindre...' : 'Rejoindre'}
                        onPress={() => void handleJoinChallenge(challenge.id)}
                        size="small"
                        variant="primary"
                        style={{ flex: 1 }}
                        disabled={joiningId === challenge.id}
                      />
                      <Button
                        title="Refuser"
                        onPress={() => {}}
                        size="small"
                        variant="outline"
                        style={{ flex: 1, marginLeft: 8 }}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
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
  createButton: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 12,
  },
  detailedCard: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  cardBadge: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardInfo: {
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
  },
  progressContainer: {
    height: 6,
    backgroundColor: Palette.light + '50',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  helperText: {
    marginTop: 8,
    fontSize: 13,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 10,
  },
});

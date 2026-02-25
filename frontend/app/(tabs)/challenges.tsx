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
import { ChallengeCard } from '@/components/ChallengeCard';
import { Button } from '@/components/Button';

export default function ChallengesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const ongoingChallenges = [
    {
      id: '1',
      name: 'Défi hydra pour les nuls',
      type: 'Groupe',
      duration: '3 jours',
      objective: '21L cette semaine',
      progress: 68,
    },
    {
      id: '2',
      name: 'Semaine de l\'hydratation',
      type: 'Solo',
      duration: '7 jours',
      objective: '22.4L cette semaine',
      progress: 45,
    },
  ];

  const availableChallenges = [
    {
      id: '3',
      name: 'Weekend hydraté',
      type: 'Entre amis',
      participants: 5,
      progress: 0,
    },
    {
      id: '4',
      name: 'Défi des 3 litres',
      type: 'Entre amis',
      participants: 3,
      progress: 0,
    },
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
        {/* Create Challenge Button */}
        <Button
          title="+ Créer un défi"
          onPress={() => setShowCreateModal(true)}
          size="large"
          style={styles.createButton}
          variant="primary"
        />

        {/* Ongoing Challenges */}
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Défis en cours</Text>

          {ongoingChallenges.map((challenge) => (
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
                  <Text style={[styles.infoLabel, { color: colors.icon }]}>Durée</Text>
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
                      width: `${challenge.progress}%`,
                      backgroundColor: Palette.secondary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.icon }]}>
                {challenge.progress}% complété
              </Text>

              <Pressable style={[styles.actionButton, { borderColor: Palette.secondary }]}>
                <Text style={[styles.actionButtonText, { color: Palette.secondary }]}>
                  Voir le classement
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Available Challenges */}
        <View style={{ marginTop: 24 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Défis disponibles
          </Text>

          {availableChallenges.map((challenge) => (
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
                    {challenge.participants} personnes
                  </Text>
                </View>
              </View>

              <View style={styles.actionsContainer}>
                <Button
                  title="Rejoindre"
                  onPress={() => console.log('Join')}
                  size="small"
                  variant="primary"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Refuser"
                  onPress={() => console.log('Refuse')}
                  size="small"
                  variant="outline"
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </View>
          ))}
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
  createButton: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
});

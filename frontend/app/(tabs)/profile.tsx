import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Text,
  Pressable,
  Image,
} from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [menuVisible, setMenuVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const { logout } = useAuth();

  // Mock user data
  const userProfile = {
    name: 'Jean Dupont',
    username: '@jeandupont',
    email: 'jean@example.com',
    age: 28,
    gender: 'Homme',
    region: 'Rhône-Alpes',
    weight: '72 kg',
    sport: '3 séances/semaine (intensive)',
    bio: 'Passionné de fitness et de bonne santé 💪',
    dailyGoal: '2.8L',
    friends: 12,
    challenges: 3,
    joinDate: 'Janvier 2024',
  };

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
        {/* Profile Header */}
        <View
          style={[
            styles.profileHeader,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}>
          <View
            style={[
              styles.profilePhoto,
              {
                backgroundColor: Palette.secondary,
                borderColor: Palette.primary,
              },
            ]}>
            <Text style={styles.photoPlaceholder}>👤</Text>
          </View>

          <Text style={[styles.profileName, { color: colors.text }]}>{userProfile.name}</Text>
          <Text style={[styles.profileUsername, { color: Palette.secondary }]}>
            {userProfile.username}
          </Text>

          <Text style={[styles.profileBio, { color: colors.icon }]}>{userProfile.bio}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Palette.primary }]}>
                {userProfile.friends}
              </Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Amis</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Palette.secondary }]}>
                {userProfile.challenges}
              </Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Défis</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Palette.accent }]}>
                {userProfile.dailyGoal}
              </Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Objectif</Text>
            </View>
          </View>

          <Button
            title={editMode ? 'Annuler' : 'Modifier le profil'}
            onPress={() => setEditMode(!editMode)}
            variant={editMode ? 'outline' : 'secondary'}
            size="medium"
            style={styles.editButton}
          />
        </View>

        {/* Profile Information */}
        <View
          style={[
            styles.infoSection,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Informations personnelles
          </Text>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.icon }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userProfile.email}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.icon }]}>Âge</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userProfile.age} ans</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.icon }]}>Sexe</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userProfile.gender}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.icon }]}>Région</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userProfile.region}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.icon }]}>Poids</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userProfile.weight}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.icon }]}>Activité sportive</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userProfile.sport}</Text>
          </View>
        </View>

        {/* Friends Section */}
        <View
          style={[
            styles.infoSection,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Mes amis</Text>
            <Pressable>
              <Text style={[styles.addFriend, { color: Palette.secondary }]}>+ Ajouter</Text>
            </Pressable>
          </View>

          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.friendItem}>
              <View
                style={[
                  styles.friendPhoto,
                  {
                    backgroundColor:
                      i % 2 === 0 ? Palette.secondary : Palette.accent,
                  },
                ]}>
                <Text>👤</Text>
              </View>
              <View style={styles.friendInfo}>
                <Text style={[styles.friendName, { color: colors.text }]}>
                  Ami {i}
                </Text>
                <Text style={[styles.friendUsername, { color: colors.icon }]}>
                  @ami{i}
                </Text>
              </View>
              <Pressable>
                <Text style={[styles.removeButton, { color: Palette.dark }]}>✕</Text>
              </Pressable>
            </View>
          ))}

          <Pressable style={[styles.viewMore, { borderTopColor: colors.border }]}>
            <Text style={[styles.viewMoreText, { color: Palette.secondary }]}>
              Voir tous mes amis →
            </Text>
          </Pressable>
        </View>

        {/* Preferences */}
        <View
          style={[
            styles.infoSection,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Préférences</Text>

          <Pressable
            style={[
              styles.preferenceItem,
              { borderBottomColor: colors.border },
            ]}>
            <Text style={[styles.preferenceLabel, { color: colors.text }]}>
              Notifications
            </Text>
            <Text style={[styles.arrow, { color: colors.icon }]}>→</Text>
          </Pressable>

          <Pressable
            style={[
              styles.preferenceItem,
              { borderBottomColor: colors.border },
            ]}>
            <Text style={[styles.preferenceLabel, { color: colors.text }]}>
              Thème
            </Text>
            <Text style={[styles.arrow, { color: colors.icon }]}>→</Text>
          </Pressable>

          <Pressable style={styles.preferenceItem}>
            <Text style={[styles.preferenceLabel, { color: colors.text }]}>
              À propos
            </Text>
            <Text style={[styles.arrow, { color: colors.icon }]}>→</Text>
          </Pressable>
        </View>

        {/* Logout */}
        <Button
          title="Se déconnecter"
          onPress={() => {
            logout();
          }}
          variant="danger"
          size="large"
          style={styles.logoutButton}
        />
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
  profileHeader: {
    borderRadius: 12,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    fontSize: 40,
  },
  photoPlaceholder: {
    fontSize: 40,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  editButton: {
    marginTop: 16,
    minWidth: 150,
  },
  infoSection: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addFriend: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  friendPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 12,
    fontWeight: '600',
  },
  friendUsername: {
    fontSize: 11,
    marginTop: 2,
  },
  removeButton: {
    fontSize: 16,
  },
  viewMore: {
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 8,
  },
  viewMoreText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  preferenceLabel: {
    fontSize: 14,
  },
  arrow: {
    fontSize: 14,
  },
  logoutButton: {
    marginTop: 12,
    marginBottom: 20,
  },
});

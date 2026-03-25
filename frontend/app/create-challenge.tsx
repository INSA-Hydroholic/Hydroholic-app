import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';

export default function CreateChallengeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'solo', // 'solo', 'amis', 'cohesion'
    duration: '1', // '1', '7', 'custom'
    objectiveType: 'daily', // 'daily' or 'total'
    objective: '',
    selectedFriends: [] as string[],
  });

  const friends = ['Ami 1', 'Ami 2', 'Ami 3', 'Ami 4', 'Ami 5'];
  const challengeTypes = [
    { id: 'solo', label: 'Solo' },
    { id: 'amis', label: 'Entre amis' },
    { id: 'cohesion', label: 'Défi de cohésion' },
  ];
  const durations = [
    { id: '1', label: '1 jour' },
    { id: '7', label: '7 jours' },
    { id: 'custom', label: 'Personnalisé' },
  ];

  const handleCreateChallenge = () => {
    // TODO: Faire un appel API pour créer le défi
    router.back();
  };

  const toggleFriend = (friend: string) => {
    if (formData.selectedFriends.includes(friend)) {
      setFormData({
        ...formData,
        selectedFriends: formData.selectedFriends.filter((f) => f !== friend),
      });
    } else {
      setFormData({
        ...formData,
        selectedFriends: [...formData.selectedFriends, friend],
      });
    }
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
        <Text style={[styles.title, { color: colors.text }]}>Créer un défi</Text>

        {/* Challenge Name */}
        <InputField
          label="Nom du défi"
          placeholder="Ex: Semaine de l'hydratation"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
        />

        {/* Challenge Type */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Type de défi</Text>
          <View style={styles.optionsContainer}>
            {challengeTypes.map((type) => (
              <Pressable
                key={type.id}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      formData.type === type.id
                        ? Palette.secondary
                        : colors.lightGray,
                    borderColor:
                      formData.type === type.id ? Palette.primary : colors.border,
                  },
                ]}
                onPress={() => setFormData({ ...formData, type: type.id })}>
                <Text
                  style={[
                    styles.optionButtonText,
                    {
                      color: formData.type === type.id ? '#fff' : colors.text,
                    },
                  ]}>
                  {type.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Durée</Text>
          <View style={styles.optionsContainer}>
            {durations.map((duration) => (
              <Pressable
                key={duration.id}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      formData.duration === duration.id
                        ? Palette.accent
                        : colors.lightGray,
                    borderColor:
                      formData.duration === duration.id
                        ? Palette.primary
                        : colors.border,
                  },
                ]}
                onPress={() => setFormData({ ...formData, duration: duration.id })}>
                <Text
                  style={[
                    styles.optionButtonText,
                    {
                      color: formData.duration === duration.id ? '#fff' : colors.text,
                    },
                  ]}>
                  {duration.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Objective Type */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Objectif</Text>
          <View style={styles.objectiveTypeContainer}>
            <Pressable
              style={[
                styles.objectiveTypeButton,
                {
                  backgroundColor:
                    formData.objectiveType === 'daily'
                      ? Palette.primary
                      : colors.lightGray,
                },
              ]}
              onPress={() => setFormData({ ...formData, objectiveType: 'daily' })}>
              <Text
                style={[
                  styles.objectiveTypeText,
                  {
                    color: formData.objectiveType === 'daily' ? '#fff' : colors.text,
                  },
                ]}>
                Par jour
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.objectiveTypeButton,
                {
                  backgroundColor:
                    formData.objectiveType === 'total'
                      ? Palette.primary
                      : colors.lightGray,
                },
              ]}
              onPress={() => setFormData({ ...formData, objectiveType: 'total' })}>
              <Text
                style={[
                  styles.objectiveTypeText,
                  {
                    color: formData.objectiveType === 'total' ? '#fff' : colors.text,
                  },
                ]}>
                Total
              </Text>
            </Pressable>
          </View>

          <InputField
            label="Quantité en litres"
            placeholder="Ex: 2.8"
            value={formData.objective}
            onChangeText={(text) => setFormData({ ...formData, objective: text })}
            type="number"
          />
        </View>

        {/* Friends Selection (if not solo) */}
        {formData.type !== 'solo' && (
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Sélectionne tes amis</Text>
            <View style={styles.friendsGrid}>
              {friends.map((friend) => (
                <Pressable
                  key={friend}
                  style={[
                    styles.friendOption,
                    {
                      backgroundColor: formData.selectedFriends.includes(friend)
                        ? Palette.accent
                        : colors.lightGray,
                      borderColor: formData.selectedFriends.includes(friend)
                        ? Palette.primary
                        : colors.border,
                    },
                  ]}
                  onPress={() => toggleFriend(friend)}>
                  <Text
                    style={[
                      styles.friendOptionText,
                      {
                        color: formData.selectedFriends.includes(friend)
                          ? '#fff'
                          : colors.text,
                      },
                    ]}>
                    {friend}
                  </Text>
                  {formData.selectedFriends.includes(friend) && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Create Button */}
        <Button
          title="Créer le défi"
          onPress={handleCreateChallenge}
          size="large"
          style={styles.createButton}
        />

        {/* Cancel Button */}
        <Button
          title="Annuler"
          onPress={() => router.back()}
          variant="outline"
          size="large"
          style={styles.cancelButton}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  objectiveTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  objectiveTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  objectiveTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  friendsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  friendOption: {
    width: '32%',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendOptionText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  checkMark: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  createButton: {
    marginTop: 24,
  },
  cancelButton: {
    marginTop: 12,
  },
});

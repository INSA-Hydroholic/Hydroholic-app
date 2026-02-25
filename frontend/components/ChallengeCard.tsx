import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ChallengeCardProps {
  name: string;
  progress: number;
  isOngoing: boolean;
  onPress?: () => void;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({
  name,
  progress,
  isOngoing,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
      onPress={onPress}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{name}</Text>
        {isOngoing && (
          <View style={[styles.badge, { backgroundColor: Palette.secondary }]}>
            <Text style={styles.badgeText}>EN COURS</Text>
          </View>
        )}
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
      <Text style={[styles.progressText, { color: colors.icon }]}>{progress}% complété</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  progressContainer: {
    height: 6,
    backgroundColor: Palette.light,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
  },
});

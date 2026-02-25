import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ObjectiveCardProps {
  objective: number;
  region: string;
}

export const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, region }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [temperature, setTemperature] = useState<number | null>(null);

  useEffect(() => {
    // TODO: Faire un appel API pour récupérer la température
    // Pour maintenant, on simule une température
    setTemperature(Math.round(Math.random() * 30 + 10));
  }, [region]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Objectif du jour</Text>

      <View style={styles.content}>
        <View style={styles.item}>
          <Text style={[styles.label, { color: colors.icon }]}>Mon objectif</Text>
          <Text style={[styles.value, { color: Palette.primary }]}>{objective.toFixed(1)}L</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Text style={[styles.label, { color: colors.icon }]}>Région</Text>
          <Text style={[styles.value, { color: colors.text }]}>{region}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.item}>
          <Text style={[styles.label, { color: colors.icon }]}>Température</Text>
          <Text style={[styles.value, { color: Palette.dark }]}>{temperature}°C</Text>
        </View>
      </View>

      <Text style={[styles.link, { color: Palette.secondary }]}>→ Modifier mon objectif</Text>
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
    marginBottom: 16,
  },
  content: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Palette.accent,
    opacity: 0.2,
  },
  link: {
    fontSize: 12,
    marginTop: 12,
    fontWeight: '500',
    textAlign: 'right',
  },
});

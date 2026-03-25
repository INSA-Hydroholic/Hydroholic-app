import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface HydrationCardProps {
  current: number;
  goal: number;
  onAddWater: (amount: number) => void;
}

export const HydrationCard: React.FC<HydrationCardProps> = ({ current, goal, onAddWater }) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const percentage = Math.round((current / goal) * 100);
  const remaining = Math.max(0, goal - current);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.text }]}>Ton hydratation aujourd'hui</Text>

      <View style={styles.progressContainer}>
        {/* Logo de la gota - Lado izquierdo */}
        <Image
          source={require('../assets/images/hydroholic/logo.png')}
          style={styles.waterDropLogo}
        />
        
        {/* Círculo de progresión - Lado derecho */}
        <View
          style={[
            styles.progressCircle,
            {
              borderColor: Palette.secondary,
              backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f9f9f9',
            },
          ]}>
          <Text style={[styles.percentage, { color: Palette.primary }]}>{percentage}%</Text>
          <Text style={[styles.hydrationText, { color: colors.text }]}>
            {current.toFixed(1)}L / {goal.toFixed(1)}L
          </Text>
        </View>
      </View>

      <Text style={[styles.motivationalText, { color: Palette.secondary }]}>
        {remaining > 0 ? `Encore ${remaining.toFixed(1)}L pour atteindre ton objectif` : '🎉 Bravo, objectif atteint!'}
      </Text>

      {/* Boutons rapides */}
      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.button, { backgroundColor: Palette.accent }]}
          onPress={() => onAddWater(0.25)}>
          <Text style={[styles.buttonText, { color: colors.background }]}>+250ml</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: Palette.secondary }]}
          onPress={() => onAddWater(0.5)}>
          <Text style={[styles.buttonText, { color: colors.background }]}>+500ml</Text>
        </Pressable>
        <Pressable
          style={[styles.button, { backgroundColor: Palette.dark }]}
          onPress={() => onAddWater(1)}>
          <Text style={[styles.buttonText, { color: colors.background }]}>+1L</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
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
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 10,
    gap: 10,
  },
  waterDropLogo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  progressCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  hydrationText: {
    fontSize: 14,
    marginTop: 8,
  },
  motivationalText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

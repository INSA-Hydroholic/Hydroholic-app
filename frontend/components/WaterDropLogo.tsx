import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette } from '@/constants/theme';

interface WaterDropLogoProps {
  size?: number;
}

export const WaterDropLogo: React.FC<WaterDropLogoProps> = ({ size = 80 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Gota exterior (azul turquesa) */}
      <View
        style={[
          styles.dropOuter,
          {
            width: size * 0.7,
            height: size * 0.85,
            borderRadius: size * 0.4,
          },
        ]}
      />

      {/* Gota interior (azul más claro para efecto 3D) */}
      <View
        style={[
          styles.dropInner,
          {
            width: size * 0.55,
            height: size * 0.65,
            borderRadius: size * 0.3,
            top: size * 0.08,
            left: size * 0.075,
          },
        ]}
      />

      {/* Ojo izquierdo */}
      <View
        style={[
          styles.eyeContainer,
          {
            left: size * 0.2,
            top: size * 0.3,
          },
        ]}
      >
        <View style={[styles.eye, { width: size * 0.12, height: size * 0.12 }]} />
      </View>

      {/* Ojo derecho */}
      <View
        style={[
          styles.eyeContainer,
          {
            left: size * 0.52,
            top: size * 0.3,
          },
        ]}
      >
        <View style={[styles.eye, { width: size * 0.12, height: size * 0.12 }]} />
      </View>

      {/* Sonrisa (representada con línea de arc) */}
      <View
        style={[
          styles.smile,
          {
            bottom: size * 0.18,
            borderTopWidth: 2,
            borderTopColor: '#1c3a52',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dropOuter: {
    backgroundColor: Palette.secondary, // #00bdc8 - Cyan turquesa
    position: 'absolute',
  },
  dropInner: {
    backgroundColor: '#26d0d8',
    position: 'absolute',
    opacity: 0.6,
  },
  eyeContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eye: {
    backgroundColor: '#1c3a52',
    borderRadius: 50,
  },
  smile: {
    position: 'absolute',
    width: '35%',
    borderRadius: 100,
  },
});

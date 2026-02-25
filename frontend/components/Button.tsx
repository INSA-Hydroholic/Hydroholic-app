import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Palette } from '@/constants/theme';

interface ButtonProps {
  onPress?: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary':
        return Palette.secondary;
      case 'outline':
        return 'transparent';
      case 'danger':
        return Palette.dark;
      default:
        return Palette.primary;
    }
  };

  const getTextColor = () => {
    return variant === 'outline' ? Palette.primary : '#fff';
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 24 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 20 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 12;
      case 'large':
        return 16;
      default:
        return 14;
    }
  };

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: variant === 'outline' ? Palette.primary : 'transparent',
          ...getPadding(),
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text
        style={{
          color: getTextColor(),
          fontSize: getFontSize(),
          fontWeight: '600',
          textAlign: 'center',
        }}>
        {title}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

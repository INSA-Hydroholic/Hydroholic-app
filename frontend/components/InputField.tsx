import React from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  type?: 'text' | 'password' | 'email' | 'phone' | 'number';
  optional?: boolean;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  type = 'text',
  optional = false,
  error,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {optional && <Text style={[styles.optional, { color: colors.icon }]}>(Optionnel)</Text>}
      </View>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.lightGray,
            color: colors.text,
            borderColor: error ? Palette.dark : colors.border,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.icon}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={type === 'password'}
        keyboardType={getKeyboardType()}
      />
      {error && <Text style={[styles.error, { color: Palette.dark }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});

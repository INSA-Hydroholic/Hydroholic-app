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
import { InputField } from '@/components/InputField';
import { Button } from '@/components/Button';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleLogin = () => {
    const newErrors: { [key: string]: string } = {};

    if (!username) newErrors.username = 'Le nom d\'utilisateur est requis';
    if (!password) newErrors.password = 'Le mot de passe est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Faire un appel API réel
    router.push('/(tabs)' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: Palette.primary }]}>💧 Hydroholic</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Hydrate-toi, reste en bonne santé
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Connexion</Text>

          <InputField
            label="Nom d'utilisateur ou email"
            placeholder="Entrez votre nom d'utilisateur ou email"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setErrors({ ...errors, username: '' });
            }}
            error={errors.username}
          />

          <InputField
            label="Mot de passe"
            placeholder="Entrez votre mot de passe"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors({ ...errors, password: '' });
            }}
            type="password"
            error={errors.password}
          />

          <Pressable>
            <Text style={[styles.forgotPassword, { color: Palette.secondary }]}>
              Mot de passe oublié?
            </Text>
          </Pressable>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            size="large"
            style={styles.button}
          />
        </View>

        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, { color: colors.text }]}>
            Pas encore de compte?{' '}
          </Text>
          <Pressable onPress={() => router.push('/register' as any)}>
            <Text style={[styles.signupLink, { color: Palette.secondary }]}>
              S'inscrire
            </Text>
          </Pressable>
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
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    fontSize: 40,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  formContainer: {
    marginVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  forgotPassword: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '500',
  },
  button: {
    marginTop: 24,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

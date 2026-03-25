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
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const { register } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    username: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleRegister = async() => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
    if (!formData.username) newErrors.username = 'Le nom d\'utilisateur est requis';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await register(formData);

    // TODO: Faire un appel API réel
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.logo, { color: Palette.primary }]}>💧 Hydroholic</Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Créer un nouveau compte
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Inscription</Text>

          <View style={styles.nameRow}>
            <View style={styles.halfInput}>
              <InputField
                label="Prénom"
                placeholder="Jean"
                value={formData.prenom}
                onChangeText={(text) => setFormData({ ...formData, prenom: text })}
                error={errors.prenom}
              />
            </View>
            <View style={styles.halfInput}>
              <InputField
                label="Nom"
                placeholder="Dupont"
                value={formData.nom}
                onChangeText={(text) => setFormData({ ...formData, nom: text })}
                error={errors.nom}
              />
            </View>
          </View>

          <InputField
            label="Nom d'utilisateur"
            placeholder="jeandupont"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            error={errors.username}
          />

          <InputField
            label="Email"
            placeholder="jean@example.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            type="email"
            error={errors.email}
          />

          <InputField
            label="Numéro de téléphone"
            placeholder="+33612345678"
            value={formData.telephone}
            onChangeText={(text) => setFormData({ ...formData, telephone: text })}
            type="phone"
            optional
          />

          <InputField
            label="Mot de passe"
            placeholder="Entrez un mot de passe sécurisé"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            type="password"
            error={errors.password}
          />

          <InputField
            label="Confirmer le mot de passe"
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            type="password"
            error={errors.confirmPassword}
          />

          <Button
            title="S'inscrire"
            onPress={handleRegister}
            size="large"
            style={styles.button}
          />
        </View>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.text }]}>
            Déjà inscrit?{' '}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={[styles.loginLink, { color: Palette.secondary }]}>
              Se connecter
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
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
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
  nameRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    marginTop: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

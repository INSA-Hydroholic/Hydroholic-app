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
import { Picker } from '@react-native-picker/picker';
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
    //Champs obligatoires
    nom: '',
    prenom: '',
    username: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',

    //Champs facultatifs
    age: '',                // En années
    poids: '',              // En kg
    sexe: '',               // "H" ou "F"
    activiteIntense: '',    // minutes/semaine
    activiteModeree: '',    // minutes/semaine
    temperatureLieu: '',    // "<20" ou ">20"
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        fullname: `${formData.prenom.trim()} ${formData.nom.trim()}`.trim(),
      };

      await register(payload);
      // Navigation automatique gérée par AuthContext
    } catch (error: any) {
      setErrors({ general: error.message || 'Erreur lors de la creation du compte' });
    } finally {
      setIsLoading(false);
    }
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

          {errors.general && (
            <Text style={[styles.errorText, { color: 'red' }]}>
              {errors.general}
            </Text>
          )}

          <View style={styles.nameRow}>
            <View style={styles.halfInput}>
              <InputField
                label="Prénom"
                placeholder="Jean"
                value={formData.prenom}
                onChangeText={(text) => {
                  setFormData({ ...formData, prenom: text });
                  setErrors({ ...errors, prenom: '', general: '' });
                }}
                error={errors.prenom}
              />
            </View>
            <View style={styles.halfInput}>
              <InputField
                label="Nom"
                placeholder="Dupont"
                value={formData.nom}
                onChangeText={(text) => {
                  setFormData({ ...formData, nom: text });
                  setErrors({ ...errors, nom: '', general: '' });
                }}
                error={errors.nom}
              />
            </View>
          </View>

          <InputField
            label="Nom d'utilisateur"
            placeholder="jeandupont"
            value={formData.username}
            onChangeText={(text) => {
              setFormData({ ...formData, username: text });
              setErrors({ ...errors, username: '', general: '' });
            }}
            error={errors.username}
          />

          <InputField
            label="Email"
            placeholder="jean@example.com"
            value={formData.email}
            onChangeText={(text) => {
              setFormData({ ...formData, email: text });
              setErrors({ ...errors, email: '', general: '' });
            }}
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
            onChangeText={(text) => {
              setFormData({ ...formData, password: text });
              setErrors({ ...errors, password: '', general: '' });
            }}
            type="password"
            error={errors.password}
          />

          <InputField
            label="Confirmer le mot de passe"
            placeholder="Confirmez votre mot de passe"
            value={formData.confirmPassword}
            onChangeText={(text) => {
              setFormData({ ...formData, confirmPassword: text });
              setErrors({ ...errors, confirmPassword: '', general: '' });
            }}
            type="password"
            error={errors.confirmPassword}
          />

          <InputField
            label="Âge (facultatif)"
            placeholder="25"
            value={formData.age}
            onChangeText={(text) => {
              setFormData({ ...formData, age: text });
            }}
            type="number"
            optional
          />

          <InputField
            label="Poids en kg (facultatif)"
            placeholder="70"
            value={formData.poids}
            onChangeText={(text) => {
              setFormData({ ...formData, poids: text });
            }}
            type="number"
            optional
          />

          <InputField
            label="Activité modérée par semainen en minutes (facultatif)"
            placeholder="120"
            value={formData.activiteModeree}
            onChangeText={(text) => {
              setFormData({ ...formData, activiteModeree: text });
            }}
            type="number"
            optional
          />

          <InputField
            label="Activité intense par semainen en minutes (facultatif)"
            placeholder="60"
            value={formData.activiteIntense}
            onChangeText={(text) => {
              setFormData({ ...formData, activiteIntense: text });
            }}
            type="number"
            optional
          />

          <Text style={styles.label}>Sexe (facultatif)</Text>
          <Picker
            selectedValue={formData.sexe}
            onValueChange={(itemValue) => 
              setFormData({ ...formData, sexe: itemValue })}>
            <Picker.Item label="Sélectionner..." value="" />
            <Picker.Item label="Homme" value="H" />
            <Picker.Item label="Femme" value="F" />
          </Picker>

          <Text style={styles.label}>Température de votre lieu de vie (facultatif)</Text>
          <Picker
            selectedValue={formData.temperatureLieu}
            onValueChange={(itemValue) => 
              setFormData({ ...formData, temperatureLieu: itemValue })}>
            <Picker.Item label="Sélectionner..." value="" />
            <Picker.Item label="Moins de 20°C" value="<20" />
            <Picker.Item label="Plus de 20°C" value=">20" />
          </Picker>

          <Button
            title={isLoading ? "Inscription..." : "S'inscrire"}
            onPress={handleRegister}
            size="large"
            style={styles.button}
            disabled={isLoading}
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
  errorText: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
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

  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 15,
  },
});

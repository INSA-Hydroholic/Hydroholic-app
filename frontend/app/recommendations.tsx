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
import { useUser } from '@/context/UserContext';

interface FormData {
  age: string;
  sexe: string;
  region: string;
  seances: string;
  intensive: boolean;
  poids: string;
}

export default function RecommendationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { getRecommendation } = useUser();

  const [formData, setFormData] = useState<FormData>({
    age: '',
    sexe: '',
    region: '',
    seances: '',
    intensive: false,
    poids: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [recommendation, setRecommendation] = useState<number | null>(null);

  const sexes = ['Homme', 'Femme', 'Autre'];
  const regions = [
    'Île-de-France',
    'Auvergne-Rhône-Alpes',
    'Nouvelle-Aquitaine',
    'Occitanie',
    'Hauts-de-France',
    'Provence-Alpes-Côte d\'Azur',
    'Bretagne',
    'Bourgogne-Franche-Comté',
    'Centre-Val de Loire',
    'Corse',
    'Grand Est',
    'Normandie',
    'Pays de la Loire',
  ];

  const calculateRecommendation = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.age) newErrors.age = 'L\'âge est requis';
    if (!formData.sexe) newErrors.sexe = 'Le sexe est requis';
    if (!formData.region) newErrors.region = 'La région est requise';
    if (!formData.seances) newErrors.seances = 'Le nombre de séances est requis';
    if (!formData.poids) newErrors.poids = 'Le poids est requis';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const age = parseInt(formData.age);
    const poids = parseInt(formData.poids);
    const seances = parseInt(formData.seances);

    const rec = getRecommendation(age, formData.sexe, poids, seances, formData.intensive);
    setRecommendation(rec);
  };

  const handleSkip = () => {
    router.push('/(tabs)');
  };

  const handleAcceptRecommendation = () => {
    // TODO: Sauvegarder la recommandation
    router.push('/(tabs)');
  };

  const handleModifyRecommendation = () => {
    // TODO: Ouvrir un modal pour modifier la recommandation
    setRecommendation(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {recommendation ? 'Recommandation personnalisée' : 'Compléter ton profil'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            {recommendation
              ? 'Voici notre recommandation en fonction de tes informations'
              : 'Aide-nous à te proposer une recommandation personnalisée'}
          </Text>
        </View>

        {!recommendation ? (
          <>
            {/* Form */}
            <View style={styles.formContainer}>
              <InputField
                label="Âge"
                placeholder="25"
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                type="number"
                error={errors.age}
              />

              <View style={styles.selectContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Sexe</Text>
                <View style={styles.optionsRow}>
                  {sexes.map((sex) => (
                    <Pressable
                      key={sex}
                      style={[
                        styles.option,
                        {
                          backgroundColor:
                            formData.sexe === sex ? Palette.secondary : colors.lightGray,
                          borderColor:
                            formData.sexe === sex ? Palette.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, sexe: sex })}>
                      <Text
                        style={[
                          styles.optionText,
                          { color: formData.sexe === sex ? '#fff' : colors.text },
                        ]}>
                        {sex}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {errors.sexe && <Text style={[styles.error, { color: Palette.dark }]}>{errors.sexe}</Text>}
              </View>

              <View style={styles.selectContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Région</Text>
                <View style={styles.regionOptions}>
                  {regions.map((region) => (
                    <Pressable
                      key={region}
                      style={[
                        styles.regionOption,
                        {
                          backgroundColor:
                            formData.region === region ? Palette.accent : colors.lightGray,
                          borderColor:
                            formData.region === region ? Palette.primary : colors.border,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, region })}>
                      <Text
                        style={[
                          styles.regionOptionText,
                          { color: formData.region === region ? '#fff' : colors.text },
                        ]}>
                        {region}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {errors.region && <Text style={[styles.error, { color: Palette.dark }]}>{errors.region}</Text>}
              </View>

              <InputField
                label="Nombre de séances de sport par semaine"
                placeholder="3"
                value={formData.seances}
                onChangeText={(text) => setFormData({ ...formData, seances: text })}
                type="number"
                error={errors.seances}
              />

              <View style={styles.checkboxContainer}>
                <Pressable
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({ ...formData, intensive: !formData.intensive })
                  }>
                  <View
                    style={[
                      styles.checkboxBox,
                      {
                        backgroundColor: formData.intensive
                          ? Palette.secondary
                          : colors.lightGray,
                        borderColor: formData.intensive ? Palette.primary : colors.border,
                      },
                    ]}>
                    {formData.intensive && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                    Activité intensive (courir, vélo intense, etc.)
                  </Text>
                </Pressable>
              </View>

              <InputField
                label="Poids (kg)"
                placeholder="70"
                value={formData.poids}
                onChangeText={(text) => setFormData({ ...formData, poids: text })}
                type="number"
                error={errors.poids}
              />

              <Button
                title="Calculer ma recommandation"
                onPress={calculateRecommendation}
                size="large"
                style={styles.button}
              />
            </View>

            {/* Skip Button */}
            <Button
              title="Passer cette étape"
              onPress={handleSkip}
              variant="outline"
              style={styles.skipButton}
            />
          </>
        ) : (
          <>
            {/* Recommendation Display */}
            <View
              style={[
                styles.recommendationBox,
                { backgroundColor: Palette.accent + '20', borderColor: Palette.accent },
              ]}>
              <Text style={[styles.recommendationTitle, { color: Palette.primary }]}>
                Notre recommandation:
              </Text>
              <View style={styles.recommendationValue}>
                <Text style={[styles.recommendationNumber, { color: Palette.secondary }]}>
                  {recommendation}L
                </Text>
                <Text style={[styles.recommendationText, { color: colors.text }]}>
                  d'eau par jour
                </Text>
              </View>
              <Text style={[styles.recommendationSubtext, { color: colors.icon }]}>
                Cette recommandation est basée sur ton âge, ton poids, ta région et ton
                activité sportive.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <Button
                title="Accepter"
                onPress={handleAcceptRecommendation}
                size="large"
                style={styles.buttonFull}
              />
              <Button
                title="Modifier"
                onPress={handleModifyRecommendation}
                variant="secondary"
                size="large"
                style={styles.buttonFull}
              />
            </View>
          </>
        )}
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
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  formContainer: {
    marginVertical: 20,
  },
  selectContainer: {
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  regionOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    width: '48%',
  },
  regionOptionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  checkboxContainer: {
    marginVertical: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },
  button: {
    marginTop: 24,
  },
  skipButton: {
    marginTop: 12,
    marginBottom: 20,
  },
  recommendationBox: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    marginVertical: 24,
    alignItems: 'center',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  recommendationValue: {
    alignItems: 'center',
    marginBottom: 16,
  },
  recommendationNumber: {
    fontSize: 48,
    fontWeight: '700',
  },
  recommendationText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  recommendationSubtext: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonsContainer: {
    gap: 12,
  },
  buttonFull: {
    marginVertical: 8,
  },
});

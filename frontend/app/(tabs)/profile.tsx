import React, { useEffect, useState, useCallback } from 'react';
import {
  View, StyleSheet, ScrollView, SafeAreaView,
  Text, Pressable, ActivityIndicator, Dimensions,
  Modal, Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/Header';
import { SideMenu } from '@/components/SideMenu';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthContext';
import { profileApi } from '@/services/api';

const { width } = Dimensions.get('window');
const BAR_MAX_HEIGHT = 80;

type HydrationLog = {
  id: number;
  userID: number;
  weight: number;
  measured_at: string;
  source: string;
};

type DailyConsumption = { day: string; total: number };

const getLast7Days = (): { startDate: string; endDate: string; labels: string[] } => {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    labels.push(d.toLocaleDateString('fr-FR', { weekday: 'short' }));
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    labels,
  };
};

const groupByDay = (logs: HydrationLog[]): DailyConsumption[] => {
  const map: Record<string, number> = {};
  const { labels } = getLast7Days();

  // Init all days to 0
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    map[key] = 0;
  }

  logs.forEach((log) => {
    const d = new Date(log.measured_at);
    const key = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    if (key in map) {
      map[key] = (map[key] || 0) + log.weight;
    }
  });

  return labels.map((day) => ({ day, total: Math.round((map[day] || 0) / 10) / 100 })); // g → L
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout, user } = useAuth();

  const [profileData, setProfileData] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<DailyConsumption[]>([]);
  const [totalWeek, setTotalWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  // On initialise le formulaire avec les données actuelles de l'utilisateur
  const [editForm, setEditForm] = useState({
    email: user?.email || '',
    region: user?.region || '',
    weight: user?.weight?.toString() || '',
    biography: user?.biography || '',
    num_moderate_activities: user?.num_moderate_activities?.toString() || '0',
    num_intense_activities: user?.num_intense_activities?.toString() || '0',
  });

  const userId = String(user?.id ?? '');

  const load = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const [profile, history] = await Promise.all([
        profileApi.getById(userId),
        profileApi.getWaterHistory(userId),
      ]);
      setProfileData(profile);

      const daily = groupByDay(history as HydrationLog[]);
      setWeeklyData(daily);
      setTotalWeek(daily.reduce((acc, d) => acc + d.total, 0));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const handleUpdateProfile = async () => {
  setLoading(true);
  try {
    const response = await profileApi.updateProfile({
      email: editForm.email,
      region: editForm.region, // On envoie 'region' pour correspondre au Backend
      biography: editForm.biography,
      weight: parseFloat(editForm.weight),
      // On s'assure d'envoyer au moins 1 si le backend refuse 0, 
      // ou idéalement on corrige le backend (voir ci-dessous)
      num_moderate_activities: Math.max(0, parseInt(editForm.num_moderate_activities)),
      num_intense_activities: Math.max(0, parseInt(editForm.num_intense_activities)),
    });

    Alert.alert("Succès", "Votre profil a été mis à jour !");
    setIsModalVisible(false);
    // Recharge les données pour voir les changements
    void load(); 
  } catch (error) {
    console.error(error);
    Alert.alert("Erreur", "Impossible de mettre à jour le profil.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { void load(); }, [load]);

  const maxBar = Math.max(...weeklyData.map((d) => d.total), 0.1);
  const dailyGoalL = (profileData?.daily_goal ?? 2000) / 1000;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        onMenuPress={() => setMenuVisible(true)}
        onNotificationsPress={() => {}}
        onProfilePress={() => {}}
      />
      <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} onItemPress={() => {}} />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Profile Header */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: Palette.secondary + '30', borderColor: Palette.primary }]}>
            <Text style={styles.avatarEmoji}>💧</Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user ? `${user?.prenom ?? ''} ${user?.nom ?? ''}`.trim() || user.username : '—'}
          </Text>
          <Text style={[styles.profileUsername, { color: Palette.secondary }]}>
            @{user?.username ?? '—'}
          </Text>
          <Text style={[styles.profileBio, { color: colors.icon }]}>
            {user?.bio ?? 'Aucune biographie pour le moment.'}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Palette.primary }]}>
                {isLoading ? '…' : `${totalWeek.toFixed(1)}L`}
              </Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Cette semaine</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Palette.secondary }]}>
                {isLoading ? '…' : `${dailyGoalL.toFixed(1)}L`}
              </Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Objectif/jour</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Palette.accent }]}>
                {isLoading ? '…' : `${Math.round((totalWeek / (dailyGoalL * 7)) * 100)}%`}
              </Text>
              <Text style={[styles.statLabel, { color: colors.icon }]}>Semaine</Text>
            </View>
          </View>
        </View>

        {/* Weekly Bar Chart */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hydratation — 7 derniers jours</Text>

          {isLoading ? (
            <ActivityIndicator color={Palette.primary} style={{ marginVertical: 24 }} />
          ) : (
            <>
              <View style={styles.chartContainer}>
                {weeklyData.map((day, i) => {
                  const barHeight = Math.max(4, (day.total / maxBar) * BAR_MAX_HEIGHT);
                  const isGoalMet = day.total >= dailyGoalL;
                  return (
                    <View key={i} style={styles.barColumn}>
                      <Text style={[styles.barValue, { color: colors.icon }]}>
                        {day.total > 0 ? `${day.total.toFixed(1)}` : ''}
                      </Text>
                      <View style={styles.barTrack}>
                        {/* Goal line */}
                        <View style={[styles.goalLine, {
                          bottom: (dailyGoalL / maxBar) * BAR_MAX_HEIGHT,
                          borderColor: Palette.accent + '80',
                        }]} />
                        <View style={[styles.bar, {
                          height: barHeight,
                          backgroundColor: isGoalMet ? Palette.secondary : Palette.primary + 'CC',
                        }]} />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.icon }]}>{day.day}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: Palette.secondary }]} />
                <Text style={[styles.legendText, { color: colors.icon }]}>Objectif atteint</Text>
                <View style={[styles.legendDot, { backgroundColor: Palette.primary + 'CC', marginLeft: 12 }]} />
                <Text style={[styles.legendText, { color: colors.icon }]}>En cours</Text>
                <View style={[styles.legendLine, { borderColor: Palette.accent + '80', marginLeft: 12 }]} />
                <Text style={[styles.legendText, { color: colors.icon }]}>Objectif</Text>
              </View>
            </>
          )}
        </View>

        {/* Personal Info */}
        <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations personnelles</Text>

          {[
            { label: 'Nom', value: user?.nom ?? '—' },
            { label: 'Prénom', value: user?.prenom ?? '—' },
            { label: 'Email', value: user?.email ?? '—' },
            { label: 'Nom d\'utilisateur', value: user?.username ?? '—' },
            { label: 'Ville', value: user?.city || user?.region || '—' },
            { label: 'Poids', value: user?.weight ? `${user.weight} kg` : '—' },
            { label: 'Âge', value: user?.age ? `${user.age} ans` : '—' },
            { label: 'Sexe', value: user?.sex === 'male' ? 'Homme' : (user?.sex === 'female' ? 'Femme' : '—') },
            { label: 'Nombre d\'heures d\'activité intenses par semaine', value: user?.num_intense_activities ?? '—' },
            { label: 'Nombre d\'heures d\'activité modérées par semaine', value: user?.num_moderate_activities ?? '—' },
            { label: 'Objectif quotidien', value: `${dailyGoalL.toFixed(1)} L` },
          ].map(({ label, value }, i, arr) => (
            <React.Fragment key={label}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
          <TouchableOpacity onPress={() => setIsModalVisible(true)}>
            <Text style={{color: '#007AFF', textAlign: 'center', marginTop: 10}}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <Button
          title="Se déconnecter"
          onPress={logout}
          variant="danger"
          size="large"
          style={styles.logoutButton}
        />

        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifier mon profil</Text>
              
              <ScrollView>
                <Text style={styles.label}>Email</Text>
                <TextInput 
                  style={styles.input} 
                  value={editForm.email} 
                  onChangeText={(t) => setEditForm({...editForm, email: t})} 
                />

                <Text style={styles.label}>Ville</Text>
                <TextInput 
                  style={styles.input} 
                  value={editForm.region} 
                  onChangeText={(t) => setEditForm({...editForm, region: t})} 
                />

                <Text style={styles.label}>Poids (kg)</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric"
                  value={editForm.weight} 
                  onChangeText={(t) => setEditForm({...editForm, weight: t})} 
                />

                <Text style={styles.label}>Biographie</Text>
                <TextInput 
                  style={[styles.input, {height: 80}]} 
                  multiline
                  value={editForm.biography} 
                  onChangeText={(t) => setEditForm({...editForm, biography: t})} 
                />

                <Text style={styles.label}>Activités modérées (h/semaine)</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric"
                  value={editForm.num_moderate_activities} 
                  onChangeText={(t) => setEditForm({...editForm, num_moderate_activities: t})} 
                />

                <Text style={styles.label}>Activités intenses (h/semaine)</Text>
                <TextInput 
                  style={styles.input} 
                  keyboardType="numeric"
                  value={editForm.num_intense_activities} 
                  onChangeText={(t) => setEditForm({...editForm, num_intense_activities: t})} 
                />
              </ScrollView>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                  <Text style={{color: 'red'}}>Annuler</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={loading}>
                  <Text style={{color: 'white'}}>{loading ? "Enregistrement..." : "Enregistrer"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  card: {
    borderRadius: 16, padding: 20, marginVertical: 8,
    borderWidth: 1,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 12, borderWidth: 3,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  avatarEmoji: { fontSize: 36 },
  profileName: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  profileUsername: { fontSize: 14, fontWeight: '500', textAlign: 'center', marginBottom: 8 },
  profileBio: { fontSize: 12, textAlign: 'center', marginBottom: 16, fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#00000010' },
  statItem: { alignItems: 'center', flex: 1 },
  statDivider: { width: 1, height: 40, backgroundColor: '#00000015' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 16 },
  chartContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: BAR_MAX_HEIGHT + 40, marginBottom: 8 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { fontSize: 9, marginBottom: 4 },
  barTrack: { width: '60%', height: BAR_MAX_HEIGHT, justifyContent: 'flex-end', position: 'relative' },
  bar: { width: '100%', borderRadius: 4 },
  goalLine: { position: 'absolute', left: -2, right: -2, borderTopWidth: 1, borderStyle: 'dashed' },
  barLabel: { fontSize: 10, marginTop: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginTop: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLine: { width: 14, borderTopWidth: 1, borderStyle: 'dashed' },
  legendText: { fontSize: 10 },
  infoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 13 },
  divider: { height: 1 },
  logoutButton: { marginTop: 16, marginBottom: 8 },
});
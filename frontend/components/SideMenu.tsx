import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const SideMenu: React.FC<{ visible: boolean; onClose: () => void; onItemPress: (item: string) => void }> = ({
  visible,
  onClose,
  onItemPress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!visible) return null;

  const menuItems = [
    { label: 'Accueil', icon: '🏠' },
    { label: 'Historique', icon: '📊' },
    { label: 'Défis', icon: '🏆' },
    { label: 'Classement', icon: '📈' },
    { label: 'Amis', icon: '👥' },
    { label: 'Profil', icon: '👤' },
    { label: 'Paramètres', icon: '⚙️' },
    { label: 'Déconnexion', icon: '🚪' },
  ];

  return (
    <>
      {/* Overlay */}
      <Pressable
        style={[styles.overlay, { backgroundColor: colors.background + '80' }]}
        onPress={onClose}
      />

      {/* Menu */}
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: colors.background, borderRightColor: colors.border },
        ]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: Palette.primary }]}>💧 Hydroholic</Text>
          <Pressable onPress={onClose}>
            <Text style={[styles.closeIcon, { color: colors.text }]}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.menuList}>
          {menuItems.map((item, index) => (
            <Pressable
              key={index}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => {
                onItemPress(item.label);
                onClose();
              }}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.version, { color: colors.icon }]}>v1.0.0</Text>
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '75%',
    maxWidth: 300,
    zIndex: 2,
    borderRightWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Palette.light,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeIcon: {
    fontSize: 24,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuIcon: {
    fontSize: 20,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  version: {
    fontSize: 12,
    textAlign: 'center',
  },
});

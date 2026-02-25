import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface HeaderProps {
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
  onSearchPress,
  notificationCount = 0,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {/* Left: Menu */}
      <Pressable style={styles.iconButton} onPress={onMenuPress}>
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      {/* Center: Logo */}
      <View style={styles.centerContainer}>
        <Text style={[styles.logo, { color: Palette.primary }]}>💧 Hydroholic</Text>
      </View>

      {/* Right: Icons */}
      <View style={styles.rightContainer}>
        {/* Search */}
        <Pressable style={styles.iconButton} onPress={onSearchPress}>
          <Text style={[styles.icon, { color: colors.text }]}>🔍</Text>
        </Pressable>

        {/* Notifications */}
        <Pressable style={styles.iconButton} onPress={onNotificationsPress}>
          <Text style={[styles.icon, { color: colors.text }]}>🔔</Text>
          {notificationCount > 0 && (
            <View style={[styles.badge, { backgroundColor: Palette.dark }]}>
              <Text style={styles.badgeText}>{notificationCount}</Text>
            </View>
          )}
        </Pressable>

        {/* Profile */}
        <Pressable style={styles.iconButton} onPress={onProfilePress}>
          <View
            style={[
              styles.profilePhoto,
              { backgroundColor: Palette.secondary, borderColor: Palette.primary },
            ]}>
            <Text style={styles.profileInitial}>👤</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
  },
  rightContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  profilePhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  profileInitial: {
    fontSize: 16,
  },
});

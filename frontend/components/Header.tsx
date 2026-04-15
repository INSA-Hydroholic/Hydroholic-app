import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface HeaderProps {
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onProfilePress?: () => void;
  notificationCount?: number;
  batteryLevel?: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onNotificationsPress,
  onProfilePress,
  notificationCount = 0,
  batteryLevel = null,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const safeBattery = batteryLevel !== null ? Math.max(0, Math.min(100, Math.round(batteryLevel))) : null;
  const batteryTone =
    safeBattery === null
      ? '#94a3b8'
      : safeBattery <= 20
      ? '#ef4444'
      : safeBattery <= 45
      ? '#f59e0b'
      : '#10b981';

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      {/* Left: Menu */}
      <Pressable style={styles.iconButton} onPress={onMenuPress}>
        <Text style={styles.menuIcon}>☰</Text>
      </Pressable>

      {/* Center: Logo */}
      <View style={styles.centerContainer}>
        <Text style={[styles.logo, { color: Palette.primary }]}> Hydroholic</Text>
      </View>

      {/* Right: Icons */}
      <View style={styles.rightContainer}>

        <View style={[styles.batteryChip, { borderColor: `${batteryTone}66` }]}>
          <View style={styles.batteryIconShell}>
            <View style={styles.batteryIconTop} />
            <View style={styles.batteryIconInner}>
              <View style={[styles.batteryIconFill, { width: `${safeBattery ?? 8}%`, backgroundColor: batteryTone }]} />
            </View>
          </View>
          <Text style={[styles.batteryLabel, { color: batteryTone }]}> 
            {safeBattery !== null ? `${safeBattery}%` : '--'}
          </Text>
        </View>

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
    alignItems: 'center',
    gap: 4,
  },
  batteryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: '#eef6ff',
    gap: 6,
  },
  batteryIconShell: {
    width: 22,
    alignItems: 'center',
  },
  batteryIconTop: {
    width: 8,
    height: 2,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: '#c9d7ea',
    marginBottom: 2,
  },
  batteryIconInner: {
    width: 18,
    height: 9,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#c9d7ea',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: 1,
  },
  batteryIconFill: {
    height: '100%',
    borderRadius: 2,
  },
  batteryLabel: {
    fontSize: 11,
    fontWeight: '800',
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

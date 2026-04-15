import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type BatteryCardProps = {
  level: number | null;
  isConnected: boolean;
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
};

export function BatteryCard({
  level,
  isConnected,
  onRefresh,
  refreshing = false,
}: BatteryCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const batteryValue = level !== null ? Math.max(0, Math.min(100, Math.round(level))) : null;
  const fillWidth = batteryValue !== null ? `${batteryValue}%` : '6%';

  const batteryTone =
    batteryValue === null
      ? '#94a3b8'
      : batteryValue <= 20
      ? '#ef4444'
      : batteryValue <= 45
      ? '#f59e0b'
      : '#10b981';

  const batteryStateLabel =
    !isConnected
      ? 'ESP32 disconnected'
      : batteryValue === null
      ? 'Waiting for battery value'
      : batteryValue <= 20
      ? 'Low battery'
      : batteryValue <= 45
      ? 'Battery medium'
      : 'Battery healthy';

  return (
    <View style={[styles.card, { borderColor: colors.border }]}> 
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Hydrobase Battery</Text>
          <Text style={[styles.subtitle, { color: '#64748b' }]}>{batteryStateLabel}</Text>
        </View>

        <View style={[styles.badge, { backgroundColor: `${batteryTone}22` }]}>
          <Text style={[styles.badgeText, { color: batteryTone }]}>
            {batteryValue !== null ? `${batteryValue}%` : '--'}
          </Text>
        </View>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.batteryShell}>
          <View style={styles.batteryTop} />
          <View style={[styles.batteryInner, { borderColor: '#c9d7ea' }]}>
            <View style={[styles.batteryFill, { width: fillWidth, backgroundColor: batteryTone }]} />
          </View>
        </View>

        <View style={styles.legendColumn}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Good</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#f59e0b' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Low</Text>
          </View>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.refreshButton,
          {
            backgroundColor: isConnected ? Palette.primary : '#94a3b8',
            opacity: pressed ? 0.82 : 1,
          },
        ]}
        onPress={onRefresh}
        disabled={!isConnected || refreshing}
      >
        <Text style={styles.refreshButtonText}>
          {refreshing ? 'Refreshing...' : 'Refresh battery'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: '#f7fbff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '800',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  batteryShell: {
    flex: 1,
  },
  batteryTop: {
    alignSelf: 'center',
    width: 20,
    height: 5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: '#c9d7ea',
    marginBottom: 3,
  },
  batteryInner: {
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#eef4ff',
    padding: 3,
  },
  batteryFill: {
    height: '100%',
    borderRadius: 6,
  },
  legendColumn: {
    width: 90,
    gap: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
  },
  refreshButton: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});

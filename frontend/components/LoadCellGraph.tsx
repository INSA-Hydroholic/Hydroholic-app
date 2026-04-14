import React, { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

type LoadCellPoint = {
  value: number;
  label: string;
};

type LoadCellGraphProps = {
  points: LoadCellPoint[];
};

export function LoadCellGraph({ points }: LoadCellGraphProps) {
  const chartHeight = 140;
  const dotSize = 8;
  const [chartWidth, setChartWidth] = useState(300);

  if (points.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Courbe capteur de charge</Text>
        <Text style={styles.emptyText}>Aucune mesure pour le moment. Connectez l'ESP32 pour voir la courbe.</Text>
      </View>
    );
  }

  const values = points.map((point) => point.value);
  const maxValue = Math.max(...values, 0.1);
  const minValue = Math.min(...values);
  const range = Math.max(maxValue - minValue, 0.01);
  const latestValue = points[points.length - 1]?.value ?? 0;
  const labelStep = Math.max(1, Math.ceil(points.length / 8));

  const chartPoints = useMemo(() => {
    const safeWidth = Math.max(chartWidth, dotSize * 2 + 1);

    return points.map((point, index) => {
      const ratioX = points.length === 1 ? 0 : index / (points.length - 1);
      const x = dotSize / 2 + ratioX * (safeWidth - dotSize);
      const normalizedY = (point.value - minValue) / range;
      const y = chartHeight - normalizedY * chartHeight;

      return {
        ...point,
        x,
        y,
      };
    });
  }, [chartHeight, chartWidth, dotSize, minValue, points, range]);

  const handleChartLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== chartWidth) {
      setChartWidth(nextWidth);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courbe capteur de charge</Text>

      <View style={styles.statsRow}>
        <Text style={styles.statText}>Actuel: {latestValue.toFixed(2)} L</Text>
        <Text style={styles.statText}>Min: {minValue.toFixed(2)} L</Text>
        <Text style={styles.statText}>Max: {maxValue.toFixed(2)} L</Text>
      </View>

      <View style={styles.chartContent}>
        <View onLayout={handleChartLayout} style={[styles.chartArea, { height: chartHeight }]}>
          {[0.25, 0.5, 0.75].map((tick) => (
            <View
              key={tick}
              style={[
                styles.gridLine,
                { top: Math.round(chartHeight - tick * chartHeight) },
              ]}
            />
          ))}

          {chartPoints.slice(0, -1).map((point, index) => {
            const nextPoint = chartPoints[index + 1];
            const deltaX = nextPoint.x - point.x;
            const deltaY = nextPoint.y - point.y;
            const segmentLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);

            return (
              <View
                key={`segment-${index}`}
                style={[
                  styles.segment,
                  {
                    left: point.x,
                    top: point.y,
                    width: segmentLength,
                    transform: [{ rotate: `${angle}rad` }],
                  },
                ]}
              />
            );
          })}

          {chartPoints.map((point, index) => (
            <View
              key={`dot-${index}`}
              style={[
                styles.dot,
                {
                  left: point.x - dotSize / 2,
                  top: point.y - dotSize / 2,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.labelsRow}>
          {points.map((point, index) => {
            const ratioX = points.length === 1 ? 0 : index / (points.length - 1);
            const left = ratioX * Math.max(chartWidth - dotSize, 0);
            const showLabel = index === points.length - 1 || index % labelStep === 0;

            return (
              <View key={`label-${index}`} style={[styles.labelCell, { left }]}> 
                <Text style={styles.valueText}>{point.value.toFixed(1)}</Text>
                <Text style={styles.timeText}>{showLabel ? point.label : ' '}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe8ff',
    backgroundColor: '#f5f9ff',
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  statText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  chartContent: {
    alignItems: 'flex-start',
    paddingBottom: 4,
    gap: 10,
    minHeight: 190,
    width: '100%',
  },
  chartArea: {
    position: 'relative',
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#edf4ff',
    borderWidth: 1,
    borderColor: '#cfe0ff',
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: '#dbe8ff',
  },
  segment: {
    position: 'absolute',
    height: 2,
    backgroundColor: '#0284c7',
    transformOrigin: 'left center',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8',
    borderWidth: 1,
    borderColor: '#0369a1',
  },
  labelsRow: {
    width: '100%',
    minHeight: 36,
    position: 'relative',
  },
  labelCell: {
    position: 'absolute',
    marginLeft: -16,
    width: 32,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  valueText: {
    fontSize: 10,
    color: '#1d4ed8',
    marginBottom: 2,
  },
  timeText: {
    marginTop: 2,
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
});
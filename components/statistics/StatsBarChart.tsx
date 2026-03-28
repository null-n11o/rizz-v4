import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { PeriodStats } from '@/src/services/statistics';

interface StatsBarChartProps {
  stats: PeriodStats[];
}

const BAR_COLOR = '#C09E5C';
const CHART_HEIGHT = 120;

export default function StatsBarChart({ stats }: StatsBarChartProps) {
  const { t } = useTranslation();

  if (stats.length === 0) {
    return (
      <View style={styles.empty}>
        <ThemedText style={styles.emptyText}>{t('statistics.noData')}</ThemedText>
      </View>
    );
  }

  const maxApproached = Math.max(...stats.map(s => s.approached), 1);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{t('statistics.metrics.approached')}</ThemedText>
      <View style={styles.chart}>
        {stats.map((s, i) => {
          const barHeight = (s.approached / maxApproached) * CHART_HEIGHT;
          return (
            <View key={`${s.label}-${i}`} style={styles.barWrapper}>
              <View
                style={[styles.bar, { height: Math.max(barHeight, 2), backgroundColor: BAR_COLOR }]}
              />
              <ThemedText style={styles.barLabel} numberOfLines={1}>
                {s.label}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: CHART_HEIGHT + 20,
    gap: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 3,
  },
  barLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#111827',
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 14,
  },
});

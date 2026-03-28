import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { PeriodStats } from '@/src/services/statistics';

interface StatsLineChartProps {
  stats: PeriodStats[];
}

export default function StatsLineChart({ stats }: StatsLineChartProps) {
  const { t } = useTranslation();

  if (stats.length === 0) return null;

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>
        {t('statistics.metrics.contactRate')} / {t('statistics.metrics.cvRate')}
      </ThemedText>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <ThemedText style={[styles.cell, styles.header]}>{t('statistics.period.label')}</ThemedText>
          <ThemedText style={[styles.cell, styles.header]}>{t('statistics.metrics.contactRate')}</ThemedText>
          <ThemedText style={[styles.cell, styles.header]}>{t('statistics.metrics.cvRate')}</ThemedText>
        </View>
        {stats.map((s, i) => (
          <View key={`${s.label}-${i}`} style={[styles.row, i % 2 === 1 && styles.rowAlt]}>
            <ThemedText style={styles.cell}>{s.label}</ThemedText>
            <ThemedText style={[styles.cell, styles.rate]}>{s.contact_rate}%</ThemedText>
            <ThemedText style={[styles.cell, styles.rate]}>{s.cv_rate}%</ThemedText>
          </View>
        ))}
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
  table: {
    gap: 2,
  },
  headerRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#36454F',
    paddingBottom: 4,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  rowAlt: {
    backgroundColor: '#1F2937',
    borderRadius: 4,
  },
  cell: {
    flex: 1,
    fontSize: 12,
    color: '#D1D5DB',
    textAlign: 'center',
  },
  header: {
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  rate: {
    color: '#D4AF37',
  },
});

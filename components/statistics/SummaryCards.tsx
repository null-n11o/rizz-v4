import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { PeriodStats } from '@/src/services/statistics';

interface SummaryCardsProps {
  stats: PeriodStats[];
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  const { t } = useTranslation();

  const totals = stats.reduce(
    (acc, s) => ({
      approached: acc.approached + s.approached,
      get_contact: acc.get_contact + s.get_contact,
      instant_cv: acc.instant_cv + s.instant_cv,
    }),
    { approached: 0, get_contact: 0, instant_cv: 0 }
  );

  const contactRate = totals.approached > 0
    ? Math.round((totals.get_contact / totals.approached) * 1000) / 10
    : 0;
  const cvRate = totals.approached > 0
    ? Math.round((totals.instant_cv / totals.approached) * 1000) / 10
    : 0;

  const cards = [
    { label: t('statistics.metrics.approached'), value: totals.approached, unit: '' },
    { label: t('statistics.metrics.contactRate'), value: contactRate, unit: '%' },
    { label: t('statistics.metrics.cvRate'), value: cvRate, unit: '%' },
  ];

  return (
    <View style={styles.container}>
      {cards.map(card => (
        <View key={card.label} style={styles.card}>
          <ThemedText style={styles.value}>{card.value}{card.unit}</ThemedText>
          <ThemedText style={styles.label}>{card.label}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C09E5C',
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
});

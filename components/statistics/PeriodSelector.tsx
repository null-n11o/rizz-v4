import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { StatsPeriod } from '@/src/services/statistics';

interface PeriodSelectorProps {
  selected: StatsPeriod;
  onSelect: (period: StatsPeriod) => void;
}

const PERIODS: { key: StatsPeriod; labelKey: string }[] = [
  { key: 'daily',   labelKey: 'statistics.period.daily' },
  { key: 'weekly',  labelKey: 'statistics.period.weekly' },
  { key: 'monthly', labelKey: 'statistics.period.monthly' },
  { key: 'yearly',  labelKey: 'statistics.period.yearly' },
];

export default function PeriodSelector({ selected, onSelect }: PeriodSelectorProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {PERIODS.map(p => (
        <TouchableOpacity
          key={p.key}
          style={[styles.tab, selected === p.key && styles.tabActive]}
          onPress={() => onSelect(p.key)}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === p.key }}
        >
          <ThemedText style={[styles.tabText, selected === p.key && styles.tabTextActive]}>
            {t(p.labelKey)}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#C09E5C',
  },
  tabText: {
    fontSize: 13,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#0A0F23',
    fontWeight: 'bold',
  },
});

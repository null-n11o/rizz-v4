import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { StatsPeriod } from '@/src/services/statistics';

interface DateNavigatorProps {
  period: StatsPeriod;
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}

export default function DateNavigator({ period, year, month, onPrev, onNext }: DateNavigatorProps) {
  const label = period === 'daily'
    ? `${year}年${month}月`
    : period === 'yearly'
    ? '全期間'
    : `${year}年`;

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPrev} style={styles.arrow} accessibilityLabel="前へ">
        <ThemedText style={styles.arrowText}>{'<'}</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TouchableOpacity onPress={onNext} style={styles.arrow} accessibilityLabel="次へ">
        <ThemedText style={styles.arrowText}>{'>'}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 24,
  },
  arrow: {
    padding: 8,
  },
  arrowText: {
    fontSize: 20,
    color: '#C09E5C',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 100,
    textAlign: 'center',
  },
});

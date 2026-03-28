import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GRMStatus, GRM_STATUS_LABELS } from '@/src/types/grm';

const STATUS_COLORS: Record<GRMStatus, { bg: string; text: string }> = {
  lead:       { bg: '#E5E7EB', text: '#374151' },
  apo_1:      { bg: '#DBEAFE', text: '#1D4ED8' },
  apo_2:      { bg: '#EDE9FE', text: '#6D28D9' },
  apo_3:      { bg: '#FCE7F3', text: '#9D174D' },
  apo_4:      { bg: '#FEF3C7', text: '#92400E' },
  apo_5plus:  { bg: '#FED7AA', text: '#C2410C' },
  sex:        { bg: '#DCFCE7', text: '#15803D' },
  ltr:        { bg: '#FEF9C3', text: '#854D0E' },
  graduate:   { bg: '#F3F4F6', text: '#6B7280' },
};

interface Props {
  status: GRMStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const colors = STATUS_COLORS[status];
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, isSmall && styles.badgeSm]}>
      <Text style={[styles.text, { color: colors.text }, isSmall && styles.textSm]}>
        {GRM_STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});

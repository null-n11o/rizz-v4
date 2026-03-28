import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { Girl, GRMStatus, GRM_STATUS_LABELS, GRM_STATUS_ORDER } from '@/src/types/grm';
import { GirlCard } from './GirlCard';

interface Props {
  girls: Girl[];
  onSelectGirl: (girl: Girl) => void;
}

export function PipelineView({ girls, onSelectGirl }: Props) {
  const byStatus = GRM_STATUS_ORDER.reduce<Record<GRMStatus, Girl[]>>((acc, status) => {
    acc[status] = girls.filter(g => g.status === status);
    return acc;
  }, {} as Record<GRMStatus, Girl[]>);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View style={styles.row}>
        {GRM_STATUS_ORDER.map(status => (
          <View key={status} style={styles.column}>
            <View style={styles.columnHeader}>
              <Text style={styles.columnTitle}>{GRM_STATUS_LABELS[status]}</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{byStatus[status].length}</Text>
              </View>
            </View>

            <ScrollView
              style={styles.columnScroll}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {byStatus[status].length === 0 ? (
                <View style={styles.emptyColumn}>
                  <Text style={styles.emptyText}>なし</Text>
                </View>
              ) : (
                byStatus[status].map(girl => (
                  <GirlCard key={girl.id} girl={girl} onPress={onSelectGirl} />
                ))
              )}
            </ScrollView>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    gap: 10,
  },
  column: {
    width: 160,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    maxHeight: 600,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  columnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  countBadge: {
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  countText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  columnScroll: {
    flex: 1,
  },
  emptyColumn: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: '#D1D5DB',
  },
});

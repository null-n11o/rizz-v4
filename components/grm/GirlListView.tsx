import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Girl, GRMStatus, GRM_STATUS_LABELS, GRM_STATUS_ORDER } from '@/src/types/grm';
import { GirlCard } from './GirlCard';

type SortKey = 'updatedAt' | 'createdAt' | 'rating' | 'totalSpent';

const SORT_LABELS: Record<SortKey, string> = {
  updatedAt: '最終更新',
  createdAt: '出会った日',
  rating: '評価',
  totalSpent: '使用金額',
};

interface Props {
  girls: Girl[];
  onSelectGirl: (girl: Girl) => void;
}

export function GirlListView({ girls, onSelectGirl }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('updatedAt');
  const [filterStatus, setFilterStatus] = useState<GRMStatus | null>(null);

  const filtered = filterStatus
    ? girls.filter(g => g.status === filterStatus)
    : girls;

  const sorted = [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'updatedAt':
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
        return (b.rating ?? 0) - (a.rating ?? 0);
      case 'totalSpent':
        return b.totalSpent - a.totalSpent;
    }
  });

  return (
    <View style={styles.container}>
      {/* ソート */}
      <View style={styles.sortRow}>
        {(Object.keys(SORT_LABELS) as SortKey[]).map(key => (
          <TouchableOpacity
            key={key}
            style={[styles.sortBtn, sortKey === key && styles.sortBtnActive]}
            onPress={() => setSortKey(key)}
          >
            <Text style={[styles.sortBtnText, sortKey === key && styles.sortBtnTextActive]}>
              {SORT_LABELS[key]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ステータスフィルタ */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filterStatus === null && styles.filterBtnActive]}
          onPress={() => setFilterStatus(null)}
        >
          <Text style={[styles.filterBtnText, filterStatus === null && styles.filterBtnTextActive]}>
            全て
          </Text>
        </TouchableOpacity>
        {GRM_STATUS_ORDER.map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterBtn, filterStatus === status && styles.filterBtnActive]}
            onPress={() => setFilterStatus(status)}
          >
            <Text style={[styles.filterBtnText, filterStatus === status && styles.filterBtnTextActive]}>
              {GRM_STATUS_LABELS[status]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <GirlCard girl={item} onPress={onSelectGirl} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>女性が登録されていません</Text>
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  sortBtnActive: {
    backgroundColor: '#111827',
  },
  sortBtnText: {
    fontSize: 12,
    color: '#6B7280',
  },
  sortBtnTextActive: {
    color: '#FFFFFF',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 5,
    flexWrap: 'wrap',
  },
  filterBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterBtnActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  filterBtnText: {
    fontSize: 11,
    color: '#6B7280',
  },
  filterBtnTextActive: {
    color: '#6366F1',
  },
  list: {
    padding: 16,
    paddingTop: 4,
  },
  empty: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 40,
    fontSize: 14,
  },
});

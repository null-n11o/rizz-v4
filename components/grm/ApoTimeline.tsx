import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Apo } from '@/src/types/grm';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Props {
  apos: Apo[];
  onDeleteApo?: (apo: Apo) => void;
}

export function ApoTimeline({ apos, onDeleteApo }: Props) {
  if (apos.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>アポ記録はまだありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {apos.map((apo, index) => (
        <View key={apo.id} style={styles.item}>
          <View style={styles.timeline}>
            <View style={styles.dot} />
            {index < apos.length - 1 && <View style={styles.line} />}
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.apoNumber}>Apo {apo.apoNumber}</Text>
              <Text style={styles.date}>
                {format(new Date(apo.apoDate), 'M月d日(EEE)', { locale: ja })}
              </Text>
            </View>

            {apo.location && (
              <Text style={styles.location}>📍 {apo.location}</Text>
            )}

            {apo.spent > 0 && (
              <Text style={styles.spent}>💰 ¥{apo.spent.toLocaleString()}</Text>
            )}

            {apo.notes && (
              <Text style={styles.notes}>{apo.notes}</Text>
            )}

            {onDeleteApo && (
              <TouchableOpacity onPress={() => onDeleteApo(apo)} style={styles.deleteBtn}>
                <Text style={styles.deleteBtnText}>削除</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingLeft: 4,
  },
  empty: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  item: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeline: {
    width: 20,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366F1',
    marginTop: 4,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  apoNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4F46E5',
  },
  date: {
    fontSize: 13,
    color: '#6B7280',
  },
  location: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  spent: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 2,
  },
  notes: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },
  deleteBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  deleteBtnText: {
    fontSize: 12,
    color: '#EF4444',
  },
});

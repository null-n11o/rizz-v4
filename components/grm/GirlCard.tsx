import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Girl } from '@/src/types/grm';
import { StatusBadge } from './StatusBadge';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Props {
  girl: Girl;
  onPress: (girl: Girl) => void;
}

export function GirlCard({ girl, onPress }: Props) {
  const metAt = format(new Date(girl.createdAt), 'M/d', { locale: ja });

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(girl)} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.nickname} numberOfLines={1}>{girl.nickname}</Text>
        <StatusBadge status={girl.status} size="sm" />
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaText}>出会い: {metAt}</Text>
        {girl.apoCount > 0 && (
          <Text style={styles.metaText}>アポ: {girl.apoCount}回</Text>
        )}
      </View>

      {girl.rating !== null && (
        <View style={styles.ratingRow}>
          {Array.from({ length: 10 }).map((_, i) => (
            <Text key={i} style={[styles.star, i < (girl.rating ?? 0) ? styles.starFilled : styles.starEmpty]}>
              ★
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  meta: {
    flexDirection: 'row',
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  ratingRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  star: {
    fontSize: 10,
  },
  starFilled: {
    color: '#F59E0B',
  },
  starEmpty: {
    color: '#D1D5DB',
  },
});

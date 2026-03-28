import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Girl, Apo, GRMStatus, GRM_STATUS_LABELS } from '@/src/types/grm';
import { StatusBadge } from './StatusBadge';
import { ApoTimeline } from './ApoTimeline';
import { AddApoForm } from './AddApoForm';
import { useGRM } from '@/contexts/GRMContext';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const MANUAL_STATUSES: GRMStatus[] = ['sex', 'ltr', 'graduate'];

interface Props {
  girl: Girl;
  onBack: () => void;
  onEdit: (girl: Girl) => void;
}

export function GirlDetailView({ girl, onBack, onEdit }: Props) {
  const { getAposByGirl, updateGirlStatus, deleteApo, deleteGirl } = useGRM();
  const [apos, setApos] = useState<Apo[]>([]);
  const [showAddApo, setShowAddApo] = useState(false);

  const loadApos = useCallback(async () => {
    const fetched = await getAposByGirl(girl.id);
    setApos(fetched);
  }, [girl.id, getAposByGirl]);

  useEffect(() => {
    loadApos();
  }, [loadApos]);

  const handleStatusChange = async (status: GRMStatus) => {
    Alert.alert(
      'ステータス変更',
      `${GRM_STATUS_LABELS[status]} に変更しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '変更', onPress: async () => {
            await updateGirlStatus(girl.id, status);
          }
        },
      ]
    );
  };

  const handleDeleteApo = async (apo: Apo) => {
    Alert.alert('アポを削除', 'Apo ' + apo.apoNumber + ' を削除しますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive', onPress: async () => {
          await deleteApo(apo.id, girl.id);
          loadApos();
        }
      },
    ]);
  };

  const handleDeleteGirl = () => {
    Alert.alert('削除', `${girl.nickname} を削除しますか？この操作は取り消せません。`, [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除', style: 'destructive', onPress: async () => {
          await deleteGirl(girl.id);
          onBack();
        }
      },
    ]);
  };

  const metAt = format(new Date(girl.createdAt), 'yyyy年M月d日', { locale: ja });

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>‹ 戻る</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onEdit(girl)}>
          <Text style={styles.editBtn}>編集</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll}>
        {/* プロフィールヘッダー */}
        <View style={styles.profileHeader}>
          <View style={styles.profileTop}>
            <Text style={styles.nickname}>{girl.nickname}</Text>
            <StatusBadge status={girl.status} />
          </View>
          <Text style={styles.metAt}>出会い: {metAt}</Text>
          {girl.rating !== null && (
            <View style={styles.ratingRow}>
              {Array.from({ length: 10 }).map((_, i) => (
                <Text key={i} style={[styles.star, i < (girl.rating ?? 0) ? styles.starFilled : styles.starEmpty]}>
                  ★
                </Text>
              ))}
              <Text style={styles.ratingNum}>{girl.rating}/10</Text>
            </View>
          )}
        </View>

        {/* ステータス変更ボタン */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ステータス変更</Text>
          <View style={styles.statusBtns}>
            {MANUAL_STATUSES.map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.statusBtn, girl.status === s && styles.statusBtnActive]}
                onPress={() => handleStatusChange(s)}
              >
                <Text style={[styles.statusBtnText, girl.status === s && styles.statusBtnTextActive]}>
                  {GRM_STATUS_LABELS[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 基本情報 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本情報</Text>
          <View style={styles.infoGrid}>
            {girl.height && <InfoRow label="身長" value={`${girl.height}cm`} />}
            {girl.bodyType && <InfoRow label="体型" value={girl.bodyType} />}
            {girl.birthday && (
              <InfoRow label="生年月日" value={format(new Date(girl.birthday), 'yyyy年M月d日', { locale: ja })} />
            )}
            {girl.occupation && <InfoRow label="職業" value={girl.occupation} />}
            {girl.nationality && <InfoRow label="国籍" value={girl.nationality} />}
            {girl.residence && <InfoRow label="居住地" value={girl.residence} />}
          </View>
        </View>

        {/* 統計 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>統計</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{girl.apoCount}</Text>
              <Text style={styles.statLabel}>アポ回数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>¥{girl.totalSpent.toLocaleString()}</Text>
              <Text style={styles.statLabel}>合計使用金額</Text>
            </View>
          </View>
        </View>

        {/* アポ履歴 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>アポ履歴</Text>
            <TouchableOpacity onPress={() => setShowAddApo(true)} style={styles.addApoBtn}>
              <Text style={styles.addApoBtnText}>+ アポを追加</Text>
            </TouchableOpacity>
          </View>
          <ApoTimeline apos={apos} onDeleteApo={handleDeleteApo} />
        </View>

        {/* メモ */}
        {girl.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>メモ</Text>
            <Text style={styles.notes}>{girl.notes}</Text>
          </View>
        )}

        {/* 削除 */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteGirl}>
          <Text style={styles.deleteBtnText}>この女性を削除</Text>
        </TouchableOpacity>
      </ScrollView>

      <AddApoForm
        girlId={girl.id}
        visible={showAddApo}
        onClose={() => setShowAddApo(false)}
        onAdded={loadApos}
      />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text style={infoStyles.value}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
  },
  value: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {},
  backBtnText: {
    fontSize: 17,
    color: '#4F46E5',
  },
  editBtn: {
    fontSize: 16,
    color: '#4F46E5',
  },
  scroll: {
    flex: 1,
  },
  profileHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  metAt: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  star: {
    fontSize: 16,
  },
  starFilled: {
    color: '#F59E0B',
  },
  starEmpty: {
    color: '#D1D5DB',
  },
  ratingNum: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  statusBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  statusBtnText: {
    fontSize: 14,
    color: '#374151',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  infoGrid: {},
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  addApoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  addApoBtnText: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '600',
  },
  notes: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  deleteBtn: {
    margin: 16,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#EF4444',
  },
});

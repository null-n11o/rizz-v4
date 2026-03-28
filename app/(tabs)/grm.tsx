import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Girl } from '@/src/types/grm';
import { useGRM } from '@/contexts/GRMContext';
import { PipelineView } from '@/components/grm/PipelineView';
import { GirlListView } from '@/components/grm/GirlListView';
import { GirlDetailView } from '@/components/grm/GirlDetailView';
import { GirlRegistrationForm } from '@/components/grm/GirlRegistrationForm';

type ViewMode = 'pipeline' | 'list';

export default function GRMScreen() {
  const { girls, loading, fetchGirls } = useGRM();
  const [viewMode, setViewMode] = useState<ViewMode>('pipeline');
  const [selectedGirl, setSelectedGirl] = useState<Girl | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    fetchGirls();
  }, [fetchGirls]);

  // 詳細ビューを表示中
  if (selectedGirl) {
    const currentGirl = girls.find(g => g.id === selectedGirl.id) ?? selectedGirl;
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <GirlDetailView
          girl={currentGirl}
          onBack={() => setSelectedGirl(null)}
          onEdit={(girl) => {
            // TODO: 編集フォームを開く（Phase 3以降で詳細実装）
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>GRM</Text>
        <View style={styles.headerRight}>
          <Text style={styles.girlCount}>{girls.length}人</Text>
          <TouchableOpacity onPress={() => setShowRegistration(true)} style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ 追加</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ビュー切り替えタブ */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'pipeline' && styles.toggleBtnActive]}
          onPress={() => setViewMode('pipeline')}
        >
          <Text style={[styles.toggleBtnText, viewMode === 'pipeline' && styles.toggleBtnTextActive]}>
            パイプライン
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleBtnText, viewMode === 'list' && styles.toggleBtnTextActive]}>
            リスト
          </Text>
        </TouchableOpacity>
      </View>

      {loading && girls.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : viewMode === 'pipeline' ? (
        <PipelineView girls={girls} onSelectGirl={setSelectedGirl} />
      ) : (
        <GirlListView girls={girls} onSelectGirl={setSelectedGirl} />
      )}

      {/* 手動追加フォーム（セッションなし） */}
      <GirlRegistrationForm
        sessionId={null}
        sourceType="get_contact"
        visible={showRegistration}
        onClose={() => setShowRegistration(false)}
        onRegistered={fetchGirls}
        allowSkip={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  girlCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#4F46E5',
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  viewToggle: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  toggleBtnActive: {
    backgroundColor: '#111827',
  },
  toggleBtnText: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

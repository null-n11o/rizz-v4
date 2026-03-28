import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Modal, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { BodyType, GirlInsert } from '@/src/types/grm';
import { useGRM } from '@/contexts/GRMContext';

interface Props {
  sessionId: string | null;
  sourceType: 'get_contact' | 'instant_cv';
  visible: boolean;
  onClose: () => void;
  onRegistered: () => void;
  /** スキップ可能な場合（任意登録） */
  allowSkip?: boolean;
}

const BODY_TYPES: { value: BodyType; label: string }[] = [
  { value: 'slim', label: 'スリム' },
  { value: 'normal', label: '普通' },
  { value: 'curvy', label: 'グラマー' },
  { value: 'chubby', label: 'ぽっちゃり' },
];

export function GirlRegistrationForm({
  sessionId, sourceType, visible, onClose, onRegistered, allowSkip = true,
}: Props) {
  const { createGirl } = useGRM();

  const [nickname, setNickname] = useState('');
  const [height, setHeight] = useState('');
  const [bodyType, setBodyType] = useState<BodyType | null>(null);
  const [birthday, setBirthday] = useState('');
  const [occupation, setOccupation] = useState('');
  const [nationality, setNationality] = useState('');
  const [residence, setResidence] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setNickname('');
    setHeight('');
    setBodyType(null);
    setBirthday('');
    setOccupation('');
    setNationality('');
    setResidence('');
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      Alert.alert('エラー', 'ニックネームを入力してください');
      return;
    }

    setSubmitting(true);
    try {
      const data: Omit<GirlInsert, 'userId'> = {
        sourceSessionId: sessionId,
        sourceType,
        nickname: nickname.trim(),
        height: height ? parseInt(height, 10) : null,
        bodyType,
        birthday: birthday || null,
        occupation: occupation || null,
        nationality: nationality || null,
        residence: residence || null,
        notes: notes || null,
      };

      const girl = await createGirl(data);
      if (girl) {
        reset();
        onRegistered();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          {allowSkip ? (
            <TouchableOpacity onPress={handleSkip}>
              <Text style={styles.skipBtn}>スキップ</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelBtn}>キャンセル</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.title}>
            {sourceType === 'get_contact' ? 'バンゲ' : '即'} を登録
          </Text>
          <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
            <Text style={[styles.saveBtn, submitting && styles.saveBtnDisabled]}>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <Text style={styles.required}>* 必須</Text>

          <Text style={styles.label}>ニックネーム *</Text>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
            placeholder="例: 渋谷のギャル"
            autoFocus
          />

          <Text style={styles.sectionHeader}>外見（任意）</Text>

          <Text style={styles.label}>身長 (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="例: 160"
            keyboardType="numeric"
          />

          <Text style={styles.label}>体型</Text>
          <View style={styles.bodyTypeRow}>
            {BODY_TYPES.map(({ value, label }) => (
              <TouchableOpacity
                key={value}
                style={[styles.bodyTypeBtn, bodyType === value && styles.bodyTypeBtnActive]}
                onPress={() => setBodyType(bodyType === value ? null : value)}
              >
                <Text style={[styles.bodyTypeBtnText, bodyType === value && styles.bodyTypeBtnTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionHeader}>基本情報（任意）</Text>

          <Text style={styles.label}>生年月日</Text>
          <TextInput
            style={styles.input}
            value={birthday}
            onChangeText={setBirthday}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>職業</Text>
          <TextInput
            style={styles.input}
            value={occupation}
            onChangeText={setOccupation}
            placeholder="例: 大学生、OL"
          />

          <Text style={styles.label}>国籍</Text>
          <TextInput
            style={styles.input}
            value={nationality}
            onChangeText={setNationality}
            placeholder="例: 日本"
          />

          <Text style={styles.label}>居住地</Text>
          <TextInput
            style={styles.input}
            value={residence}
            onChangeText={setResidence}
            placeholder="例: 渋谷区"
          />

          <Text style={styles.label}>メモ</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="メモを入力"
            multiline
            numberOfLines={4}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  skipBtn: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  cancelBtn: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveBtn: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '600',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  form: {
    padding: 16,
  },
  required: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 20,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  bodyTypeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  bodyTypeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bodyTypeBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  bodyTypeBtnText: {
    fontSize: 14,
    color: '#374151',
  },
  bodyTypeBtnTextActive: {
    color: '#FFFFFF',
  },
});

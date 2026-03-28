import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Modal, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { ApoInsert } from '@/src/types/grm';
import { useGRM } from '@/contexts/GRMContext';

interface Props {
  girlId: string;
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export function AddApoForm({ girlId, visible, onClose, onAdded }: Props) {
  const { addApo } = useGRM();
  const [apoDate, setApoDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [spent, setSpent] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!apoDate) {
      Alert.alert('エラー', '日付を入力してください');
      return;
    }

    setSubmitting(true);
    try {
      const apo = await addApo({
        girlId,
        apoDate,
        location: location || null,
        spent: spent ? parseInt(spent, 10) : 0,
        notes: notes || null,
      });

      if (apo) {
        setApoDate(new Date().toISOString().split('T')[0]);
        setLocation('');
        setSpent('');
        setNotes('');
        onAdded();
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelBtn}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.title}>アポを追加</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
            <Text style={[styles.saveBtn, submitting && styles.saveBtnDisabled]}>保存</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form}>
          <Text style={styles.label}>日付 *</Text>
          <TextInput
            style={styles.input}
            value={apoDate}
            onChangeText={setApoDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>場所</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="例: 渋谷、新宿"
          />

          <Text style={styles.label}>使用金額 (円)</Text>
          <TextInput
            style={styles.input}
            value={spent}
            onChangeText={setSpent}
            placeholder="0"
            keyboardType="numeric"
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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
    marginTop: 16,
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
});

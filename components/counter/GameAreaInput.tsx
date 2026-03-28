import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';

interface GameAreaInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

export default function GameAreaInput({ value, onChangeText }: GameAreaInputProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{t('home.gameArea.label')}</ThemedText>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={t('home.gameArea.placeholder')}
        placeholderTextColor="#6B7280"
        maxLength={100}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#C09E5C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#36454F',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    backgroundColor: '#0A0F23',
    fontSize: 14,
  },
});

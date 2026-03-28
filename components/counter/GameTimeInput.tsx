import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';

interface GameTimeInputProps {
  value: string | null;
  onChange: (time: string | null) => void;
}

const PRESETS = [
  { labelKey: 'home.gameTime.presets.morning', time: '10:00:00' },
  { labelKey: 'home.gameTime.presets.noon',    time: '13:00:00' },
  { labelKey: 'home.gameTime.presets.evening', time: '17:00:00' },
  { labelKey: 'home.gameTime.presets.night',   time: '20:00:00' },
];

export default function GameTimeInput({ value, onChange }: GameTimeInputProps) {
  const { t } = useTranslation();

  const handlePress = (time: string) => {
    // 同じプリセットを再度押したら解除
    onChange(value === time ? null : time);
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{t('home.gameTime.label')}</ThemedText>
      <View style={styles.presets}>
        {PRESETS.map(preset => (
          <TouchableOpacity
            key={preset.time}
            style={[styles.presetButton, value === preset.time && styles.presetButtonActive]}
            onPress={() => handlePress(preset.time)}
          >
            <ThemedText
              style={[styles.presetText, value === preset.time && styles.presetTextActive]}
            >
              {t(preset.labelKey)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
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
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#36454F',
    backgroundColor: '#0A0F23',
  },
  presetButtonActive: {
    backgroundColor: '#C09E5C',
    borderColor: '#C09E5C',
  },
  presetText: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  presetTextActive: {
    color: '#0A0F23',
    fontWeight: 'bold',
  },
});

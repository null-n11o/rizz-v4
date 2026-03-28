import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import GameTimeInput from '../../counter/GameTimeInput';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const PRESETS = [
  { labelKey: 'home.gameTime.presets.morning', time: '10:00:00' },
  { labelKey: 'home.gameTime.presets.noon', time: '13:00:00' },
  { labelKey: 'home.gameTime.presets.evening', time: '17:00:00' },
  { labelKey: 'home.gameTime.presets.night', time: '20:00:00' },
];

describe('GameTimeInput', () => {
  it('renders label', () => {
    const { getByText } = render(
      <GameTimeInput value={null} onChange={jest.fn()} />
    );
    expect(getByText('home.gameTime.label')).toBeTruthy();
  });

  it('renders all presets', () => {
    const { getByText } = render(
      <GameTimeInput value={null} onChange={jest.fn()} />
    );

    PRESETS.forEach(p => {
      expect(getByText(p.labelKey)).toBeTruthy();
    });
  });

  it('calls onChange with correct time when preset is pressed', () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <GameTimeInput value={null} onChange={mockOnChange} />
    );

    fireEvent.press(getByText('home.gameTime.presets.morning'));
    expect(mockOnChange).toHaveBeenCalledWith('10:00:00');
  });

  it('highlights selected preset', () => {
    const { getByText } = render(
      <GameTimeInput value="13:00:00" onChange={jest.fn()} />
    );
    // 昼 is selected (13:00:00)
    const noonBtn = getByText('home.gameTime.presets.noon');
    expect(noonBtn).toBeTruthy();
  });

  it('calls onChange with null when same preset is pressed again (deselect)', () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <GameTimeInput value="10:00:00" onChange={mockOnChange} />
    );

    fireEvent.press(getByText('home.gameTime.presets.morning'));
    expect(mockOnChange).toHaveBeenCalledWith(null);
  });
});

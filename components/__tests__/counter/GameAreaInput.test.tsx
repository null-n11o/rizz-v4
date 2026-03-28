import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import GameAreaInput from '../../counter/GameAreaInput';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.useFakeTimers();

describe('GameAreaInput', () => {
  it('renders with initial value', () => {
    const { getByDisplayValue } = render(
      <GameAreaInput value="渋谷" onChangeText={jest.fn()} />
    );
    expect(getByDisplayValue('渋谷')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChange = jest.fn();
    const { getByPlaceholderText } = render(
      <GameAreaInput value="" onChangeText={mockOnChange} />
    );

    fireEvent.changeText(getByPlaceholderText('home.gameArea.placeholder'), '新宿');
    expect(mockOnChange).toHaveBeenCalledWith('新宿');
  });

  it('enforces 100 character max length', () => {
    const { getByPlaceholderText } = render(
      <GameAreaInput value="" onChangeText={jest.fn()} />
    );
    const input = getByPlaceholderText('home.gameArea.placeholder');
    expect(input.props.maxLength).toBe(100);
  });

  it('shows label', () => {
    const { getByText } = render(
      <GameAreaInput value="" onChangeText={jest.fn()} />
    );
    expect(getByText('home.gameArea.label')).toBeTruthy();
  });
});

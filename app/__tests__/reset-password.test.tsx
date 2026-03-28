import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResetPasswordScreen from '../(auth)/reset-password';

const mockUpdateUser = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: (...args: any[]) => mockUpdateUser(...args),
    },
  },
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: () => ({}),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ResetPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders new password input', () => {
    const { getByPlaceholderText } = render(<ResetPasswordScreen />);
    expect(getByPlaceholderText('auth.resetPassword.newPasswordPlaceholder')).toBeTruthy();
  });

  it('renders confirm password input', () => {
    const { getByPlaceholderText } = render(<ResetPasswordScreen />);
    expect(getByPlaceholderText('auth.resetPassword.confirmPasswordPlaceholder')).toBeTruthy();
  });

  it('shows validation error when passwords do not match', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPasswordScreen />);

    fireEvent.changeText(
      getByPlaceholderText('auth.resetPassword.newPasswordPlaceholder'),
      'Password1!'
    );
    fireEvent.changeText(
      getByPlaceholderText('auth.resetPassword.confirmPasswordPlaceholder'),
      'Password2!'
    );
    fireEvent.press(getByText('auth.resetPassword.submitButton'));

    await waitFor(() => {
      expect(getByText('auth.validation.passwordMismatch')).toBeTruthy();
    });
  });

  it('shows validation error when password is too short', async () => {
    const { getByPlaceholderText, getByText } = render(<ResetPasswordScreen />);

    fireEvent.changeText(
      getByPlaceholderText('auth.resetPassword.newPasswordPlaceholder'),
      'short'
    );
    fireEvent.changeText(
      getByPlaceholderText('auth.resetPassword.confirmPasswordPlaceholder'),
      'short'
    );
    fireEvent.press(getByText('auth.resetPassword.submitButton'));

    await waitFor(() => {
      expect(getByText('auth.validation.passwordMinLength')).toBeTruthy();
    });
  });

  it('calls updateUser on valid submit', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    const { getByPlaceholderText, getByText } = render(<ResetPasswordScreen />);

    fireEvent.changeText(
      getByPlaceholderText('auth.resetPassword.newPasswordPlaceholder'),
      'NewPassword1!'
    );
    fireEvent.changeText(
      getByPlaceholderText('auth.resetPassword.confirmPasswordPlaceholder'),
      'NewPassword1!'
    );
    fireEvent.press(getByText('auth.resetPassword.submitButton'));

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewPassword1!' });
    });
  });

  it('shows success message after password update', async () => {
    mockUpdateUser.mockResolvedValue({ error: null });
    const { getByPlaceholderText, getByText } = render(<ResetPasswordScreen />);

    fireEvent.changeText(
      getByPlaceholderText('auth.resetPassword.newPasswordPlaceholder'),
      'NewPassword1!'
    );
    fireEvent.changeText(
      getByPlaceholderText('auth.resetPassword.confirmPasswordPlaceholder'),
      'NewPassword1!'
    );
    fireEvent.press(getByText('auth.resetPassword.submitButton'));

    await waitFor(() => {
      expect(getByText('auth.resetPassword.successMessage')).toBeTruthy();
    });
  });
});

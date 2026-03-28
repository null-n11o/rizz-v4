import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordScreen from '../(auth)/forgot-password';

const mockResetPassword = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ resetPassword: mockResetPassword }),
}));

jest.mock('expo-router', () => ({
  router: { back: jest.fn(), push: jest.fn() },
  Link: ({ children, ...props }: any) => children,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ForgotPasswordScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email input', () => {
    const { getByPlaceholderText } = render(<ForgotPasswordScreen />);
    expect(getByPlaceholderText('auth.forgotPassword.emailPlaceholder')).toBeTruthy();
  });

  it('shows submit button', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    expect(getByText('auth.forgotPassword.submitButton')).toBeTruthy();
  });

  it('shows validation error when email is empty', async () => {
    const { getByText } = render(<ForgotPasswordScreen />);

    fireEvent.press(getByText('auth.forgotPassword.submitButton'));

    await waitFor(() => {
      expect(getByText('auth.validation.emailRequired')).toBeTruthy();
    });
  });

  it('shows validation error when email is invalid', async () => {
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(
      getByPlaceholderText('auth.forgotPassword.emailPlaceholder'),
      'invalid-email'
    );
    fireEvent.press(getByText('auth.forgotPassword.submitButton'));

    await waitFor(() => {
      expect(getByText('auth.validation.emailInvalid')).toBeTruthy();
    });
  });

  it('calls resetPassword with email on valid submit', async () => {
    mockResetPassword.mockResolvedValue({ error: null });
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(
      getByPlaceholderText('auth.forgotPassword.emailPlaceholder'),
      'test@example.com'
    );
    fireEvent.press(getByText('auth.forgotPassword.submitButton'));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows success message after submission', async () => {
    mockResetPassword.mockResolvedValue({ error: null });
    const { getByPlaceholderText, getByText } = render(<ForgotPasswordScreen />);

    fireEvent.changeText(
      getByPlaceholderText('auth.forgotPassword.emailPlaceholder'),
      'test@example.com'
    );
    fireEvent.press(getByText('auth.forgotPassword.submitButton'));

    await waitFor(() => {
      expect(getByText('auth.forgotPassword.successMessage')).toBeTruthy();
    });
  });

  it('shows back to login link', () => {
    const { getByText } = render(<ForgotPasswordScreen />);
    expect(getByText('auth.forgotPassword.backToLogin')).toBeTruthy();
  });
});

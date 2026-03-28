import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { router } from 'expo-router';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import FormLayout from '../../components/auth/FormLayout';
import FormInput from '../../components/auth/FormInput';
import FormButton from '../../components/auth/FormButton';
import { supabase } from '@/lib/supabase';

interface FormValues {
  newPassword: string;
  confirmPassword: string;
}

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(8, t('auth.validation.passwordMinLength'))
      .required(t('auth.validation.passwordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword')], t('auth.validation.passwordMismatch'))
      .required(t('auth.validation.confirmPasswordRequired')),
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.newPassword });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSubmitted(true);
        setTimeout(() => router.replace('/(auth)/login'), 2000);
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? t('error_occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <FormLayout title={t('auth.resetPassword.title')}>
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            {t('auth.resetPassword.successMessage')}
          </Text>
        </View>
      </FormLayout>
    );
  }

  return (
    <FormLayout title={t('auth.resetPassword.title')}>
      <Formik
        initialValues={{ newPassword: '', confirmPassword: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit: formikSubmit, values, errors, touched }) => (
          <View>
            {errorMsg && (
              <Text style={styles.errorText}>{errorMsg}</Text>
            )}
            <FormInput
              label={t('auth.resetPassword.newPasswordLabel')}
              placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
              value={values.newPassword}
              onChangeText={handleChange('newPassword')}
              onBlur={handleBlur('newPassword')}
              error={errors.newPassword}
              touched={touched.newPassword}
              secureTextEntry
            />
            <FormInput
              label={t('auth.resetPassword.confirmPasswordLabel')}
              placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
              value={values.confirmPassword}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              secureTextEntry
            />
            <FormButton
              onPress={formikSubmit}
              title={t('auth.resetPassword.submitButton')}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        )}
      </Formik>
    </FormLayout>
  );
}

const styles = StyleSheet.create({
  successContainer: {
    padding: 16,
    alignItems: 'center',
  },
  successText: {
    color: '#C09E5C',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
});

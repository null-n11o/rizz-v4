import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { router } from 'expo-router';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import FormLayout from '../../components/auth/FormLayout';
import FormInput from '../../components/auth/FormInput';
import FormButton from '../../components/auth/FormButton';
import { useAuth } from '../../contexts/AuthContext';

interface FormValues {
  email: string;
}

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('auth.validation.emailInvalid'))
      .required(t('auth.validation.emailRequired')),
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(values.email);
      if (error) {
        Alert.alert(t('error'), error.message);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      Alert.alert(t('error'), err?.message ?? t('error_occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  const footer = (
    <View style={styles.footer}>
      <Text style={styles.linkText} onPress={() => router.back()}>
        {t('auth.forgotPassword.backToLogin')}
      </Text>
    </View>
  );

  if (submitted) {
    return (
      <FormLayout
        title={t('auth.forgotPassword.title')}
        footer={footer}
      >
        <View style={styles.successContainer}>
          <Text style={styles.successText}>
            {t('auth.forgotPassword.successMessage')}
          </Text>
        </View>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title={t('auth.forgotPassword.title')}
      subtitle={t('auth.forgotPassword.description')}
      footer={footer}
    >
      <Formik
        initialValues={{ email: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit: formikSubmit, values, errors, touched }) => (
          <View>
            <FormInput
              label={t('email')}
              placeholder={t('auth.forgotPassword.emailPlaceholder')}
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={errors.email}
              touched={touched.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormButton
              onPress={formikSubmit}
              title={t('auth.forgotPassword.submitButton')}
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
  footer: {
    alignItems: 'center',
    padding: 16,
  },
  linkText: {
    color: '#C09E5C',
    fontSize: 14,
  },
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
});

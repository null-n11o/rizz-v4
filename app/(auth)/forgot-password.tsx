
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Link, router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('無効なメールアドレスです').required('メールアドレスを入力してください'),
});

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (values: { email: string }) => {
    setLoading(true);
    try {
      const { error } = await resetPassword(values.email);
      if (error) {
        Alert.alert('エラー', error.message);
      } else {
        Alert.alert('確認メールを送信しました', '受信トレイを確認し、パスワードを再設定してください。');
        router.push('/(auth)/login');
      }
    } catch (err) {
      Alert.alert('エラー', '予期せぬエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>パスワードを忘れた場合</ThemedText>
      <ThemedText style={styles.subtitle}>
        登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
      </ThemedText>
      <Formik
        initialValues={{ email: '' }}
        validationSchema={ForgotPasswordSchema}
        onSubmit={handlePasswordReset}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.formContainer}>
            <TextInput
              label="メールアドレス"
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            {errors.email && touched.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={() => handleSubmit()}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              再設定リンクを送信
            </Button>
          </View>
        )}
      </Formik>
      <Link href="/(auth)/login" style={styles.link}>
        <ThemedText>ログイン画面に戻る</ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
  },
});

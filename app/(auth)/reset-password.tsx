
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useLocalSearchParams, router } from 'expo-router';
// import { supabase } from '@/lib/supabase'; // supabaseのインポートを一時的にコメントアウト
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .required('パスワードを入力してください'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), undefined], 'パスワードが一致しません')
    .required('パスワードを再入力してください'),
});

export default function ResetPasswordScreen() {
  const { access_token, refresh_token } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('reset-password: Component mounted.');
    console.log('reset-password: access_token:', access_token);
    console.log('reset-password: refresh_token:', refresh_token);

    // supabase.auth.setSession の呼び出しを一時的にコメントアウト
    // if (access_token && refresh_token) {
    //   console.log('reset-password: Attempting to set session...');
    //   supabase.auth.setSession({
    //     access_token: access_token as string,
    //     refresh_token: refresh_token as string,
    //   }).then(() => {
    //     console.log('reset-password: Session set successfully.');
    //     supabase.auth.getSession().then(({ data }) => {
    //       console.log('reset-password: Current session after setSession:', data.session);
    //     });
    //   }).catch(err => {
    //     console.error('reset-password: Error setting session:', err);
    //   });
    // } else {
    //   console.log('reset-password: No access_token or refresh_token found in params.');
    // }
  }, [access_token, refresh_token]);

  const handlePasswordReset = async (values: { password: any; }) => {
    // この関数は実行されないようにします
    Alert.alert('デバッグモード', 'パスワード更新機能は現在デバッグのため無効です。');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>新しいパスワードを設定</ThemedText>

      {/* デバッグ情報 */}
      <ThemedText style={styles.debugText}>Access Token: {access_token ? access_token.substring(0, 10) + '...' : 'N/A'}</ThemedText>
      <ThemedText style={styles.debugText}>Refresh Token: {refresh_token ? refresh_token.substring(0, 10) + '...' : 'N/A'}</ThemedText>
      {/* デバッグ情報ここまで */}

      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        validationSchema={ResetPasswordSchema}
        onSubmit={handlePasswordReset}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.formContainer}>
            <TextInput
              label="新しいパスワード"
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
              style={styles.input}
            />
            {errors.password && touched.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
            <TextInput
              label="新しいパスワード（確認）"
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              value={values.confirmPassword}
              secureTextEntry
              style={styles.input}
            />
            {errors.confirmPassword && touched.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}

            <Button
              mode="contained"
              onPress={() => handleSubmit()}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              パスワードを更新
            </Button>
          </View>
        )}
      </Formik>
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
  debugText: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 5,
    textAlign: 'center',
  },
});

import { supabase } from '@/lib/supabase';
import { Profile, ProfileUpdateData } from '../types/profile';

// プロフィール情報を取得
export const getProfile = async (): Promise<{ data: Profile | null; error: Error | null }> => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user || !user.user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    // user_idでプロフィールを検索
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      // プロフィールが見つからない場合、IDでも試す
      const { data: profileById, error: idError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.user.id)
        .single();

      if (idError) {
        return { data: null, error: idError };
      }

      return { data: profileById as Profile, error: null };
    }

    return { data: data as Profile, error: null };
  } catch (error) {
    console.error('プロフィール取得エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

// プロフィール情報を更新
export const updateProfile = async (profileData: ProfileUpdateData): Promise<{ data: Profile | null; error: Error | null }> => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user || !user.user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    // まずプロフィールを取得
    const { data: profile, error: profileError } = await getProfile();

    if (profileError || !profile) {
      return { data: null, error: profileError || new Error('プロフィールが見つかりません') };
    }

    // プロフィールを更新
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      return { data: null, error };
    }

    return { data: data as Profile, error: null };
  } catch (error) {
    console.error('プロフィール更新エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

// パスワード変更
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ data: null; error: Error | null }> => {
  try {
    const { data: user } = await supabase.auth.getUser();

    if (!user || !user.user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.user.email!,
      password: currentPassword,
    });

    if (signInError) {
      return { data: null, error: new Error('現在のパスワードが正しくありません') };
    }

    // パスワードを変更
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('パスワード変更エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
};

// テーマ設定を更新
export const updateTheme = async (theme: 'light' | 'dark'): Promise<{ data: Profile | null; error: Error | null }> => {
  return updateProfile({ theme_preference: theme });
};

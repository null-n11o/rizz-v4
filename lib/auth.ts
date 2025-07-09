import { getSupabaseClient } from './supabase';

/**
 * ユーザーをメールアドレスとパスワードで登録
 */
export async function signUp(email: string, password: string, name: string) {
  const supabase = getSupabaseClient();
  try {
    // サインアップ時にメール認証をスキップするためのオプション
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
        // メール確認をスキップする（開発環境用）
        emailRedirectTo: undefined
      },
    });

    if (error) throw error;

    // ユーザープロフィールをデータベースに保存
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              email,
              theme_preference: 'dark', // ダークモードをデフォルトに設定
            },
          ]);

        if (profileError) {
          console.warn('プロフィール保存エラー:', profileError);
          // プロフィール保存エラーは無視して続行
        }
      } catch (profileErr) {
        console.warn('プロフィール保存例外:', profileErr);
        // プロフィール保存例外は無視して続行
      }
    }
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    return { user: null, session: null, error };
  }
}

/**
 * ユーザーをメールアドレスとパスワードでログイン
 */
export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('ログインエラー:', errorMessage);
    return { user: null, session: null, error };
  }
}

/**
 * ユーザーをサインアウト
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * 現在のセッション情報を取得
 */
export async function getSession() {
  const supabase = getSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return { session: data.session, error: null };
  } catch (error) {
    return { session: null, error };
  }
}

/**
 * パスワードリセットメールを送信
 */
export async function resetPassword(email: string): Promise<{ error: Error | null }> {
  const supabase = getSupabaseClient();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: undefined,
    });
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error instanceof Error ? error : new Error(String(error)) };
  }
}

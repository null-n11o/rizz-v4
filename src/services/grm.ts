import { supabase } from '@/lib/supabase';
import { Girl, GirlInsert, GirlUpdate, GRMStatus } from '@/src/types/grm';

// Supabase行データをGirl型に変換
function rowToGirl(row: any): Girl {
  return {
    id: row.id,
    userId: row.user_id,
    sourceSessionId: row.source_session_id,
    sourceType: row.source_type,
    nickname: row.nickname,
    birthday: row.birthday,
    nationality: row.nationality,
    occupation: row.occupation,
    residence: row.residence,
    height: row.height,
    bodyType: row.body_type,
    status: row.status,
    apoCount: row.apo_count,
    totalSpent: row.total_spent,
    rating: row.rating,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 女性を新規登録する
 */
export const createGirl = async (
  data: Omit<GirlInsert, 'userId'>
): Promise<{ data: Girl | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { data: row, error } = await supabase
      .from('girls')
      .insert({
        user_id: user.id,
        source_session_id: data.sourceSessionId ?? null,
        source_type: data.sourceType,
        nickname: data.nickname,
        birthday: data.birthday ?? null,
        nationality: data.nationality ?? null,
        occupation: data.occupation ?? null,
        residence: data.residence ?? null,
        height: data.height ?? null,
        body_type: data.bodyType ?? null,
        rating: data.rating ?? null,
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: rowToGirl(row), error: null };
  } catch (error: any) {
    console.error('女性登録エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * 女性情報を更新する
 */
export const updateGirl = async (
  id: string,
  data: GirlUpdate
): Promise<{ data: Girl | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (data.nickname !== undefined) updateData.nickname = data.nickname;
    if (data.birthday !== undefined) updateData.birthday = data.birthday;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.occupation !== undefined) updateData.occupation = data.occupation;
    if (data.residence !== undefined) updateData.residence = data.residence;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.bodyType !== undefined) updateData.body_type = data.bodyType;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: row, error } = await supabase
      .from('girls')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data: rowToGirl(row), error: null };
  } catch (error: any) {
    console.error('女性情報更新エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * 全女性一覧を取得する
 */
export const getGirls = async (): Promise<{ data: Girl[] | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { data: rows, error } = await supabase
      .from('girls')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data: (rows || []).map(rowToGirl), error: null };
  } catch (error: any) {
    console.error('女性一覧取得エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * ステータスで絞り込んで女性一覧を取得する
 */
export const getGirlsByStatus = async (
  status: GRMStatus
): Promise<{ data: Girl[] | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { data: rows, error } = await supabase
      .from('girls')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data: (rows || []).map(rowToGirl), error: null };
  } catch (error: any) {
    console.error('女性ステータス絞り込み取得エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * 特定の女性の詳細を取得する
 */
export const getGirl = async (
  id: string
): Promise<{ data: Girl | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { data: row, error } = await supabase
      .from('girls')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { data: null, error: null };
      throw error;
    }
    return { data: rowToGirl(row), error: null };
  } catch (error: any) {
    console.error('女性詳細取得エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * ステータスを手動変更する（sex / ltr / graduate）
 */
export const updateGirlStatus = async (
  id: string,
  status: GRMStatus
): Promise<{ data: Girl | null; error: Error | null }> => {
  return updateGirl(id, { status });
};

/**
 * 女性を削除する
 */
export const deleteGirl = async (
  id: string
): Promise<{ error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('ユーザーが認証されていません') };
    }

    const { error } = await supabase
      .from('girls')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('女性削除エラー:', error);
    return { error: error instanceof Error ? error : new Error(error.message) };
  }
};

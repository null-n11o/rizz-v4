import { supabase } from '@/lib/supabase';
import { Apo, ApoInsert } from '@/src/types/grm';

// Supabase行データをApo型に変換
function rowToApo(row: any): Apo {
  return {
    id: row.id,
    userId: row.user_id,
    girlId: row.girl_id,
    apoNumber: row.apo_number,
    apoDate: row.apo_date,
    location: row.location,
    spent: row.spent,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

/**
 * アポを追加する（apo_numberはDBトリガーで自動採番）
 */
export const createApo = async (
  data: Omit<ApoInsert, 'userId'>
): Promise<{ data: Apo | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { data: row, error } = await supabase
      .from('apos')
      .insert({
        user_id: user.id,
        girl_id: data.girlId,
        apo_date: data.apoDate,
        location: data.location ?? null,
        spent: data.spent ?? 0,
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: rowToApo(row), error: null };
  } catch (error: any) {
    console.error('アポ追加エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * 特定の女性のアポ履歴を取得する
 */
export const getAposByGirl = async (
  girlId: string
): Promise<{ data: Apo[] | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { data: rows, error } = await supabase
      .from('apos')
      .select('*')
      .eq('user_id', user.id)
      .eq('girl_id', girlId)
      .order('apo_number', { ascending: true });

    if (error) throw error;
    return { data: (rows || []).map(rowToApo), error: null };
  } catch (error: any) {
    console.error('アポ履歴取得エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * アポを更新する
 */
export const updateApo = async (
  id: string,
  data: { apoDate?: string; location?: string | null; spent?: number; notes?: string | null }
): Promise<{ data: Apo | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const updateData: any = {};
    if (data.apoDate !== undefined) updateData.apo_date = data.apoDate;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.spent !== undefined) updateData.spent = data.spent;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const { data: row, error } = await supabase
      .from('apos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data: rowToApo(row), error: null };
  } catch (error: any) {
    console.error('アポ更新エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * アポを削除する（DBトリガーが girls.apo_count / total_spent を自動更新）
 */
export const deleteApo = async (
  id: string
): Promise<{ error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('ユーザーが認証されていません') };
    }

    const { error } = await supabase
      .from('apos')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('アポ削除エラー:', error);
    return { error: error instanceof Error ? error : new Error(error.message) };
  }
};

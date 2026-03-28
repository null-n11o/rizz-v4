import { supabase } from '@/lib/supabase';
import { Session, SessionInsert, SessionUpdate } from '@/src/types/session';

// Supabase行データをSession型に変換
function rowToSession(row: any): Session {
  return {
    id: row.id,
    userId: row.user_id,
    sessionDate: row.session_date,
    startTime: row.start_time,
    location: row.location,
    approached: row.approached,
    getContact: row.get_contact,
    instantDate: row.instant_date,
    instantCv: row.instant_cv,
    notes: row.notes,
    isFinalized: row.is_finalized,
    migratedFromRecordId: row.migrated_from_record_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 新しいセッションを作成する
 */
export const createSession = async (
  data: Omit<SessionInsert, 'userId'>
): Promise<{ data: Session | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { data: row, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        session_date: data.sessionDate,
        start_time: data.startTime ?? null,
        location: data.location ?? null,
        approached: data.approached ?? 0,
        get_contact: data.getContact ?? 0,
        instant_date: data.instantDate ?? 0,
        instant_cv: data.instantCv ?? 0,
        notes: data.notes ?? null,
        is_finalized: false,
      })
      .select()
      .single();

    if (error) throw error;
    return { data: rowToSession(row), error: null };
  } catch (error: any) {
    console.error('セッション作成エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * セッションを更新する
 */
export const updateSession = async (
  id: string,
  data: SessionUpdate
): Promise<{ data: Session | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (data.startTime !== undefined) updateData.start_time = data.startTime;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.approached !== undefined) updateData.approached = data.approached;
    if (data.getContact !== undefined) updateData.get_contact = data.getContact;
    if (data.instantDate !== undefined) updateData.instant_date = data.instantDate;
    if (data.instantCv !== undefined) updateData.instant_cv = data.instantCv;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.isFinalized !== undefined) updateData.is_finalized = data.isFinalized;

    const { data: row, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data: rowToSession(row), error: null };
  } catch (error: any) {
    console.error('セッション更新エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * 特定日のセッション一覧を取得する
 */
export const getSessionsByDate = async (
  date: string
): Promise<{ data: Session[] | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { data: rows, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('session_date', date)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data: (rows || []).map(rowToSession), error: null };
  } catch (error: any) {
    console.error('セッション取得エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * 期間指定でセッション一覧を取得する
 */
export const getSessionsByRange = async (
  startDate: string,
  endDate: string
): Promise<{ data: Session[] | null; error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('ユーザーが認証されていません') };
    }

    const { data: rows, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .gte('session_date', startDate)
      .lte('session_date', endDate)
      .order('session_date', { ascending: true });

    if (error) throw error;
    return { data: (rows || []).map(rowToSession), error: null };
  } catch (error: any) {
    console.error('セッション期間取得エラー:', error);
    return { data: null, error: error instanceof Error ? error : new Error(error.message) };
  }
};

/**
 * セッションを確定する
 */
export const finalizeSession = async (
  id: string
): Promise<{ data: Session | null; error: Error | null }> => {
  return updateSession(id, { isFinalized: true });
};

/**
 * セッションを削除する
 */
export const deleteSession = async (
  id: string
): Promise<{ error: Error | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: new Error('ユーザーが認証されていません') };
    }

    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    console.error('セッション削除エラー:', error);
    return { error: error instanceof Error ? error : new Error(error.message) };
  }
};

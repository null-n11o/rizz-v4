import { supabase } from '@/lib/supabase';
import { PeriodType } from '../types/goal';

// 目標データのインターフェース
export interface GoalData {
  id?: string;
  user_id: string;
  approached_target: number;
  get_contacts_target: number;
  instant_dates_target: number;
  instant_cv_target: number;
  period_type: PeriodType;
  created_at?: string;
  updated_at?: string;
}

// 単一の目標を取得
export const getGoal = async (userId: string, period: PeriodType) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('period_type', period)
      .single();

    return { data, error };
  } catch (err) {
    console.error('getGoalエラー:', err);
    return { data: null, error: err };
  }
};

// 全期間の目標を取得
export const getAllGoals = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId);

    return { data, error };
  } catch (err) {
    console.error('getAllGoalsエラー:', err);
    return { data: null, error: err };
  }
};

// 目標を作成または更新
export const upsertGoal = async (goalData: GoalData) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .upsert(goalData, {
        onConflict: 'user_id,period_type',
        ignoreDuplicates: false
      })
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error('upsertGoalエラー:', err);
    return { data: null, error: err };
  }
};

// 目標を削除
export const deleteGoal = async (goalId: string) => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    return { error };
  } catch (err) {
    console.error('deleteGoalエラー:', err);
    return { error: err };
  }
};

// エラータイプの定義
export enum GoalErrorType {
  NETWORK_ERROR = 'network_error',
  AUTH_ERROR = 'auth_error',
  DATA_ERROR = 'data_error',
  UNKNOWN_ERROR = 'unknown_error',
}

// エラーハンドリング関数
export const handleGoalError = (error: any): { type: GoalErrorType; message: string } => {
  if (error?.status === 401 || error?.status === 403) {
    return {
      type: GoalErrorType.AUTH_ERROR,
      message: '認証エラーが発生しました。再ログインしてください。',
    };
  }

  if (error?.code === 'PGRST116') {
    return {
      type: GoalErrorType.DATA_ERROR,
      message: '目標データが見つかりません。',
    };
  }

  return {
    type: GoalErrorType.UNKNOWN_ERROR,
    message: 'エラーが発生しました。しばらく経ってからお試しください。',
  };
};

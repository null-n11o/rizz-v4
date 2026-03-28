import { supabase } from '@/lib/supabase';
import { getISOWeek, getYear } from 'date-fns';

export type StatsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DailyStats {
  game_date: string;
  approached: number;
  get_contact: number;
  instant_date: number;
  instant_cv: number;
  contact_rate: number;
  cv_rate: number;
}

export interface PeriodStats {
  label: string;
  approached: number;
  get_contact: number;
  instant_date: number;
  instant_cv: number;
  contact_rate: number;
  cv_rate: number;
}

interface RawRecord {
  game_date: string;
  approached: number;
  get_contact: number;
  instant_date: number;
  instant_cv: number;
}

function calcRates(approached: number, get_contact: number, instant_cv: number) {
  if (approached === 0) return { contact_rate: 0, cv_rate: 0 };
  return {
    contact_rate: Math.round((get_contact / approached) * 1000) / 10,
    cv_rate: Math.round((instant_cv / approached) * 1000) / 10,
  };
}

async function fetchRecords(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<RawRecord[]> {
  const { data, error } = await supabase
    .from('daily_records')
    .select('game_date, approached, get_contact, instant_date, instant_cv')
    .eq('user_id', userId)
    .gte('game_date', startDate)
    .lte('game_date', endDate)
    .order('game_date', { ascending: true });

  if (error || !data) return [];
  return data as RawRecord[];
}

// 日次統計（指定月の全日分）
export async function getDailyStats(
  userId: string,
  year: number,
  month: number,
): Promise<DailyStats[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const records = await fetchRecords(userId, start, end);

  return records.map(r => ({
    game_date: r.game_date,
    approached: r.approached,
    get_contact: r.get_contact,
    instant_date: r.instant_date,
    instant_cv: r.instant_cv,
    ...calcRates(r.approached, r.get_contact, r.instant_cv),
  }));
}

// 週次統計（指定年の全週分）
export async function getWeeklyStats(
  userId: string,
  year: number,
): Promise<PeriodStats[]> {
  const records = await fetchRecords(userId, `${year}-01-01`, `${year}-12-31`);
  if (records.length === 0) return [];

  const weekMap = new Map<string, { approached: number; get_contact: number; instant_date: number; instant_cv: number }>();

  for (const r of records) {
    const date = new Date(r.game_date);
    const isoYear = getYear(date);
    const isoWeek = getISOWeek(date);
    const key = `${isoYear}-W${String(isoWeek).padStart(2, '0')}`;
    const existing = weekMap.get(key) ?? { approached: 0, get_contact: 0, instant_date: 0, instant_cv: 0 };
    weekMap.set(key, {
      approached: existing.approached + r.approached,
      get_contact: existing.get_contact + r.get_contact,
      instant_date: existing.instant_date + r.instant_date,
      instant_cv: existing.instant_cv + r.instant_cv,
    });
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, v]) => ({
      label: key,
      ...v,
      ...calcRates(v.approached, v.get_contact, v.instant_cv),
    }));
}

// 月次統計（指定年の全月分）
export async function getMonthlyStats(
  userId: string,
  year: number,
): Promise<PeriodStats[]> {
  const records = await fetchRecords(userId, `${year}-01-01`, `${year}-12-31`);
  if (records.length === 0) return [];

  const monthMap = new Map<number, { approached: number; get_contact: number; instant_date: number; instant_cv: number }>();

  for (const r of records) {
    const month = parseInt(r.game_date.slice(5, 7), 10);
    const existing = monthMap.get(month) ?? { approached: 0, get_contact: 0, instant_date: 0, instant_cv: 0 };
    monthMap.set(month, {
      approached: existing.approached + r.approached,
      get_contact: existing.get_contact + r.get_contact,
      instant_date: existing.instant_date + r.instant_date,
      instant_cv: existing.instant_cv + r.instant_cv,
    });
  }

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([month, v]) => ({
      label: `${month}月`,
      ...v,
      ...calcRates(v.approached, v.get_contact, v.instant_cv),
    }));
}

// 年次統計（全年分）
export async function getYearlyStats(userId: string): Promise<PeriodStats[]> {
  const { data, error } = await supabase
    .from('daily_records')
    .select('game_date, approached, get_contact, instant_date, instant_cv')
    .eq('user_id', userId)
    .order('game_date', { ascending: true });

  if (error || !data || data.length === 0) return [];

  const yearMap = new Map<number, { approached: number; get_contact: number; instant_date: number; instant_cv: number }>();

  for (const r of data as RawRecord[]) {
    const year = parseInt(r.game_date.slice(0, 4), 10);
    const existing = yearMap.get(year) ?? { approached: 0, get_contact: 0, instant_date: 0, instant_cv: 0 };
    yearMap.set(year, {
      approached: existing.approached + r.approached,
      get_contact: existing.get_contact + r.get_contact,
      instant_date: existing.instant_date + r.instant_date,
      instant_cv: existing.instant_cv + r.instant_cv,
    });
  }

  return Array.from(yearMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, v]) => ({
      label: `${year}`,
      ...v,
      ...calcRates(v.approached, v.get_contact, v.instant_cv),
    }));
}

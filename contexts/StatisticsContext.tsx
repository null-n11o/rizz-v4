import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PeriodStats, StatsPeriod, getDailyStats, getWeeklyStats, getMonthlyStats, getYearlyStats } from '@/src/services/statistics';
import { useAuth } from './AuthContext';

interface StatisticsContextType {
  period: StatsPeriod;
  setPeriod: (period: StatsPeriod) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  stats: PeriodStats[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

const CACHE_KEY_PREFIX = 'rizz_stats_cache_';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5分

interface CacheEntry {
  data: PeriodStats[];
  timestamp: number;
}

function cacheKey(period: StatsPeriod, year: number, month: number): string {
  return `${CACHE_KEY_PREFIX}${period}_${year}_${month}`;
}

export function StatisticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const now = new Date();
  const [period, setPeriodState] = useState<StatsPeriod>('monthly');
  const [selectedYear, setSelectedYearState] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonthState] = useState(now.getMonth() + 1);
  const [stats, setStats] = useState<PeriodStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (
    p: StatsPeriod,
    year: number,
    month: number,
  ) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    // キャッシュ確認
    const key = cacheKey(p, year, month);
    try {
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
          setStats(entry.data);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // キャッシュ読み取り失敗は無視
    }

    try {
      let data: PeriodStats[] = [];

      switch (p) {
        case 'daily':
          data = await getDailyStats(user.id, year, month) as unknown as PeriodStats[];
          break;
        case 'weekly':
          data = await getWeeklyStats(user.id, year);
          break;
        case 'monthly':
          data = await getMonthlyStats(user.id, year);
          break;
        case 'yearly':
          data = await getYearlyStats(user.id);
          break;
      }

      setStats(data);

      // キャッシュ保存
      try {
        const entry: CacheEntry = { data, timestamp: Date.now() };
        await AsyncStorage.setItem(key, JSON.stringify(entry));
      } catch {
        // キャッシュ保存失敗は無視
      }
    } catch (err: any) {
      setError(err?.message ?? 'データ取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const refresh = useCallback(async () => {
    // キャッシュを無効化してリフレッシュ
    const key = cacheKey(period, selectedYear, selectedMonth);
    try { await AsyncStorage.removeItem(key); } catch { /* ignore */ }
    await fetchStats(period, selectedYear, selectedMonth);
  }, [period, selectedYear, selectedMonth, fetchStats]);

  const setPeriod = useCallback((p: StatsPeriod) => {
    setPeriodState(p);
    fetchStats(p, selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth, fetchStats]);

  const setSelectedYear = useCallback((year: number) => {
    setSelectedYearState(year);
    fetchStats(period, year, selectedMonth);
  }, [period, selectedMonth, fetchStats]);

  const setSelectedMonth = useCallback((month: number) => {
    setSelectedMonthState(month);
    fetchStats(period, selectedYear, month);
  }, [period, selectedYear, fetchStats]);

  // 初回ロード
  useEffect(() => {
    fetchStats(period, selectedYear, selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <StatisticsContext.Provider value={{
      period,
      setPeriod,
      selectedYear,
      setSelectedYear,
      selectedMonth,
      setSelectedMonth,
      stats,
      isLoading,
      error,
      refresh,
    }}>
      {children}
    </StatisticsContext.Provider>
  );
}

export function useStatistics(): StatisticsContextType {
  const context = useContext(StatisticsContext);
  if (!context) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
}

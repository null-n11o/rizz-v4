import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { StatisticsProvider, useStatistics } from '../StatisticsContext';

const mockGetDailyStats = jest.fn();
const mockGetWeeklyStats = jest.fn();
const mockGetMonthlyStats = jest.fn();
const mockGetYearlyStats = jest.fn();

jest.mock('@/src/services/statistics', () => ({
  getDailyStats: (...args: any[]) => mockGetDailyStats(...args),
  getWeeklyStats: (...args: any[]) => mockGetWeeklyStats(...args),
  getMonthlyStats: (...args: any[]) => mockGetMonthlyStats(...args),
  getYearlyStats: (...args: any[]) => mockGetYearlyStats(...args),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-123' } }),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StatisticsProvider>{children}</StatisticsProvider>
);

const sampleStats = [
  { label: '3月', approached: 10, get_contact: 3, instant_date: 1, instant_cv: 0, contact_rate: 30, cv_rate: 0 },
];

describe('StatisticsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMonthlyStats.mockResolvedValue(sampleStats);
    mockGetDailyStats.mockResolvedValue([]);
    mockGetWeeklyStats.mockResolvedValue([]);
    mockGetYearlyStats.mockResolvedValue([]);
  });

  it('初期状態: period は monthly', () => {
    const { result } = renderHook(() => useStatistics(), { wrapper });
    expect(result.current.period).toBe('monthly');
  });

  it('setPeriod で期間を変更できる', async () => {
    mockGetWeeklyStats.mockResolvedValue(sampleStats);
    const { result } = renderHook(() => useStatistics(), { wrapper });

    await act(async () => {
      result.current.setPeriod('weekly');
    });

    expect(result.current.period).toBe('weekly');
  });

  it('期間変更時に統計データを自動フェッチする', async () => {
    mockGetDailyStats.mockResolvedValue(sampleStats);
    const { result } = renderHook(() => useStatistics(), { wrapper });

    await act(async () => {
      result.current.setPeriod('daily');
    });

    expect(mockGetDailyStats).toHaveBeenCalledWith('user-123', expect.any(Number), expect.any(Number));
    expect(result.current.stats).toEqual(sampleStats);
  });

  it('yearly期間でgetYearlyStatsを呼ぶ', async () => {
    mockGetYearlyStats.mockResolvedValue(sampleStats);
    const { result } = renderHook(() => useStatistics(), { wrapper });

    await act(async () => {
      result.current.setPeriod('yearly');
    });

    expect(mockGetYearlyStats).toHaveBeenCalledWith('user-123');
    expect(result.current.stats).toEqual(sampleStats);
  });

  it('isLoading がデータフェッチ中にtrueになる', async () => {
    let resolveStats: (v: any) => void;
    mockGetMonthlyStats.mockReturnValue(new Promise(res => { resolveStats = res; }));

    const { result } = renderHook(() => useStatistics(), { wrapper });

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);

    await act(async () => {
      resolveStats!(sampleStats);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('setSelectedYear で年を変更してリフレッシュ', async () => {
    mockGetMonthlyStats.mockResolvedValue(sampleStats);
    const { result } = renderHook(() => useStatistics(), { wrapper });

    await act(async () => {
      result.current.setSelectedYear(2025);
    });

    expect(result.current.selectedYear).toBe(2025);
    expect(mockGetMonthlyStats).toHaveBeenCalledWith('user-123', 2025);
  });

  it('useStatistics を Provider 外で使うとエラーをスロー', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useStatistics());
    }).toThrow('useStatistics must be used within a StatisticsProvider');
    consoleSpy.mockRestore();
  });
});

import {
  getDailyStats,
  getWeeklyStats,
  getMonthlyStats,
  getYearlyStats,
  DailyStats,
  PeriodStats,
} from '../statistics';

// Supabase モック
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockGte = jest.fn();
const mockLte = jest.fn();
const mockOrder = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

// チェーン用のモックセットアップ
function setupSupabaseMock(resolvedData: any[], error: any = null) {
  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data: resolvedData, error }),
  };
  mockFrom.mockReturnValue(chain);
  return chain;
}

describe('statistics service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── getDailyStats ──────────────────────────────────────────────
  describe('getDailyStats', () => {
    it('指定月のデータを返す', async () => {
      const rawData = [
        { game_date: '2026-03-01', approached: 10, get_contact: 3, instant_date: 1, instant_cv: 0 },
        { game_date: '2026-03-15', approached: 5, get_contact: 2, instant_date: 0, instant_cv: 1 },
      ];
      setupSupabaseMock(rawData);

      const result = await getDailyStats('user-1', 2026, 3);

      expect(result).toHaveLength(2);
      expect(result[0].game_date).toBe('2026-03-01');
      expect(result[0].approached).toBe(10);
      expect(result[0].get_contact).toBe(3);
    });

    it('contact_rate と cv_rate を正しく計算する', async () => {
      const rawData = [
        { game_date: '2026-03-01', approached: 10, get_contact: 4, instant_date: 2, instant_cv: 2 },
      ];
      setupSupabaseMock(rawData);

      const result = await getDailyStats('user-1', 2026, 3);

      expect(result[0].contact_rate).toBe(40);   // 4/10 * 100
      expect(result[0].cv_rate).toBe(20);         // 2/10 * 100
    });

    it('声かけ数が0の場合レート0を返す', async () => {
      const rawData = [
        { game_date: '2026-03-01', approached: 0, get_contact: 0, instant_date: 0, instant_cv: 0 },
      ];
      setupSupabaseMock(rawData);

      const result = await getDailyStats('user-1', 2026, 3);

      expect(result[0].contact_rate).toBe(0);
      expect(result[0].cv_rate).toBe(0);
    });

    it('データが空の場合は空配列を返す', async () => {
      setupSupabaseMock([]);
      const result = await getDailyStats('user-1', 2026, 3);
      expect(result).toEqual([]);
    });

    it('supabaseエラー時は空配列を返す', async () => {
      setupSupabaseMock([], { message: 'DB error' });
      const result = await getDailyStats('user-1', 2026, 3);
      expect(result).toEqual([]);
    });
  });

  // ── getWeeklyStats ─────────────────────────────────────────────
  describe('getWeeklyStats', () => {
    it('同じ週のデータを集計する', async () => {
      // 2026-03-02 と 2026-03-03 は同じ週（第9週）
      const rawData = [
        { game_date: '2026-03-02', approached: 5, get_contact: 2, instant_date: 1, instant_cv: 0 },
        { game_date: '2026-03-03', approached: 3, get_contact: 1, instant_date: 0, instant_cv: 1 },
      ];
      setupSupabaseMock(rawData);

      const result = await getWeeklyStats('user-1', 2026);

      // 同じ週なのでデータは1件に集計される
      expect(result).toHaveLength(1);
      expect(result[0].approached).toBe(8);       // 5 + 3
      expect(result[0].get_contact).toBe(3);      // 2 + 1
      expect(result[0].instant_cv).toBe(1);
    });

    it('複数週のデータを正しく分割する', async () => {
      const rawData = [
        { game_date: '2026-03-02', approached: 5, get_contact: 2, instant_date: 0, instant_cv: 0 },
        { game_date: '2026-03-10', approached: 4, get_contact: 1, instant_date: 0, instant_cv: 0 },
      ];
      setupSupabaseMock(rawData);

      const result = await getWeeklyStats('user-1', 2026);
      expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('データが空の場合は空配列を返す', async () => {
      setupSupabaseMock([]);
      const result = await getWeeklyStats('user-1', 2026);
      expect(result).toEqual([]);
    });
  });

  // ── getMonthlyStats ────────────────────────────────────────────
  describe('getMonthlyStats', () => {
    it('同じ月のデータを集計する', async () => {
      const rawData = [
        { game_date: '2026-03-01', approached: 10, get_contact: 3, instant_date: 1, instant_cv: 0 },
        { game_date: '2026-03-15', approached: 5, get_contact: 2, instant_date: 0, instant_cv: 1 },
        { game_date: '2026-04-01', approached: 8, get_contact: 4, instant_date: 2, instant_cv: 1 },
      ];
      setupSupabaseMock(rawData);

      const result = await getMonthlyStats('user-1', 2026);

      const march = result.find(r => r.label === '3月');
      const april = result.find(r => r.label === '4月');

      expect(march?.approached).toBe(15);   // 10 + 5
      expect(march?.get_contact).toBe(5);   // 3 + 2
      expect(april?.approached).toBe(8);
    });

    it('contact_rate と cv_rate を月単位で計算する', async () => {
      const rawData = [
        { game_date: '2026-03-01', approached: 10, get_contact: 5, instant_date: 0, instant_cv: 2 },
        { game_date: '2026-03-15', approached: 10, get_contact: 5, instant_date: 0, instant_cv: 0 },
      ];
      setupSupabaseMock(rawData);

      const result = await getMonthlyStats('user-1', 2026);
      const march = result.find(r => r.label === '3月');

      expect(march?.contact_rate).toBe(50);   // 10/20 * 100
      expect(march?.cv_rate).toBe(10);        // 2/20 * 100
    });

    it('データが空の場合は空配列を返す', async () => {
      setupSupabaseMock([]);
      const result = await getMonthlyStats('user-1', 2026);
      expect(result).toEqual([]);
    });
  });

  // ── getYearlyStats ─────────────────────────────────────────────
  describe('getYearlyStats', () => {
    it('同じ年のデータを集計する', async () => {
      const rawData = [
        { game_date: '2025-06-01', approached: 20, get_contact: 8, instant_date: 2, instant_cv: 1 },
        { game_date: '2026-01-15', approached: 15, get_contact: 5, instant_date: 1, instant_cv: 0 },
        { game_date: '2026-03-01', approached: 10, get_contact: 3, instant_date: 0, instant_cv: 0 },
      ];
      setupSupabaseMock(rawData);

      const result = await getYearlyStats('user-1');

      const y2025 = result.find(r => r.label === '2025');
      const y2026 = result.find(r => r.label === '2026');

      expect(y2025?.approached).toBe(20);
      expect(y2026?.approached).toBe(25);  // 15 + 10
    });

    it('データが空の場合は空配列を返す', async () => {
      setupSupabaseMock([]);
      const result = await getYearlyStats('user-1');
      expect(result).toEqual([]);
    });
  });
});

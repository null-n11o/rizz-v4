import React, { createContext, useContext, useState, useCallback } from 'react';
import { Girl, GirlInsert, GirlUpdate, Apo, ApoInsert, GRMStatus } from '@/src/types/grm';
import * as grmService from '@/src/services/grm';
import * as apoService from '@/src/services/apo';

interface GRMContextType {
  girls: Girl[];
  loading: boolean;
  error: string | null;
  fetchGirls: () => Promise<void>;
  createGirl: (data: Omit<GirlInsert, 'userId'>) => Promise<Girl | null>;
  updateGirl: (id: string, data: GirlUpdate) => Promise<Girl | null>;
  updateGirlStatus: (id: string, status: GRMStatus) => Promise<Girl | null>;
  deleteGirl: (id: string) => Promise<boolean>;
  getAposByGirl: (girlId: string) => Promise<Apo[]>;
  addApo: (data: Omit<ApoInsert, 'userId'>) => Promise<Apo | null>;
  deleteApo: (id: string, girlId: string) => Promise<boolean>;
}

const GRMContext = createContext<GRMContextType | undefined>(undefined);

export function GRMProvider({ children }: { children: React.ReactNode }) {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGirls = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await grmService.getGirls();
      if (error) {
        setError(error.message);
        return;
      }
      setGirls(data || []);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGirl = useCallback(async (data: Omit<GirlInsert, 'userId'>): Promise<Girl | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data: girl, error } = await grmService.createGirl(data);
      if (error) {
        setError(error.message);
        return null;
      }
      if (girl) {
        setGirls(prev => [girl, ...prev]);
      }
      return girl;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGirl = useCallback(async (id: string, data: GirlUpdate): Promise<Girl | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data: updated, error } = await grmService.updateGirl(id, data);
      if (error) {
        setError(error.message);
        return null;
      }
      if (updated) {
        setGirls(prev => prev.map(g => g.id === id ? updated : g));
      }
      return updated;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGirlStatus = useCallback(async (id: string, status: GRMStatus): Promise<Girl | null> => {
    return updateGirl(id, { status });
  }, [updateGirl]);

  const deleteGirl = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await grmService.deleteGirl(id);
      if (error) {
        setError(error.message);
        return false;
      }
      setGirls(prev => prev.filter(g => g.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAposByGirl = useCallback(async (girlId: string): Promise<Apo[]> => {
    try {
      const { data, error } = await apoService.getAposByGirl(girlId);
      if (error) {
        console.error('アポ取得エラー:', error);
        return [];
      }
      return data || [];
    } catch (err: any) {
      console.error('アポ取得エラー:', err);
      return [];
    }
  }, []);

  const addApo = useCallback(async (data: Omit<ApoInsert, 'userId'>): Promise<Apo | null> => {
    setError(null);
    try {
      const { data: apo, error } = await apoService.createApo(data);
      if (error) {
        setError(error.message);
        return null;
      }
      // アポ追加後に girls の統計（apo_count/total_spent/status）がDBトリガーで更新されるため再取得
      if (apo) {
        const { data: updatedGirl } = await grmService.getGirl(data.girlId);
        if (updatedGirl) {
          setGirls(prev => prev.map(g => g.id === data.girlId ? updatedGirl : g));
        }
      }
      return apo;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    }
  }, []);

  const deleteApo = useCallback(async (id: string, girlId: string): Promise<boolean> => {
    setError(null);
    try {
      const { error } = await apoService.deleteApo(id);
      if (error) {
        setError(error.message);
        return false;
      }
      // 削除後に girls の統計を再取得
      const { data: updatedGirl } = await grmService.getGirl(girlId);
      if (updatedGirl) {
        setGirls(prev => prev.map(g => g.id === girlId ? updatedGirl : g));
      }
      return true;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return false;
    }
  }, []);

  const value: GRMContextType = {
    girls,
    loading,
    error,
    fetchGirls,
    createGirl,
    updateGirl,
    updateGirlStatus,
    deleteGirl,
    getAposByGirl,
    addApo,
    deleteApo,
  };

  return (
    <GRMContext.Provider value={value}>
      {children}
    </GRMContext.Provider>
  );
}

export function useGRM() {
  const context = useContext(GRMContext);
  if (context === undefined) {
    throw new Error('useGRM must be used within a GRMProvider');
  }
  return context;
}

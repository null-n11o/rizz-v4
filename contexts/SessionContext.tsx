import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Session, SessionInsert, SessionUpdate } from '@/src/types/session';
import * as sessionService from '@/src/services/session';

interface SessionContextType {
  sessions: Session[];
  activeSession: Session | null;
  loading: boolean;
  error: string | null;
  fetchSessionsByDate: (date: string) => Promise<void>;
  startSession: (data: Omit<SessionInsert, 'userId'>) => Promise<Session | null>;
  updateSession: (id: string, data: SessionUpdate) => Promise<Session | null>;
  finalizeSession: (id: string) => Promise<Session | null>;
  setActiveSession: (session: Session | null) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 今日のセッションを初期ロード
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetchSessionsByDate(today);
  }, []);

  const fetchSessionsByDate = useCallback(async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await sessionService.getSessionsByDate(date);
      if (error) {
        setError(error.message);
        return;
      }
      const fetched = data || [];
      setSessions(fetched);
      // 未確定のセッションをアクティブに設定
      const unfinalized = fetched.find(s => !s.isFinalized);
      if (unfinalized) {
        setActiveSession(unfinalized);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const startSession = useCallback(async (data: Omit<SessionInsert, 'userId'>): Promise<Session | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data: session, error } = await sessionService.createSession(data);
      if (error) {
        setError(error.message);
        return null;
      }
      if (session) {
        setSessions(prev => [...prev, session]);
        setActiveSession(session);
      }
      return session;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSession = useCallback(async (id: string, data: SessionUpdate): Promise<Session | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data: updated, error } = await sessionService.updateSession(id, data);
      if (error) {
        setError(error.message);
        return null;
      }
      if (updated) {
        setSessions(prev => prev.map(s => s.id === id ? updated : s));
        if (activeSession?.id === id) {
          setActiveSession(updated);
        }
      }
      return updated;
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeSession]);

  const finalizeSession = useCallback(async (id: string): Promise<Session | null> => {
    const result = await updateSession(id, { isFinalized: true });
    if (result && activeSession?.id === id) {
      setActiveSession(null);
    }
    return result;
  }, [updateSession, activeSession]);

  const value: SessionContextType = {
    sessions,
    activeSession,
    loading,
    error,
    fetchSessionsByDate,
    startSession,
    updateSession,
    finalizeSession,
    setActiveSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

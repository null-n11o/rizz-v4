-- RLS ポリシー設定（全テーブル共通）
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE girls    ENABLE ROW LEVEL SECURITY;
ALTER TABLE apos     ENABLE ROW LEVEL SECURITY;

-- sessions ポリシー
DROP POLICY IF EXISTS "users own sessions" ON sessions;
CREATE POLICY "users own sessions" ON sessions
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- girls ポリシー
DROP POLICY IF EXISTS "users own girls" ON girls;
CREATE POLICY "users own girls" ON girls
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- apos ポリシー
DROP POLICY IF EXISTS "users own apos" ON apos;
CREATE POLICY "users own apos" ON apos
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- apos テーブル作成（アポ履歴）
CREATE TABLE IF NOT EXISTS apos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  girl_id      UUID NOT NULL REFERENCES girls(id) ON DELETE CASCADE,
  apo_number   INTEGER NOT NULL,
  apo_date     DATE NOT NULL,
  location     TEXT,
  spent        INTEGER NOT NULL DEFAULT 0,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apos_user_id ON apos(user_id);
CREATE INDEX IF NOT EXISTS idx_apos_girl_id ON apos(girl_id);
CREATE INDEX IF NOT EXISTS idx_apos_apo_date ON apos(apo_date);

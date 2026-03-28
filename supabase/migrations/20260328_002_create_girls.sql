-- girls テーブル作成（GRM本体）
CREATE TABLE IF NOT EXISTS girls (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_session_id UUID REFERENCES sessions(id),
  source_type       TEXT NOT NULL CHECK (source_type IN ('get_contact', 'instant_cv')),

  -- 基本情報
  nickname          TEXT NOT NULL,
  birthday          DATE,
  nationality       TEXT,
  occupation        TEXT,
  residence         TEXT,

  -- 外見
  height            INTEGER,
  body_type         TEXT CHECK (body_type IN ('slim', 'normal', 'curvy', 'chubby')),

  -- ステータス管理
  status            TEXT NOT NULL DEFAULT 'lead'
                    CHECK (status IN (
                      'lead',
                      'apo_1', 'apo_2', 'apo_3', 'apo_4', 'apo_5plus',
                      'sex', 'ltr', 'graduate'
                    )),

  -- 自動集計（DBトリガーで更新）
  apo_count         INTEGER NOT NULL DEFAULT 0,
  total_spent       INTEGER NOT NULL DEFAULT 0,

  -- 評価
  rating            INTEGER CHECK (rating BETWEEN 1 AND 10),

  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_girls_user_id ON girls(user_id);
CREATE INDEX IF NOT EXISTS idx_girls_status ON girls(status);
CREATE INDEX IF NOT EXISTS idx_girls_user_status ON girls(user_id, status);

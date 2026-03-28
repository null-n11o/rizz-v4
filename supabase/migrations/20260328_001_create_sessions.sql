-- sessions テーブル作成（daily_records の後継）
CREATE TABLE IF NOT EXISTS sessions (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_date               DATE NOT NULL,
  start_time                 TIME,
  location                   TEXT,
  approached                 INTEGER NOT NULL DEFAULT 0,
  get_contact                INTEGER NOT NULL DEFAULT 0,
  instant_date               INTEGER NOT NULL DEFAULT 0,
  instant_cv                 INTEGER NOT NULL DEFAULT 0,
  notes                      TEXT,
  is_finalized               BOOLEAN NOT NULL DEFAULT FALSE,
  migrated_from_record_id    UUID REFERENCES daily_records(id),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON sessions(user_id, session_date);

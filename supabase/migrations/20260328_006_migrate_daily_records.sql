-- daily_records → sessions データ移行
-- 既存レコードを sessions に1:1でコピー
INSERT INTO sessions (
  user_id, session_date, approached, get_contact,
  instant_date, instant_cv, is_finalized, migrated_from_record_id,
  created_at, updated_at
)
SELECT
  user_id,
  game_date,
  approached,
  get_contact,
  instant_date,
  instant_cv,
  TRUE,
  id,
  created_at,
  updated_at
FROM daily_records
ON CONFLICT DO NOTHING;

-- daily_records テーブルはロールバック保険として残す（後で削除）
-- DROP TABLE daily_records;

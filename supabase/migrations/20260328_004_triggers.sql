-- apos 変更時に girls の統計を自動更新するトリガー
CREATE OR REPLACE FUNCTION sync_girl_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_girl_id UUID;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_girl_id := OLD.girl_id;
  ELSE
    target_girl_id := NEW.girl_id;
  END IF;

  UPDATE girls SET
    apo_count   = (SELECT COUNT(*)                    FROM apos WHERE girl_id = target_girl_id),
    total_spent = (SELECT COALESCE(SUM(spent), 0)     FROM apos WHERE girl_id = target_girl_id),
    status      = (
      CASE
        WHEN status IN ('sex', 'ltr', 'graduate') THEN status
        WHEN (SELECT COUNT(*) FROM apos WHERE girl_id = target_girl_id) = 0 THEN 'lead'
        WHEN (SELECT COUNT(*) FROM apos WHERE girl_id = target_girl_id) = 1 THEN 'apo_1'
        WHEN (SELECT COUNT(*) FROM apos WHERE girl_id = target_girl_id) = 2 THEN 'apo_2'
        WHEN (SELECT COUNT(*) FROM apos WHERE girl_id = target_girl_id) = 3 THEN 'apo_3'
        WHEN (SELECT COUNT(*) FROM apos WHERE girl_id = target_girl_id) = 4 THEN 'apo_4'
        ELSE 'apo_5plus'
      END
    ),
    updated_at  = NOW()
  WHERE id = target_girl_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_apos_sync_girl_stats ON apos;
CREATE TRIGGER trg_apos_sync_girl_stats
AFTER INSERT OR UPDATE OR DELETE ON apos
FOR EACH ROW EXECUTE FUNCTION sync_girl_stats();

-- apo_number 自動採番トリガー
CREATE OR REPLACE FUNCTION set_apo_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.apo_number := (
    SELECT COALESCE(MAX(apo_number), 0) + 1
    FROM apos
    WHERE girl_id = NEW.girl_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_apos_set_number ON apos;
CREATE TRIGGER trg_apos_set_number
BEFORE INSERT ON apos
FOR EACH ROW EXECUTE FUNCTION set_apo_number();

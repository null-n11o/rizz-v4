# GRM (Girls Relationship Management) 機能実装計画書

**作成日**: 2026-03-28
**ブランチ**: `claude/brainstorm-grm-feature-01uYb`
**ステータス**: 実装待ち

---

## 目次

1. [概要・背景](#1-概要背景)
2. [データモデル設計](#2-データモデル設計)
3. [DBマイグレーション計画](#3-dbマイグレーション計画)
4. [セッション機能（ホーム画面改修）](#4-セッション機能ホーム画面改修)
5. [GRM画面実装](#5-grm画面実装)
6. [統計画面との連携](#6-統計画面との連携)
7. [実装順序・優先度](#7-実装順序優先度)

---

## 1. 概要・背景

### 現状

現在のRizzアプリは「街頭ナンパのアクティビティトラッキング」に特化しており、
1日1レコードで「声かけ数・バンゲ数・連れ出し数・即数」を記録している。

### 課題

- 1日に複数回の外出（セッション）を区別できない
- バンゲ・即した女性の管理が一切できない
- 出会いから関係継続までの進捗を追跡する仕組みがない

### 追加機能の目的

**GRM（Girls Relationship Management）** をメイン機能として追加し、
CRM的なパイプライン管理を通じて、出会いから関係まで体系的に管理できるようにする。

### 変更サマリー

| 変更 | 内容 |
|------|------|
| `daily_records` → `sessions` | 1日1レコードから1外出1セッションへ変更 |
| 新テーブル `girls` | GRMプロフィール管理 |
| 新テーブル `apos` | アポ（デート）履歴管理 |
| 新タブ `GRM` | パイプライン/リスト/詳細ビュー |
| DBトリガー | apo追加時に `apo_count` / `total_spent` を自動更新 |

---

## 2. データモデル設計

### 2.1 `sessions` テーブル（daily_records の後継）

```sql
CREATE TABLE sessions (
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
```

### 2.2 `girls` テーブル（GRM本体）

```sql
CREATE TABLE girls (
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
  height            INTEGER,        -- cm
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
  total_spent       INTEGER NOT NULL DEFAULT 0,  -- 円

  -- 評価
  rating            INTEGER CHECK (rating BETWEEN 1 AND 10),

  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.3 `apos` テーブル（アポ履歴）

```sql
CREATE TABLE apos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  girl_id      UUID NOT NULL REFERENCES girls(id) ON DELETE CASCADE,
  apo_number   INTEGER NOT NULL,  -- 自動採番（1, 2, 3...）
  apo_date     DATE NOT NULL,
  location     TEXT,
  spent        INTEGER NOT NULL DEFAULT 0,  -- 円
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.4 DBトリガー（自動集計）

```sql
-- apos 変更時に girls の統計を自動更新
CREATE OR REPLACE FUNCTION sync_girl_stats()
RETURNS TRIGGER AS $$
DECLARE
  target_girl_id UUID;
BEGIN
  -- DELETE の場合は OLD を参照
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
        WHEN status IN ('sex', 'ltr', 'graduate') THEN status  -- 手動ステータスは維持
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

CREATE TRIGGER trg_apos_sync_girl_stats
AFTER INSERT OR UPDATE OR DELETE ON apos
FOR EACH ROW EXECUTE FUNCTION sync_girl_stats();

-- apo_number 自動採番
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

CREATE TRIGGER trg_apos_set_number
BEFORE INSERT ON apos
FOR EACH ROW EXECUTE FUNCTION set_apo_number();
```

### 2.5 RLS ポリシー（全テーブル共通）

```sql
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE girls    ENABLE ROW LEVEL SECURITY;
ALTER TABLE apos     ENABLE ROW LEVEL SECURITY;

-- sessions
CREATE POLICY "users own sessions" ON sessions
  USING (user_id = auth.uid());

-- girls
CREATE POLICY "users own girls" ON girls
  USING (user_id = auth.uid());

-- apos
CREATE POLICY "users own apos" ON apos
  USING (user_id = auth.uid());
```

---

## 3. DBマイグレーション計画

### 3.1 既存 daily_records → sessions 移行

```sql
-- 既存レコードを sessions に1:1でコピー
INSERT INTO sessions (
  user_id, session_date, approached, get_contact,
  instant_date, instant_cv, is_finalized, migrated_from_record_id,
  created_at, updated_at
)
SELECT
  user_id, game_date, approached, get_contact,
  instant_date, instant_cv, TRUE, id,
  created_at, updated_at
FROM daily_records;
```

- `daily_records` テーブルはしばらく残す（ロールバック保険）
- 統計サービスを sessions ベースに切り替え後、一定期間後に削除

### 3.2 マイグレーションファイル構成

```
supabase/migrations/
├── 20260328_001_create_sessions.sql
├── 20260328_002_create_girls.sql
├── 20260328_003_create_apos.sql
├── 20260328_004_triggers.sql
├── 20260328_005_rls_policies.sql
└── 20260328_006_migrate_daily_records.sql
```

---

## 4. セッション機能（ホーム画面改修）

### 4.1 セッションの概念変更

| 現在 | 変更後 |
|------|--------|
| 1日1レコード、常に更新 | 1外出1セッション、複数作成可 |
| アプリ起動時に当日レコード取得 | 「新しいセッション開始」ボタン |
| カウンターを増減するだけ | セッション確定フローあり |

### 4.2 セッションのライフサイクル

```
[新セッション開始]
    ↓ 場所・開始時刻を入力（任意）
[カウンターで声かけ・バンゲ・即を記録]
    ↓
[セッション確定ボタン]
    ↓
[女性情報入力フロー]（バンゲ数 + 即数 分のフォーム）
    ↓
[GRMに保存 → is_finalized = true]
```

### 4.3 ホーム画面の変更点

- **現在のアクティブセッション**表示（場所・開始時刻）
- 「セッションを確定する」ボタン追加
- 当日の全セッション一覧（サマリー表示）
- 確定済みセッションは読み取り専用

### 4.4 女性情報入力フロー（セッション確定時）

```
セッション確定 → バンゲ N人分のフォームが順番に表示

フォームA（最小入力・必須）:
  - ニックネーム *
  - source_type（バンゲ / 即）自動設定

フォームB（詳細・任意）:
  - 身長 / 体型 / 年齢(生年月日)
  - 職業 / 国籍 / 居住地
  - メモ

→ 「スキップ」で最小情報のみ保存も可
→ 後からGRM画面で編集可能
```

### 4.5 新規 TypeScript 型

```typescript
export type GRMStatus =
  | 'lead'
  | 'apo_1' | 'apo_2' | 'apo_3' | 'apo_4' | 'apo_5plus'
  | 'sex' | 'ltr' | 'graduate'

export type BodyType = 'slim' | 'normal' | 'curvy' | 'chubby'

export interface Session {
  id: string
  userId: string
  sessionDate: string
  startTime: string | null
  location: string | null
  approached: number
  getContact: number
  instantDate: number
  instantCv: number
  notes: string | null
  isFinalized: boolean
  migratedFromRecordId: string | null
  createdAt: string
  updatedAt: string
}

export interface Girl {
  id: string
  userId: string
  sourceSessionId: string
  sourceType: 'get_contact' | 'instant_cv'
  nickname: string
  birthday: string | null
  nationality: string | null
  occupation: string | null
  residence: string | null
  height: number | null
  bodyType: BodyType | null
  status: GRMStatus
  apoCount: number       // DB自動集計
  totalSpent: number     // DB自動集計
  rating: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface Apo {
  id: string
  userId: string
  girlId: string
  apoNumber: number
  apoDate: string
  location: string | null
  spent: number
  notes: string | null
  createdAt: string
}
```

---

## 5. GRM画面実装

### 5.1 新タブ構成

```
[ホーム] [GRM] [統計] [設定]
```

`app/(tabs)/grm.tsx` を新規作成。

### 5.2 GRM画面内のサブビュー

#### パイプラインビュー（デフォルト）

```
横スクロールのカラム式表示

| Lead | Apo1 | Apo2 | ... | Sex | LTR | Graduate |
| [カード] | [カード] |      |     |     |     |          |
| [カード] |         |      |     |     |     |          |
```

各カード表示項目:
- ニックネーム
- 出会った日・場所
- 最終アポ日（あれば）
- 評価スター

#### リストビュー

ソート条件:
- 最終更新日（デフォルト）
- 出会った日
- 評価スコア
- 使用金額

フィルタ:
- ステータス絞り込み
- 「X日以上連絡なし」アラート表示

#### 女性詳細ビュー

```
[プロフィールヘッダー]
  - ニックネーム / 評価スター
  - ステータスバッジ
  - 出会った日・場所

[ステータス変更]
  - 現在: Apo2 → [Sexに進展] [LTRへ] [卒業] ボタン

[基本情報]
  - 身長 / 体型 / 年齢
  - 職業 / 国籍 / 居住地

[統計]
  - アポ回数: N回
  - 合計使用金額: ¥XX,XXX

[アポ履歴タイムライン]
  - 日付・場所・金額・メモ
  - [+ アポを追加] ボタン

[メモ]
  - フリーテキスト編集
```

### 5.3 新規ファイル構成

```
app/(tabs)/grm.tsx                         # GRMメイン画面
components/grm/
  PipelineView.tsx                         # カンバン表示
  GirlCard.tsx                             # 女性カード
  GirlListView.tsx                         # リスト表示
  GirlDetailView.tsx                       # 詳細表示
  ApoTimeline.tsx                          # アポ履歴
  AddApoForm.tsx                           # アポ追加フォーム
  GirlRegistrationForm.tsx                 # セッション確定時の登録フォーム
  StatusBadge.tsx                          # ステータスバッジUI
contexts/GRMContext.tsx                    # GRM状態管理
src/services/grm.ts                        # girls CRUD
src/services/apo.ts                        # apos CRUD
```

---

## 6. 統計画面との連携

### 6.1 統計データソースの切り替え

現在 `daily_records` を参照しているすべての統計クエリを `sessions` ベースに変更する。

```typescript
// 変更前
const stats = await supabase
  .from('daily_records')
  .select(...)

// 変更後
const stats = await supabase
  .from('sessions')
  .select(...)
  .eq('is_finalized', true)  // 確定済みのみ集計
```

### 6.2 GRM統計の追加

```typescript
interface GRMStats {
  // パイプライン別人数
  pipelineCounts: Record<GRMStatus, number>

  // コンバージョン率
  leadToSexRate: number           // Lead → Sex 到達率 (%)
  leadToApo1Rate: number          // Lead → 初アポ率 (%)

  // 平均値
  avgApoCountToSex: number        // Sex到達までの平均アポ回数
  avgSpentToSex: number           // Sex到達までの平均使用金額
  avgDaysLeadToApo1: number       // バンゲ → 初アポの平均日数

  // 総計
  totalGirls: number
  totalSpent: number
  activeGirls: number             // graduate以外
}
```

統計画面に「GRM」タブを追加して表示する。

---

## 7. 実装順序・優先度

### Phase 1: DB基盤（最優先）

| # | タスク | ファイル |
|---|--------|---------|
| 1 | sessions テーブル作成 + RLS | `supabase/migrations/20260328_001_create_sessions.sql` |
| 2 | girls テーブル作成 + RLS | `supabase/migrations/20260328_002_create_girls.sql` |
| 3 | apos テーブル作成 + RLS | `supabase/migrations/20260328_003_create_apos.sql` |
| 4 | DBトリガー作成 | `supabase/migrations/20260328_004_triggers.sql` |
| 5 | daily_records → sessions マイグレーション | `supabase/migrations/20260328_006_migrate_daily_records.sql` |

### Phase 2: セッション機能（ホーム改修）

| # | タスク | ファイル |
|---|--------|---------|
| 6 | TypeScript型定義追加 | `src/types/session.ts`, `src/types/grm.ts` |
| 7 | sessions サービス層 | `src/services/session.ts` |
| 8 | SessionContext 作成 | `contexts/SessionContext.tsx` |
| 9 | ホーム画面をセッションベースに改修 | `app/(tabs)/index.tsx` |
| 10 | セッション確定フロー + 女性登録フォーム | `components/grm/GirlRegistrationForm.tsx` |

### Phase 3: GRM画面

| # | タスク | ファイル |
|---|--------|---------|
| 11 | GRMサービス層（girls CRUD） | `src/services/grm.ts` |
| 12 | Apoサービス層（apos CRUD） | `src/services/apo.ts` |
| 13 | GRMContext 作成 | `contexts/GRMContext.tsx` |
| 14 | パイプラインビュー | `components/grm/PipelineView.tsx` |
| 15 | 女性カード / リストビュー | `components/grm/GirlCard.tsx`, `GirlListView.tsx` |
| 16 | 詳細ビュー + アポタイムライン | `components/grm/GirlDetailView.tsx`, `ApoTimeline.tsx` |
| 17 | GRMメイン画面 + タブ追加 | `app/(tabs)/grm.tsx` |

### Phase 4: 統計連携

| # | タスク | ファイル |
|---|--------|---------|
| 18 | 統計サービスを sessions ベースに切替 | `src/services/statistics.ts` |
| 19 | GRM統計の追加 | `src/services/grm-statistics.ts` |
| 20 | 統計画面にGRMタブ追加 | `app/(tabs)/statistics.tsx` |

### Phase 5: i18n / テスト

| # | タスク | ファイル |
|---|--------|---------|
| 21 | 日本語・英語翻訳追加 | `locales/ja.json`, `locales/en.json` |
| 22 | サービス層ユニットテスト | `src/services/__tests__/grm.test.ts` |

---

## 8. 非機能要件・注意事項

### プライバシー
- 全データはRLSで完全にユーザー分離
- 写真機能は Phase 5 以降で別途検討（ローカル暗号化が前提）

### オフライン対応
- 既存の offline queue パターンを流用
- sessions / girls / apos すべてに対応する

### 後方互換性
- `daily_records` テーブルは当面残す
- 統計切り替え後に削除タイミングを決定

---

*このドキュメントはブレインストーミングに基づいて作成されました。実装中に仕様変更が生じた場合は本ドキュメントも更新してください。*

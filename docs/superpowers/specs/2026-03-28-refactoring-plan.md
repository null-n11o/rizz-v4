# リファクタリングプラン

## 背景・目的

既存の `/lib`, `/services` ディレクトリ（旧コード）と、今回新規開発した `/src` ディレクトリ（新コード）の間でコーディングスタイルに乖離がある。また、Context 層でも古いパターンと新しいパターンが混在している。本プランではこれらを統一し、保守性を高める。

---

## 対象ファイルと問題点の整理

### 1. サービス層のエラーハンドリング不統一

| ファイル | パターン |
|---|---|
| `services/record.ts` | `Response<T>` 型（`{ message, code, details }` を持つ独自型） |
| `src/services/daily-goals.ts` | `{ data, error }` タプル（`error` は `Error` オブジェクト） |
| `src/services/goal.ts` | `{ data, error }` タプル |
| `src/services/profile.ts` | **throw**（エラーオブジェクトを返さず例外を投げる） |

→ **統一方針**: `src/services/daily-goals.ts` のスタイル（`{ data, error }` タプル）に揃える

### 2. デバッグ用 console.log の残存

- `src/services/goal.ts`: すべての関数エントリ・結果を `console.log` で出力（過剰）
- `services/record.ts`: 認証情報・プロファイル情報・クエリ結果を毎回出力
- `contexts/CounterContext.tsx`: リセット・ロード・更新の各ステップで大量出力

→ **統一方針**: `console.error` のみ残し、通常フローの `console.log` はすべて削除

### 3. デバッグ専用関数が本番コードに混入

`src/services/goal.ts` に以下の関数が含まれている：
- `debugGoals()` — テーブル構造確認用
- `insertTestGoal()` — テストデータ挿入用

→ これらは **削除** する

### 4. AsyncStorage キーの命名規則が不統一

| キー | 場所 |
|---|---|
| `'rizz_targets'` | CounterContext |
| `'rizz_counters'` | CounterContext |
| `'@rizz_goals'` | GoalContext |
| `'rizz_offline_queue'` | RecordContext |
| `'rizz_daily_records_cache'` | RecordContext |
| `'offlineGoalChangeQueue'` | GoalContext（プレフィックスなし） |

→ **統一方針**: `@rizz/` プレフィックスに統一する（例: `@rizz/targets`）

### 5. import パスの不統一

- `src/services/profile.ts`: `import { supabase } from '../../lib/supabase'` （相対パス）
- その他: `import { supabase } from '@/lib/supabase'` （エイリアス絶対パス）

→ **統一方針**: エイリアス絶対パス（`@/`）に統一

### 6. React Native 非対応 API の使用

`src/services/goal.ts` の `handleGoalError` が `navigator.onLine`（Web API）を使用している。React Native では動作しない。

→ `navigator.onLine` の使用箇所を **削除**（NetInfo はすでに Context 層で使用されているため、サービス層では不要）

### 7. プロファイル検索方式の不統一

- `services/record.ts`: `.eq('email', user.email)` でプロファイルを検索（メールアドレス照合）
- `src/services/profile.ts`: `.eq('user_id', user.id)` または `.eq('id', user.id)` で検索

→ `user.id` による検索に統一する

---

## リファクタリング手順

### Step 1: `src/services/profile.ts` — エラーハンドリングを `{ data, error }` 形式に統一

対象関数: `getProfile`, `updateProfile`, `changePassword`, `updateTheme`

変更内容:
- `throw error` を `return { data: null, error }` に変更
- 戻り値の型を `Promise<Profile | null>` から `Promise<{ data: Profile | null; error: Error | null }>` に変更

### Step 2: `services/record.ts` — 独自 `Response<T>` 型を廃止し `{ data, error }` 形式に統一

変更内容:
- `SuccessResponse<T>`, `FailureResponse`, `Response<T>` 型を削除
- `error` の型を `Error | null` に変更（`{ message, code, details }` オブジェクトをやめる）
- `profileData.id` による user_id 解決を `user.id` 直接参照に変更（重複 DB アクセスの排除）
- 過剰な `console.log` をすべて削除

### Step 3: `src/services/goal.ts` — クリーンアップ

変更内容:
- すべての `console.log`（デバッグ用）を削除（`console.error` は残す）
- `debugGoals()` 関数を削除
- `insertTestGoal()` 関数を削除
- `handleGoalError()` 内の `navigator.onLine` を削除（または関数自体を削除）

### Step 4: `src/services/profile.ts` — import パスを絶対パスに統一

変更内容:
- `import { supabase } from '../../lib/supabase'` → `import { supabase } from '@/lib/supabase'`

### Step 5: AsyncStorage キーの命名を統一

対象ファイル: `contexts/CounterContext.tsx`, `contexts/GoalContext.tsx`, `contexts/RecordContext.tsx`

変更内容（旧 → 新）:
- `'rizz_targets'` → `'@rizz/targets'`
- `'rizz_counters'` → `'@rizz/counters'`
- `'@rizz_goals'` → `'@rizz/goals'`
- `'rizz_offline_queue'` → `'@rizz/offline_queue'`
- `'rizz_daily_records_cache'` → `'@rizz/daily_records_cache'`
- `'offlineGoalChangeQueue'` → `'@rizz/offline_goal_change_queue'`

### Step 6: `contexts/CounterContext.tsx` — 過剰な console.log を削除

変更内容:
- `resetCounters`, `loadTargetsFromSupabase`, `incrementCounter`, `decrementCounter`, `updateTargets` 内の `console.log` をすべて削除
- `console.error` は残す

---

## 変更しないもの

- アプリのロジック・機能（動作変更なし）
- テストファイル（既存テストがパスし続けることを確認するのみ）
- UI コンポーネント層（`components/`, `app/`）
- `lib/` ディレクトリの構造（今回は移行を行わない）

---

## 完了基準

- 全 Step の変更が完了していること
- `npx jest` で既存テストがすべてパスすること
- `src/services/goal.ts` にデバッグ関数・`console.log` が残っていないこと
- 全サービス関数の戻り値が `{ data, error }` 形式に統一されていること
- AsyncStorage キーが `@rizz/` プレフィックスに統一されていること

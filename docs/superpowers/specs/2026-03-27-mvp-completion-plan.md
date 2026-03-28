# Rizz App — MVP完成計画書

**作成日**: 2026-03-27
**対象**: チームメンバー・AI実装支援
**ステータス**: 実装待ち

---

## 目次

1. [概要](#1-概要)
2. [統計画面の実装（タスク17–19）](#2-統計画面の実装タスク1719)
3. [詳細情報入力UI（タスク20–21）](#3-詳細情報入力uiタスク2021)
4. [プロフィール画像アップロード](#4-プロフィール画像アップロード)
5. [パスワードリセット機能（Issue #13）](#5-パスワードリセット機能issue-13)
6. [MVP結合テスト（タスク26）](#6-mvp結合テストタスク26)
7. [実装順序・優先度](#7-実装順序優先度)

---

## 1. 概要

本計画書は、Rizz App のMVP（Minimum Viable Product）完成に向けた残タスクの詳細な実装計画をまとめたものです。

### 残タスク一覧

| # | タスク | 優先度 | 工数目安 |
|---|--------|--------|--------|
| 17–19 | 統計画面（グラフ・期間切替・データ取得） | 高 | 大 |
| 20–21 | 詳細情報入力（場所・時間） | 中 | 小 |
| — | プロフィール画像アップロード | 中 | 中 |
| 13 | パスワードリセット機能 | 中 | 中 |
| 26 | MVP結合テスト | 高 | 中 |

---

## 2. 統計画面の実装（タスク17–19）

### 2.1 概要

`app/(tabs)/statistics.tsx` は現在プレースホルダーのみ。Victory Native を使って日次/週次/月次/年次の4つの期間でグラフを表示する。

### 2.2 実装スコープ

#### タスク17: 統計データ取得サービス

**ファイル**: `src/services/statistics.ts`（新規作成）

```typescript
import { supabase } from '@/src/libs/supabase'

export type StatsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface DailyStats {
  game_date: string
  approached: number
  get_contact: number
  instant_date: number
  instant_cv: number
  contact_rate: number  // get_contact / approached * 100
  cv_rate: number       // instant_cv / approached * 100
}

export interface PeriodStats {
  label: string         // 日次: "03/27", 週次: "3/3週", 月次: "3月", 年次: "2026"
  approached: number
  get_contact: number
  instant_date: number
  instant_cv: number
  contact_rate: number
  cv_rate: number
}

// 日次統計（指定月の全日分）
export async function getDailyStats(
  userId: string,
  year: number,
  month: number
): Promise<DailyStats[]>

// 週次統計（指定年の全週分）
export async function getWeeklyStats(
  userId: string,
  year: number
): Promise<PeriodStats[]>

// 月次統計（指定年の全月分）
export async function getMonthlyStats(
  userId: string,
  year: number
): Promise<PeriodStats[]>

// 年次統計（全年分）
export async function getYearlyStats(
  userId: string
): Promise<PeriodStats[]>
```

**SQL例（日次）**:
```sql
SELECT
  game_date,
  approached,
  get_contact,
  instant_date,
  instant_cv,
  CASE WHEN approached > 0
    THEN ROUND((get_contact::NUMERIC / approached) * 100, 1)
  ELSE 0 END AS contact_rate,
  CASE WHEN approached > 0
    THEN ROUND((instant_cv::NUMERIC / approached) * 100, 1)
  ELSE 0 END AS cv_rate
FROM daily_records
WHERE user_id = $1
  AND EXTRACT(YEAR FROM game_date) = $2
  AND EXTRACT(MONTH FROM game_date) = $3
ORDER BY game_date;
```

#### タスク18: 統計コンテキスト

**ファイル**: `contexts/StatisticsContext.tsx`（新規作成）

```typescript
interface StatisticsContextType {
  period: StatsPeriod
  setPeriod: (period: StatsPeriod) => void
  selectedYear: number
  setSelectedYear: (year: number) => void
  selectedMonth: number
  setSelectedMonth: (month: number) => void
  stats: PeriodStats[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}
```

- 期間切替時に対応するデータを自動フェッチ
- AsyncStorage でキャッシュ（TTL: 5分）
- オフライン時はキャッシュを使用

#### タスク19: 統計画面UI

**ファイル**: `app/(tabs)/statistics.tsx`（既存ファイルを置き換え）

```
StatisticsScreen
├── PeriodSelector（日次/週次/月次/年次タブ）
├── DateNavigator（← 年月 →）
├── SummaryCards（合計: 声かけ数・連絡先率・即率）
└── StatsChart（Victory Native グラフ）
    ├── BarChart: approached / get_contact / instant_cv の棒グラフ
    └── LineChart: contact_rate / cv_rate の折れ線グラフ
```

**使用ライブラリ**: Victory Native

```bash
npx expo install victory-native
```

**グラフ仕様**:

| 期間 | X軸 | Y軸 | グラフ種別 |
|------|-----|-----|--------|
| 日次 | 日付（1〜末日） | 件数 / % | 棒グラフ + 折れ線 |
| 週次 | 週番号（1〜52週） | 件数 / % | 棒グラフ + 折れ線 |
| 月次 | 月（1〜12月） | 件数 / % | 棒グラフ + 折れ線 |
| 年次 | 年 | 件数 / % | 棒グラフ + 折れ線 |

**ブランドカラー適用**:
- 棒グラフ: `#C09E5C`（アンティークゴールド）
- 折れ線: `#D4AF37`（メタリックゴールド）
- 背景: `#0A0F23`（リッチブラック）
- グリッド線: `#36454F`（チャコールグレー）

**新規コンポーネント**:

```
components/statistics/
├── PeriodSelector.tsx    # 日次/週次/月次/年次タブ
├── DateNavigator.tsx     # 年月ナビゲーター（← →）
├── SummaryCards.tsx      # 集計サマリーカード
├── StatsBarChart.tsx     # 棒グラフ（Victory Native）
└── StatsLineChart.tsx    # 折れ線グラフ（Victory Native）
```

### 2.3 i18n キー追加

```json
// locales/ja.json
{
  "statistics": {
    "title": "統計",
    "period": {
      "daily": "日次",
      "weekly": "週次",
      "monthly": "月次",
      "yearly": "年次"
    },
    "metrics": {
      "approached": "声かけ数",
      "contactRate": "連絡先率",
      "cvRate": "即率"
    },
    "noData": "データがありません",
    "loading": "データを読み込み中..."
  }
}
```

### 2.4 完了条件

- [ ] 日次/週次/月次/年次の4期間でデータが表示される
- [ ] 棒グラフ（件数）と折れ線グラフ（率）が正しく表示される
- [ ] 年月ナビゲーターで期間を切り替えられる
- [ ] データなし時に適切なメッセージを表示する
- [ ] オフライン時はキャッシュデータを表示する
- [ ] 日本語/英語の両方で表示が正しい

---

## 3. 詳細情報入力UI（タスク20–21）

### 3.1 概要

`daily_records` テーブルの `game_area`（場所）と `game_time`（時間）フィールドが存在するが、入力UIがない。ホーム画面に入力フォームを追加する。

### 3.2 実装スコープ

#### タスク20: game_area（場所）入力

**場所**: ホーム画面のカウンターセクション下部に追加

**コンポーネント**: `components/counter/GameAreaInput.tsx`（新規作成）

```typescript
interface GameAreaInputProps {
  value: string
  onChangeText: (text: string) => void
}
```

**UI仕様**:
- テキスト入力フィールド
- プレースホルダー: `t('home.gameArea.placeholder')` → "場所を入力（例: 渋谷）"
- 最大文字数: 100文字
- 入力後 1秒の debounce で自動保存（`upsertDailyRecord` 呼び出し）

#### タスク21: game_time（時間帯）入力

**コンポーネント**: `components/counter/GameTimeInput.tsx`（新規作成）

```typescript
interface GameTimeInputProps {
  value: string | null  // "HH:MM:SS" 形式
  onChange: (time: string | null) => void
}
```

**UI仕様**:
- 時間帯ピッカー（例: 午前・昼・夕方・夜 のセレクタ、または時刻入力）
- プラットフォーム差異: iOS は DateTimePicker、Android はカスタムUI
- `@react-native-community/datetimepicker` を使用

```bash
npx expo install @react-native-community/datetimepicker
```

**時間帯プリセット**（任意選択 + カスタム入力）:

| ラベル | 時刻 |
|--------|------|
| 午前 | 10:00 |
| 昼 | 13:00 |
| 夕方 | 17:00 |
| 夜 | 20:00 |
| カスタム | ユーザー入力 |

### 3.3 サービス層の更新

**ファイル**: `services/record.ts`（既存）

```typescript
// 既存の upsertDailyRecord に game_area / game_time を追加
export async function upsertDailyRecord(record: Partial<DailyRecord> & {
  game_date: string
  game_area?: string
  game_time?: string
}): Promise<DailyRecord>
```

**ファイル**: `contexts/RecordContext.tsx`（既存）

```typescript
// 既存コンテキストに追加
updateGameArea: (area: string) => Promise<void>
updateGameTime: (time: string | null) => Promise<void>
```

### 3.4 i18n キー追加

```json
{
  "home": {
    "gameArea": {
      "label": "場所",
      "placeholder": "場所を入力（例: 渋谷）"
    },
    "gameTime": {
      "label": "時間帯",
      "placeholder": "時間帯を選択",
      "presets": {
        "morning": "午前",
        "noon": "昼",
        "evening": "夕方",
        "night": "夜",
        "custom": "カスタム"
      }
    }
  }
}
```

### 3.5 完了条件

- [ ] ホーム画面で場所を入力・保存できる
- [ ] ホーム画面で時間帯を選択・保存できる
- [ ] 入力値が `daily_records` に正しく保存される
- [ ] オフライン時は AsyncStorage にキューイングされ、オンライン復帰時に同期される
- [ ] 日本語/英語の両方で表示が正しい

---

## 4. プロフィール画像アップロード

### 4.1 概要

`profiles.avatar_url` フィールドは存在するが、Supabase Storageへのアップロード機能が未実装。設定画面にプロフィール画像の表示・変更機能を追加する。

### 4.2 Supabase Storage 設定

1. Supabase ダッシュボードで `avatars` バケットを作成
2. RLSポリシーを設定:
   - SELECT: 全認証ユーザー（公開プロフィール画像）
   - INSERT / UPDATE / DELETE: `auth.uid() = user_id`（自分の画像のみ）
3. バケット設定: `public: true`（URL で直接アクセス可能）

**ストレージパス規則**: `avatars/{user_id}/profile.jpg`

### 4.3 実装スコープ

**依存ライブラリ**:

```bash
npx expo install expo-image-picker expo-file-system
```

**新規サービス**: `src/services/storage.ts`

```typescript
export async function uploadAvatar(
  userId: string,
  imageUri: string
): Promise<string>  // 返り値: public URL

export async function deleteAvatar(userId: string): Promise<void>
```

**実装詳細**:
1. `expo-image-picker` でカメラロールから画像を選択
2. 画像をリサイズ（最大 400×400px）して圧縮
3. `supabase.storage.from('avatars').upload(path, blob)` でアップロード
4. 公開URLを取得して `profiles.avatar_url` を更新

**更新コンポーネント**: `components/profile/ProfileSettings.tsx`

```
AvatarSection
├── Avatar（現在の画像 or プレースホルダー）
├── 「画像を変更」ボタン
└── ImagePickerModal
    ├── 「カメラで撮影」
    ├── 「ライブラリから選択」
    └── 「削除」（画像がある場合のみ）
```

**ProfileContext の更新**:

```typescript
// contexts/ProfileContext.tsx に追加
updateAvatar: (imageUri: string) => Promise<void>
deleteAvatar: () => Promise<void>
```

### 4.4 i18n キー追加

```json
{
  "settings": {
    "avatar": {
      "label": "プロフィール画像",
      "changeButton": "画像を変更",
      "deleteButton": "画像を削除",
      "camera": "カメラで撮影",
      "library": "ライブラリから選択",
      "uploadSuccess": "プロフィール画像を更新しました",
      "uploadError": "画像のアップロードに失敗しました"
    }
  }
}
```

### 4.5 完了条件

- [ ] 設定画面でプロフィール画像を表示できる
- [ ] カメラロールから画像を選択してアップロードできる
- [ ] カメラで撮影してアップロードできる
- [ ] 画像を削除できる
- [ ] アップロード中のローディング表示がある
- [ ] 日本語/英語の両方で表示が正しい

---

## 5. パスワードリセット機能（Issue #13）

### 5.1 概要

ユーザーがパスワードを忘れた場合に、メール経由でリセットできる機能を追加する。Supabase Auth の標準機能（`resetPasswordForEmail`）を活用する。

### 5.2 画面構成

```
app/(auth)/
├── login.tsx           # 既存: 「パスワードを忘れた方」リンクを追加
├── forgot-password.tsx # 新規: メールアドレス入力画面
└── reset-password.tsx  # 新規: 新パスワード入力画面（ディープリンクで到達）
```

### 5.3 実装スコープ

#### `app/(auth)/forgot-password.tsx`（新規作成）

```typescript
// メールアドレス入力 → resetPasswordForEmail 呼び出し
// 送信完了後: "メールを送信しました" メッセージを表示
```

**バリデーション**:
```typescript
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email(t('auth.validation.emailInvalid'))
    .required(t('auth.validation.emailRequired')),
})
```

#### `app/(auth)/reset-password.tsx`（新規作成）

```typescript
// ディープリンク経由でトークンを受け取り
// 新パスワード + 確認パスワード入力
// updateUser({ password: newPassword }) 呼び出し
```

**バリデーション**:
```typescript
const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, t('auth.validation.passwordMinLength'))
    .required(t('auth.validation.passwordRequired')),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], t('auth.validation.passwordMismatch'))
    .required(t('auth.validation.confirmPasswordRequired')),
})
```

#### Supabase Auth 設定

- **リダイレクトURL**: `rizzapp://reset-password`（Expo ディープリンク）
- **トークン有効期限**: Supabase ダッシュボードで設定（推奨: 1時間）
- **メールテンプレート**: Supabase ダッシュボードでカスタマイズ

#### `app.json` 設定（ディープリンク）

```json
{
  "expo": {
    "scheme": "rizzapp"
  }
}
```

#### AuthContext の更新

```typescript
// contexts/AuthContext.tsx に追加
resetPassword: (email: string) => Promise<void>
```

### 5.4 エラーハンドリング

| エラーケース | 表示メッセージ |
|------------|-------------|
| 未登録メールアドレス | "このメールアドレスは登録されていません" |
| 無効/期限切れトークン | "リンクの有効期限が切れています。再度リセットを実施してください" |
| ネットワークエラー | "通信エラーが発生しました。しばらくしてから再試行してください" |

### 5.5 i18n キー追加

```json
{
  "auth": {
    "forgotPassword": {
      "title": "パスワードをお忘れの方",
      "description": "登録済みのメールアドレスを入力してください",
      "submitButton": "リセットメールを送信",
      "successMessage": "パスワードリセットメールを送信しました",
      "backToLogin": "ログイン画面に戻る"
    },
    "resetPassword": {
      "title": "新しいパスワードの設定",
      "newPasswordLabel": "新しいパスワード",
      "confirmPasswordLabel": "パスワード（確認）",
      "submitButton": "パスワードを更新",
      "successMessage": "パスワードを更新しました"
    }
  }
}
```

### 5.6 完了条件

- [ ] ログイン画面に「パスワードを忘れた方」リンクが表示される
- [ ] メールアドレスを入力してリセットメールを送信できる
- [ ] メール内リンクから新しいパスワードを設定できる
- [ ] バリデーション・エラーハンドリングが適切に機能する
- [ ] 日本語/英語の両方で表示が正しい

---

## 6. MVP結合テスト（タスク26）

### 6.1 テストシナリオ

#### 認証フロー

| # | シナリオ | 期待結果 |
|---|----------|---------|
| A1 | 新規サインアップ | プロフィール作成 → ホーム画面へ |
| A2 | ログイン | ホーム画面へ遷移 |
| A3 | ログアウト | ログイン画面へ遷移 |
| A4 | パスワードリセット | メール受信 → 新パスワード設定 |
| A5 | セッション復元 | アプリ再起動時にログイン維持 |

#### カウンター操作フロー

| # | シナリオ | 期待結果 |
|---|----------|---------|
| B1 | カウンターをインクリメント（オンライン） | ローカル即時更新 + Supabase 同期 |
| B2 | カウンターをインクリメント（オフライン） | ローカル更新 + キューイング |
| B3 | オフライン → オンライン復帰 | キューが自動同期される |
| B4 | カウンターをデクリメント | 0以下にならない |
| B5 | 日付をまたいだカウンター | 翌日は0リセット |

#### 目標・プログレスフロー

| # | シナリオ | 期待結果 |
|---|----------|---------|
| C1 | 日次目標を設定 | プログレスバーに反映 |
| C2 | 週次/月次/年次目標を設定 | 保存される |
| C3 | 目標超過時のプログレスバー | 100%以上を正しく表示 |

#### 統計フロー

| # | シナリオ | 期待結果 |
|---|----------|---------|
| D1 | 日次統計を表示 | 当月のデータがグラフに表示 |
| D2 | 期間切替（日次→週次→月次→年次） | 各期間のデータが表示 |
| D3 | データなし期間 | 「データなし」メッセージ表示 |

#### 設定フロー

| # | シナリオ | 期待結果 |
|---|----------|---------|
| E1 | ユーザーネーム変更 | 即時反映 |
| E2 | テーマ切替（ライト/ダーク） | 即時反映 |
| E3 | 言語切替（日本語/英語） | 即時反映 |
| E4 | プロフィール画像アップロード | 画像が表示される |
| E5 | パスワード変更 | 新パスワードでログイン可能 |

### 6.2 端末・環境

- iOS 17以上（iPhone）
- Android 13以上
- オフライン環境（機内モード）
- 低速ネットワーク（3G相当）

### 6.3 完了条件

- [ ] 全シナリオがiOS/Androidで正常動作する
- [ ] オフライン → オンライン同期が正しく機能する
- [ ] 主要エラー状態が適切にハンドリングされる
- [ ] パフォーマンス要件（UIレスポンス300ms以内）を満たす

---

## 7. 実装順序・優先度

### 推奨実装順序

```
Phase 1: データ基盤（1-2日）
  └── 統計データ取得サービス (src/services/statistics.ts)

Phase 2: UI実装（3-5日）
  ├── 統計画面UI（components/statistics/, app/(tabs)/statistics.tsx）
  └── 詳細情報入力UI（GameAreaInput, GameTimeInput）

Phase 3: 機能追加（2-3日）
  ├── プロフィール画像アップロード
  └── パスワードリセット機能

Phase 4: テスト・修正（2-3日）
  └── MVP結合テスト全シナリオ実施
```

### ファイル変更一覧（予定）

**新規作成**:
```
src/services/statistics.ts
contexts/StatisticsContext.tsx
components/statistics/PeriodSelector.tsx
components/statistics/DateNavigator.tsx
components/statistics/SummaryCards.tsx
components/statistics/StatsBarChart.tsx
components/statistics/StatsLineChart.tsx
components/counter/GameAreaInput.tsx
components/counter/GameTimeInput.tsx
src/services/storage.ts
app/(auth)/forgot-password.tsx
app/(auth)/reset-password.tsx
```

**更新**:
```
app/(tabs)/statistics.tsx        # プレースホルダー → 実装
app/(auth)/login.tsx             # 「パスワードを忘れた方」リンク追加
components/profile/ProfileSettings.tsx  # プロフィール画像セクション追加
contexts/RecordContext.tsx       # updateGameArea / updateGameTime 追加
contexts/AuthContext.tsx         # resetPassword 追加
contexts/ProfileContext.tsx      # updateAvatar / deleteAvatar 追加
services/record.ts               # game_area / game_time フィールド対応
locales/ja.json                  # 新規翻訳キー追加
locales/en.json                  # 新規翻訳キー追加
```

---

## 参照資料

- [設計仕様書](./2026-03-27-rizz-app-design.md)
- [Issue #13: パスワードリセット機能](../issues/issue-13.md)
- [開発ログ #12: 多言語対応実装](../dev-logs/250525-12.md)
- [Supabase Auth 公式ドキュメント](https://supabase.com/docs/guides/auth)
- [Victory Native 公式ドキュメント](https://commerce.nearform.com/open-source/victory-native/)
- [Expo Image Picker 公式ドキュメント](https://docs.expo.dev/versions/latest/sdk/imagepicker/)

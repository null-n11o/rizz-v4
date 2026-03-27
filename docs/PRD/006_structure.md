## 概要

Expo + React Native で構築されたモバイルアプリケーション。Supabase をバックエンドとして使用する。

---

## ディレクトリ構造

```
rizz-v4/
├── app/                        # Expo Router（画面）
│   ├── _layout.tsx             # ルートレイアウト・認証リダイレクト
│   ├── index.tsx               # 初期リダイレクト
│   ├── +not-found.tsx          # 404ページ
│   ├── (auth)/                 # 認証画面グループ
│   │   ├── _layout.tsx
│   │   ├── login.tsx           # ログイン
│   │   └── signup.tsx          # サインアップ
│   └── (tabs)/                 # メインタブグループ
│       ├── _layout.tsx         # タブバー定義
│       ├── index.tsx           # ホーム（カウンター）
│       ├── statistics.tsx      # 統計データ（未実装）
│       ├── goal-settings.tsx   # 目標設定
│       └── settings.tsx        # 設定
│
├── components/                 # UIコンポーネント
│   ├── auth/                   # 認証関連
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── FormLayout.tsx
│   │   ├── FormInput.tsx
│   │   └── FormButton.tsx
│   ├── counter/                # カウンター関連
│   │   ├── CounterButton.tsx   # インクリメント/デクリメントボタン
│   │   └── ProgressDisplay.tsx # プログレスバー表示
│   ├── goal/                   # 目標設定関連
│   │   ├── GoalForm.tsx
│   │   ├── NumericInput.tsx
│   │   └── PeriodSelector.tsx
│   ├── profile/                # プロフィール・設定関連
│   │   ├── ProfileSettings.tsx
│   │   ├── UsernameForm.tsx
│   │   ├── PasswordForm.tsx
│   │   ├── XUrlForm.tsx
│   │   └── ThemeToggle.tsx
│   ├── ui/                     # 汎用UIプリミティブ
│   │   ├── IconSymbol.tsx
│   │   └── TabBarBackground.tsx
│   ├── ThemedText.tsx
│   ├── ThemedView.tsx
│   └── ProgressBar.tsx
│
├── contexts/                   # React Context プロバイダー
│   ├── AuthContext.tsx         # 認証状態管理
│   ├── CounterContext.tsx      # カウンター・目標状態管理
│   ├── RecordContext.tsx       # 日次記録状態管理（オフライン対応）
│   ├── GoalContext.tsx         # 目標データ状態管理（オフライン対応）
│   └── ProfileContext.tsx      # プロフィール状態管理
│
├── services/                   # Supabase API 連携
│   ├── record.ts               # 日次記録 CRUD
│   ├── profile.ts              # プロフィール CRUD
│   ├── auth-debug.ts           # 認証デバッグユーティリティ
│   └── reset-counters.ts       # カウンターリセット
│
├── hooks/                      # カスタムフック（テーマ系）
│   ├── useColorScheme.ts
│   ├── useColorScheme.web.ts
│   └── useThemeColor.ts
│
├── lib/                        # 共通ライブラリ・型定義
│   └── types/
│       ├── record.ts           # CounterType, PeriodType, DailyRecord 等
│       └── goal.ts             # PeriodType
│
├── src/                        # 追加ソースコード（services/types 拡張）
│   ├── components/
│   │   └── goal/
│   │       └── GoalForm.tsx    # 拡張版 GoalForm
│   ├── hooks/
│   │   └── useAuth.ts          # AuthContext ラッパーフック
│   ├── libs/
│   │   ├── i18n.ts             # i18next 設定
│   │   └── supabase/
│   │       └── daily-goals.ts  # daily_goals Supabase ヘルパー
│   ├── services/
│   │   ├── goal.ts             # goals テーブル API
│   │   ├── daily-goals.ts      # daily_goals テーブル API
│   │   └── profile.ts          # プロフィール API（拡張版）
│   ├── schemas/
│   │   └── daily-goals.ts      # Yup バリデーションスキーマ
│   └── types/
│       ├── database.types.ts   # Supabase 自動生成型
│       ├── goal.ts             # 目標型定義
│       └── profile.ts          # プロフィール型定義
│
├── constants/                  # カラー・定数
├── locales/                    # i18n 翻訳ファイル
│   ├── ja.json                 # 日本語
│   └── en.json                 # 英語
├── assets/                     # 画像・フォント等
├── app.json                    # Expo アプリ設定
├── app.config.js               # 動的 Expo 設定
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## データフロー

```
ユーザー操作（タップ・フォーム入力）
    ↓
コンポーネント（app/ または components/）
    ↓
Context（contexts/）
    ├── ローカル状態更新
    ├── AsyncStorage への書き込み（キャッシュ・オフラインキュー）
    └── Services 呼び出し
            ↓
        Supabase API
            ↓
        PostgreSQL（profiles / daily_records / daily_goals / goals）
```

---

## Context の責務

| Context | 責務 |
|---------|------|
| `AuthContext` | Supabase Auth セッション管理・ログイン/アウト |
| `CounterContext` | ホーム画面のカウンター値・目標値の同期 |
| `RecordContext` | 日次記録の CRUD・オフラインキュー管理 |
| `GoalContext` | 目標の CRUD・オフラインキュー管理 |
| `ProfileContext` | プロフィール情報・テーマ・言語設定 |

---

## Services の責務

| ファイル | 対象テーブル | 主な操作 |
|---------|------------|---------|
| `services/record.ts` | `daily_records` | 取得・upsert・インクリメント |
| `src/services/daily-goals.ts` | `daily_goals` | 取得・upsert |
| `src/services/goal.ts` | `goals` | 取得・upsert・削除 |
| `src/services/profile.ts` | `profiles` | 取得・更新・パスワード変更 |

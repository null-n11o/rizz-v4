## 概要

Rizz アプリケーションは Expo + React Native + Supabase で構築されたモバイルアプリケーションです。

本ドキュメントでは、このプロジェクトで使用する技術スタックを説明します。

---

## フロントエンド

### Expo + React Native

- **Expo SDK**: `~52.0.46`
- **React Native**: `0.76.9`
- **React**: `18.3.1`

### ナビゲーション

- **Expo Router**: `~4.0.20`（ファイルベースルーティング）
  - グループルーティング: `(auth)/` と `(tabs)/`
  - ディープリンクサポート

### UI ライブラリ

- **React Native Paper**: `^5.13.1`（Material Design コンポーネント）
- **Expo Vector Icons**（アイコンパック）
- **expo-linear-gradient**: `^14.0.2`（グラデーション）

### 状態管理

- **Context API + useReducer + TypeScript**
  - `AuthContext` — 認証状態
  - `CounterContext` — カウンター・目標状態
  - `RecordContext` — 日次記録状態
  - `GoalContext` — 目標データ状態
  - `ProfileContext` — ユーザープロフィール状態

### フォーム管理

- **Formik**: `^2.4.6`
- **Yup**: `^1.6.1`（バリデーションスキーマ）

### 国際化（i18n）

- **i18next**: `^23.0.3`
- **react-i18next**: `^13.0.0`
- 対応言語: 日本語（デフォルト）、英語
- 言語ファイル: `locales/ja.json`, `locales/en.json`

### 日付操作

- **date-fns**: `^4.1.0`

### オフライン対応

- **@react-native-async-storage/async-storage**: `^2.1.2`（ローカルキャッシュ・変更キュー）
- **@react-native-community/netinfo**: `^11.4.1`（ネットワーク状態監視）

### グラフ・データ可視化

- **Victory Native**（❌ 未実装・今後導入予定）
  - 統計画面のグラフ表示に使用予定

---

## バックエンド

### Supabase

- **supabase-js**: `^2.49.4`
- **データベース**: PostgreSQL（Supabase管理）
- **認証**: Supabase Auth（メール/パスワード）
- **ストレージ**: Supabase Storage（プロフィール画像 ❌ 未実装）
- **セキュリティ**: Row Level Security (RLS)

---

## データベース設計

テーブル詳細は [002_er.md](./002_er.md) を参照。

| テーブル | 用途 |
|---------|------|
| `profiles` | ユーザープロフィール情報 |
| `daily_records` | 日次ナンパ記録 |
| `daily_goals` | 日次目標 |
| `goals` | 週次/月次/年次目標 |

---

## デプロイメント

### モバイルアプリ

- **ビルド**: Expo EAS Build（`eas build`）
- **配布**: iOS → App Store Connect / Android → Google Play Console
- **OTAアップデート**: Expo Updates

### バックエンド

- **ホスティング**: Supabaseクラウド（無料枠からスタート）

---

## 開発環境

- **言語**: TypeScript
- **パッケージマネージャー**: npm
- **バージョン管理**: Git + GitHub
- **エディタ**: Visual Studio Code

---

## テスト戦略

- TypeScript 静的型チェック（主要な防衛線）
- 手動テスト（MVPフェーズ中心）
- Jest（必要に応じて単体テスト）

---

## セキュリティ

- **認証**: Supabase Auth（JWT自動管理）
- **アクセス制御**: RLS ポリシー（ユーザーは自分のデータのみ操作可能）

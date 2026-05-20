# Casino Ledger（chip-stack）

カジノでの収支を上品に記録する個人プレイヤー向け Web アプリ。

---

## 🟢 進捗（いまここ）

- ✅ 直近で済んだこと: MVP 完成・Vercel 本番公開・GitHub 連携完了
- 🟡 進行中: なし（v1 完成）
- 🔜 次の一歩: 実機（iPhone / PC）で触ってみて、改善点をピックアップ

---

## 🌐 本番 URL

- **本番アプリ**: https://chip-stack.vercel.app
- **GitHub リポジトリ**: https://github.com/shougihajime-eng/chip-stack
- **Vercel ダッシュボード**: https://vercel.com/shougihajime-3368s-projects/chip-stack

ホーム画面追加（PWA）: iPhone Safari で開く → 共有ボタン → 「ホーム画面に追加」

---

## 📦 技術構成

| 項目 | 内容 |
|---|---|
| フレームワーク | Next.js 16（App Router）+ TypeScript |
| スタイル | Tailwind CSS v4 |
| データ保存 | IndexedDB（Dexie.js）— **ブラウザ内のみ**。サーバー保存なし |
| グラフ | Recharts |
| フォント | Playfair Display / Inter Tight / JetBrains Mono（Google Fonts） |
| 公開 | Vercel（GitHub main プッシュで自動公開） |
| Supabase | **使用しない**（ローカル保存のみで完結） |

---

## 🎯 機能（v1 MVP）

### 記録できる項目
- 日付・ゲーム種別（ポーカー NLH/PLO/その他, BJ, バカラ, ルーレット, クラップス, シックボー, パイガオ, カリビアンスタッド, スリーカード, その他）
- 形式（キャッシュ / トーナメント）
- 国・カジノ店舗名（履歴サジェスト付き）
- 通貨（JPY/USD/KRW/TWD/EUR/GBP/SGD/HKD/CNY/AUD）
- バイイン額・キャッシュアウト額
- 手動為替レート（JPY 換算用）
- プレイ時間（任意）
- トーナメント順位・参加人数（任意）
- メモ

### 画面
- `/` — ホーム（累積収支ヒーロー + 主要数値 + 月次グラフ + 最近のセッション）
- `/sessions` — 一覧（期間/ゲーム/国フィルタ）
- `/sessions/new` — 新規追加
- `/sessions/[id]` — 編集・削除

---

## 🚧 未実装（フェーズ2以降）

- 為替 API 自動取得（Frankfurter API）
- ゲーム別・場所別の円グラフ／棒グラフ
- CSV エクスポート / インポート
- 勝率・時給などの追加サマリー
- ライトモード切替
- お気に入りカジノのピン留め
- データのバックアップ・複数端末同期

---

## 🛠 開発コマンド

```bash
# 開発サーバー起動
npm run dev          # http://localhost:3000

# ビルド確認
npm run build

# 型チェック
npm run lint
```

## 🚢 公開フロー

GitHub main にプッシュ → Vercel が自動で本番公開。手動で公開したい場合：

```bash
npx vercel --prod --yes
```

---

## ⚠️ データに関する重要事項

- **データはブラウザ内のみ**（IndexedDB）。サーバーに送信されない。
- **ブラウザのデータを削除するとセッション記録が消える**（iPhone Safari の「サイトデータを削除」など）。
- 複数端末同期は v2 で検討（クラウド保存）。
- 履歴を守りたい場合は v2 のエクスポート機能を待つか、Dev Tools で IndexedDB をエクスポート。

---

## 📁 ディレクトリ構成

```
app/
  page.tsx                  ホーム
  layout.tsx                ルート（フォント・メタデータ・AppShell）
  globals.css               カジノラウンジテーマ CSS
  manifest.ts               PWA マニフェスト
  icon.tsx, apple-icon.tsx  動的アイコン生成
  sessions/
    page.tsx                一覧
    new/page.tsx            新規
    [id]/                   編集
components/
  layout/                   AppShell, BottomNav
  ui/                       Card, Button, Field, Money
  sessions/                 SessionForm, SessionList
  home/                     HomeDashboard
  charts/                   MonthlyChart
lib/
  db/                       Dexie スキーマ・CRUD ヘルパー
  currency.ts               通貨定義・JPY 換算
  games.ts                  ゲーム・国の定数
  utils.ts                  cn ヘルパー・日付フォーマッタ
```

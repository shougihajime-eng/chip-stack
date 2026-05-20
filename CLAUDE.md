# Casino Ledger（chip-stack）

カジノでの収支を上品に記録する個人プレイヤー向け Web アプリ。

---

## 🟢 進捗（いまここ）

- ✅ 直近で済んだこと: PC幅で楽しめるシネマティック・デザインに刷新（max-w-[1400px] / 5枚カード手札 / 回るルーレット / 浮遊チップタワー / 金粉パーティクル / カジノ・ティッカー / 紙吹雪コンフェッティ）+ 坪井さんフィードバック対応
- 🟡 進行中: なし
- 🔜 次の一歩: 公開（git push → Vercel 自動デプロイ）と、Supabase で `0002_tourney_extras.sql` 実行（クラウド同期使う人向け）

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
| Supabase | 共有 Supabase の `chip_stack` スキーマ（オプションでクラウド同期）|

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

## ✅ フェーズ2 で追加した機能（2026-05-20 完成）

- 為替 API 自動取得（open.er-api.com / 1日キャッシュ / 手動更新ボタン）
- ゲーム別・場所別の収支ランキング（横棒グラフ）
- CSV 出力（UTF-8 BOM 付き・Excel で日本語崩れなし）
- カジノラウンジ風デザイン強化（フェルト緑・トランプ柄背景・カジノチップアイコン）
- ポーカーテーブル型ヒーロー（A♠ × Total P/L × A♥）
- アニメーション（カード登場・数字カウントアップ・チップ落下演出）

## ✅ 坪井さんフィードバック対応（2026-05-21 完成）

- **PWA：クラウド同期ボタンが押せない問題を修正**
  - ヘッダーに `safe-area-inset-top` の余白を追加（iOS の時計バー裏に隠れていた）
  - ヘッダーのアカウントアイコンを「☁ クラウド」ラベル付きの大きめボタンに変更
  - ホーム画面の見出し下にも「クラウドと同期」ボタンを設置（モバイルのみ）
- **トナメ大会タイトル欄を追加**：例「JOPT Main Event」「APT Tokyo」など。場所/店舗名と別に記録できる。一覧では大会タイトルが優先表示される
- **リエントリー回数を記録できる**：バイインは「1回分」を入力し、リエントリー回数を ±ボタンで指定。実投資額は自動で `バイイン × (1 + リエントリー回数)` 計算される
- **ノーマネーフィニッシュをワンタップ**：トナメ形式の時、キャッシュアウト欄の下に「○ ノーマネーフィニッシュ」ボタン。1タップで 0 円固定
- **プレイ時間入力を楽に**：1h/2h/3h/4h/6h/8h のプリセットチップを表示、ワンタップで入力。トナメでは「覚えてなくてOK」と明示
- スキーマ更新（Dexie v3 + Supabase `0002_tourney_extras.sql`）。既存データは無傷でアップグレード

## ✅ フェーズ3 で追加した機能（2026-05-20 完成）

- お気に入りカジノのピン留め（★ボタン）+ 新規セッションフォーム上部に常時表示
- CSV インポート（プレビュー付き、エラー行は除外）
- 高度な分析: ゲーム別時給、最長連勝/連敗、トーナメント ROI/ITM 率
- クラウド同期（共有 Supabase / `chip_stack` スキーマ / RLS 完備）
  - メール+パスワードでログイン
  - 「今すぐ同期する」で両方向マージ（cloudId + updatedAt で衝突解決）
  - データはローカル IndexedDB が常に正、クラウドはバックアップ＋複数端末用

## 🚧 未実装（v2 以降）

- 自動同期（現在は手動同期のみ）
- 衝突解決の高度化（現在は updatedAt 比較）
- ライトモード切替
- 友人とのスタッキング管理
- 目標設定機能

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

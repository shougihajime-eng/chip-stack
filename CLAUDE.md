# Casino Ledger（chip-stack）

カジノでの収支を上品に記録する個人プレイヤー向け Web アプリ。

---

## 🟢 進捗（いまここ）

- ✅ 直近で済んだこと: 目玉機能「月の目標＆使いすぎ見守り」を追加 — ホームに今月の目標達成バー＋負けの安心メーター、設定画面で目標を入力、記録の入力画面で1回の負け上限をこえると見守りメッセージ。ビルド・型チェックOK
- 🟡 進行中: なし
- 🔜 次の一歩: 公開（git push → Vercel 自動デプロイ）。任意で /privacy・/terms のアプリ内ページ化

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

## ✅ フェーズ4 で追加した機能（2026-05-26 完成 / 販売・製品化準備）

- **設定ページ `/settings` を新設**（データの安心の中心）
  - バックアップ（保存）: 全記録を JSON ファイルに書き出し。最後の保存日を記録し、7日以上経過 or 未保存なら催促バナー表示
  - 復元（読み込み）: バックアップ JSON を取り込み。既存はそのまま残し、重複（同日・同店舗・同額・同作成日時）は自動スキップする**安全マージ方式**（`importJsonBackup`）
  - すべてのデータを削除: 2段階確認つき（`clearAll`）
  - この端末の記録サマリー（件数・期間）を表示
- **安全＆年齢注意フッター `SiteFooter`** を全画面下部に追加（20歳以上・端末内保存・責任あるプレイ・免責）
- **クラウド画面の「試験運用中」表現を撤廃**し、製品として安心できる文章に刷新
- **ナビゲーション**: スマホ下メニューに「設定」(歯車) を追加（4タブ化）、PC上メニューにも「設定」を追加。`/sessions` のアクティブ判定を精緻化（`/sessions/new` とは別扱い）
- **販売用の文章を `docs/` に用意**: `ストア掲載文.md`（紹介文・キャッチコピー・キーワード）/ `プライバシーポリシー.md` / `ご利用にあたって.md`（年齢・責任あるプレイ・免責）

## ✅ フェーズ5 で追加した機能（2026-05-26 完成 / 目玉機能「月の目標＆使いすぎ見守り」）

- **目標の保存場所**: Dexie に `settings` テーブル（version 4・key-value）を追加。`lib/db/goals.ts` の `getGoals` / `saveGoals` で月間目標を読み書き。既存データは無傷
  - `MonthlyGoals`: `targetJpy`（勝ち目標）/ `monthlyLossCapJpy`（1か月の負け上限・正の値）/ `sessionLossCapJpy`（1回の負け上限・正の値）。すべて `null` 可（決めなくてOK）
- **今月の達成度の計算**: `lib/goals.ts` の `computeGoalProgress(sessions, goals)` が今月の収支・回数・目標達成率・負けの使用量を返す（負け使用量は今月の収支がマイナスのときだけ計上＝勝っていれば0）
- **ホーム `GoalCard`**（`components/home/GoalCard.tsx`）: クイック数値の下に表示
  - 目標達成バー（達成で緑＋お祝い文）/ 使いすぎ見守りメーター（緑→金→赤で負けの上限への近さを表示・こえたら来月へ促す文）
  - 目標が未設定なら「目標を決める」誘導カードを表示（設定への導線）
- **設定 `/settings` に目標入力欄**（`GoalsCard` / `GoalsForm`）: 勝ち目標・1か月の負け上限・1回の負け上限を入力して保存。空欄OK・「すべて空にする」ボタンあり
- **記録の入力画面 `SessionForm` に見守りメッセージ**: 収支プレビューで負けが「1回の負け上限」をこえると、そっと一息を促す文を表示（保存は止めない）
- 注: `npm run lint` は別の既存箇所（為替自動取得 `SessionForm` の FX effect、`lib/supabase/auth.tsx`）で 2 件の指摘が残るが、`npm run build`（本番ビルド・型チェック）は成功。公開に影響なし

## 🚧 未実装（v2 以降）

- 自動同期（現在は手動同期のみ）
- 衝突解決の高度化（現在は updatedAt 比較）
- ライトモード切替
- 友人とのスタッキング管理
- 目標のクラウド同期（現在は端末内 IndexedDB のみ。複数端末で目標を共有したい場合に検討）
- プライバシー/利用規約をアプリ内ページ化（`docs/` の内容を `/privacy`・`/terms` で表示）

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
  settings/                 設定（バックアップ保存・復元・全消去）★フェーズ4
  account/                  クラウド同期（ログイン）
components/
  layout/                   AppShell, BottomNav, SiteFooter（安全＆年齢注意）
  ui/                       Card, Button, Field, Money
  sessions/                 SessionForm, SessionList
  home/                     HomeDashboard
  charts/                   MonthlyChart
lib/
  db/                       Dexie スキーマ・CRUD・バックアップ（exportJson / importJsonBackup）
  currency.ts               通貨定義・JPY 換算
  games.ts                  ゲーム・国の定数
  export.ts                 CSV / JSON 書き出しヘルパー
  utils.ts                  cn ヘルパー・日付フォーマッタ
docs/                       販売用文章（ストア掲載文・プライバシー・ご利用にあたって）★フェーズ4
```

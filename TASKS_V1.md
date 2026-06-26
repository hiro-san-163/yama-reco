# TASKS.md

## hiro-san 山歩きサイト V5 実装タスク

---

## フェーズ1 設計・仕様策定

* README.md 作成
* DIRECTORY_STRUCTURE.md 作成
* DATA_SPEC.md 作成
* V5_SPEC.md 作成
* CODEX_RULES.md 作成
* CODEX_START_PROMPT.md 作成

---

## フェーズ2 リポジトリ準備

* V5リポジトリ作成
* ディレクトリ構成作成
* GitHub Pages設定
* Jekyll動作確認

---

## フェーズ3 データ構造

* records_master.json サンプル作成
* SBrecords.json サンプル作成
* STrecords.json サンプル作成

---

## フェーズ4 md生成設計

* records_master.json → md生成仕様確認
* front matter出力確認
* ファイル名生成確認
* mdサンプル生成
* Jekyllビルド確認

---

## フェーズ5 Layout作成

### default.html

* レイアウト作成
* ヘッダー作成
* フッター作成
* パンくず対応

### record.html

* Layout作成
* front matter表示実装
* 画像表示実装
* キャプション表示実装
* 前後記事ナビ実装

---

## フェーズ6 共通CSS

* style.css作成
* レスポンシブ対応
* PC表示確認
* タブレット表示確認
* スマホ表示確認

---

## フェーズ7 records/index

### データ取得

* site.posts取得

### 一覧表示

* カードレイアウト
* サムネイル表示
* 概要(sm2)表示

### 検索

* area検索
* genre検索
* year検索

### ソート

* 新しい順
* 古い順

### ページネーション

* 実装
* 動作確認

---

## フェーズ8 record.html

### メタ情報

* date_s表示
* date_e表示
* duration表示
* area表示
* genre表示
* members表示
* weather表示

### 本文

* Markdown表示確認

### 画像

* tm表示
* tmfg表示
* gp1表示
* gpfg1表示
* gp2表示
* gpfg2表示
* gp3表示
* gpfg3表示

---

## フェーズ9 logs/index

### JSON読込

* records_master.json
* SBrecords.json
* STrecords.json

### データ統合

* 統合処理実装

### 全文検索

* title検索
* summary検索

### フィルタ

* areaプルダウン
* genreプルダウン
* yearプルダウン
* monthプルダウン

### 一覧表示

* title表示
* date_s表示
* area表示
* genre表示
* members表示
* sm2表示

---

## フェーズ10 その他ページ

### about.html

* ページ作成

### blog.html

* ページ作成
* 仕様確定

### other.html

* ページ作成
* 仕様確定

---

## フェーズ11 将来拡張

### area/index

* 仕様策定
* 実装

### genre/index

* 仕様策定
* 実装

---

## フェーズ12 テスト

### records

* 一覧表示確認
* 検索確認
* ソート確認
* ページネーション確認

### record

* 記事表示確認
* 画像表示確認

### logs

* 全文検索確認
* フィルタ確認
* 複合検索確認

### 共通

* PC確認
* タブレット確認
* スマホ確認

---

## フェーズ13 公開

* GitHub Pages公開
* リンク確認
* 404確認
* パフォーマンス確認

---

# 完了条件

以下を満たした時点でV5完成とする。

* records/index 完成
* record.html 完成
* logs/index 完成
* GitHub Pages公開完了
* PC・タブレット・スマホ動作確認完了

V5_SPEC.md

hiro-san 山歩きサイト V5 仕様書

⸻

概要

V5は GitHub Pages + Jekyll を利用した山行記録サイトである。

データ駆動型設計を採用し、

* records_master.json
* SBrecords.json
* STrecords.json

を中心として運用する。

⸻

データフロー

hiro-san データ

records_master.json

↓

md生成

↓

_posts

↓

site.posts

↓

records/index

↓

record.html

⸻

共同管理データ

SBrecords.json

STrecords.json

↓

JSONのまま利用

↓

logs/index

⸻

ページ構成

主要ページ

* index.html
* records/index.html
* record.html
* logs/index.html
* blog.html
* about.html
* other.html

⸻

将来拡張ページ

* area/index.html
* genre/index.html

⸻

アーキテクチャ概要

V5では用途に応じてデータ取得方法を分離する。

⸻

records系

利用データ

site.posts

用途

* 記事一覧
* 記事検索
* 個別記事表示

⸻

logs系

利用データ

* records_master.json
* SBrecords.json
* STrecords.json

用途

* 横断検索
* 山行データ検索

site.posts は利用しない。

⸻

records/index

目的

山行記録一覧および検索ページ

⸻

データソース

site.posts

⸻

データ取得

Liquidで site.posts を取得する。

⸻

検索

JavaScriptによるクライアントサイド検索を行う。

⸻

検索対象

* title
* area
* genre
* members
* summary

⸻

表示内容

* タイトル
* 山行日
* エリア
* ジャンル
* サムネイル
* 概要

⸻

機能

* キーワード検索
* ソート
* ページネーション

⸻

record.html

目的

山行記事表示ページ

⸻

データソース

front matter

⸻

表示順序

1. パンくず
2. タイトル
3. メタ情報
4. メイン画像
5. 本文
6. 前後記事ナビ

⸻

メタ情報

表示対象

* 山行日
* エリア
* ジャンル
* 同行者
* 天候

⸻

logs/index

目的

全山行データ横断検索

⸻

データソース

* records_master.json
* SBrecords.json
* STrecords.json

⸻

データ取得

JavaScriptでJSONを直接読み込む。

site.posts は利用しない。

⸻

検索

JavaScriptによるクライアントサイド検索を行う。

⸻

検索対象

* title
* area
* genre
* members
* summary

⸻

検索結果表示

* タイトル
* 山行日
* エリア
* ジャンル
* メンバー
* 概要

⸻

blog.html

目的

山行記録以外の記事を表示する。

⸻

状態

仕様策定中

⸻

about.html

目的

サイトおよび運営者紹介ページ

⸻

状態

仕様策定中

⸻

other.html

目的

山行記録以外のコンテンツを表示する。

⸻

状態

仕様策定中

⸻

md生成

元データ

records_master.json

⸻

出力先

_posts

⸻

ファイル名

YYYY-MM-DD-yamareco_url.md

例

2025-08-15-1234567.md

yamareco_urlから記録ID部分を抽出して使用する。

⸻

front matter

records_master.json の各項目を利用する。

詳細は DATA_SPEC.md を参照。

⸻

records_master.json

用途

* md生成元データ
* records/index表示元
* logs/index検索対象

詳細は DATA_SPEC.md を参照。

⸻

SBrecords.json

用途

logs/index専用

⸻

制約

* md化しない
* site.postsへ変換しない

⸻

STrecords.json

用途

logs/index専用

⸻

制約

* md化しない
* site.postsへ変換しない

⸻

共通デザイン方針

対応環境

* PC
* タブレット
* スマートフォン

⸻

CSS

共通CSSを利用する。

ページ単位で必要最小限の追加CSSのみ許可する。

⸻

開発ルール

設計変更は禁止。

既存V5アーキテクチャの範囲で実装すること。

仕様変更が必要な場合は実装を行わず、

* 変更理由
* メリット
* デメリット
* 影響範囲

を提示し提案のみ行うこと。

⸻

最重要ルール

records/index

→ site.posts を利用する

→ JavaScript検索を行う

logs/index

→ site.posts を利用しない

→ records_master.json
→ SBrecords.json
→ STrecords.json

を直接検索する

→ JavaScript検索を行う

SBrecords.json と STrecords.json は md化しない。

このルールはV5アーキテクチャの中核であり変更してはならない。

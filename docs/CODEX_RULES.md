CODEX_RULES.md

hiro-san 山歩きサイト V5 開発ルール

⸻

目的

本ファイルはV5アーキテクチャを保護するための開発ルールである。

Codexは実装を行う際、本ファイルを最優先で参照すること。

⸻

最優先ルール

既存V5アーキテクチャを変更してはならない。

設計変更が必要と思われる場合は実装を行わず、

* 変更理由
* メリット
* デメリット
* 影響範囲

を整理して提案のみ行うこと。

⸻

アーキテクチャ保護

records系

records/index

record.html

は site.posts を利用する。

⸻

records系でJSON直接検索へ変更してはならない。

⸻

logs系

logs/index

は以下を直接検索する。

* records_master.json
* SBrecords.json
* STrecords.json

⸻

logs系を site.posts 化してはならない。

⸻

データフロー保護

以下の構造を変更してはならない。

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

以下の構造を変更してはならない。

SBrecords.json

STrecords.json

↓

JSONのまま利用

↓

logs/index

⸻

JSONデータ保護

records_master.json はV5の基幹データである。

⸻

既存項目名変更禁止

⸻

既存項目削除禁止

⸻

新規項目追加は可能

ただし

* DATA_SPEC.md
* V5_SPEC.md

を更新すること

⸻

md生成ルール

records_master.json から md を生成する。

⸻

生成先

_posts

⸻

ファイル名

YYYY-MM-DD-yamareco_url.md

⸻

ファイル名生成ルールを変更してはならない。

⸻

検索ルール

records/index

データソース

site.posts

⸻

検索方式

JavaScriptによるクライアントサイド検索

⸻

検索対象

* title
* area
* genre

⸻

members を検索対象に追加してはならない。

⸻

summary を検索対象に追加してはならない。

⸻

logs/index

データソース

* records_master.json
* SBrecords.json
* STrecords.json

⸻

全文検索対象

* title
* summary

⸻

プルダウン検索対象

* area
* genre
* year
* month

⸻

members を検索対象に追加してはならない。

⸻

year と month は date_s から生成する。

⸻

ページ構成保護

現在の主要ページ

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

既存ページ構造を変更してはならない。

⸻

技術制約

GitHub Pages標準環境で動作すること。

⸻

Jekyll標準機能を優先すること。

⸻

禁止事項

以下は禁止する。

⸻

フォルダ構成変更

⸻

データ構造変更

⸻

不要なライブラリ追加

⸻

フレームワーク導入

⸻

プラグイン依存実装

⸻

データ重複生成

⸻

SBrecords.json の md化

⸻

STrecords.json の md化

⸻

logs/index の site.posts 化

⸻

records/index の JSON直接検索化

⸻

実装前ルール

実装前に必ず説明すること。

⸻

変更対象

⸻

変更内容

⸻

影響範囲

⸻

変更ファイル一覧

⸻

提案ルール

既存設計と異なる提案を行う場合は

必ず

【設計変更提案】

として明示すること。

⸻

以下を提示すること。

* 提案内容
* メリット
* デメリット
* 影響範囲

⸻

ユーザーの承認なしに実装してはならない。

⸻

最終原則

V5は設計優先で開発する。

Codexは設計を変更する権限を持たない。

Codexの役割は、確定済み設計を実装することである。

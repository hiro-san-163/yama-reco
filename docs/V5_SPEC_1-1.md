V5_SPEC.md

改訂日：2026-06-24
Version：Ver.1.1

⸻

hiro-san 山歩きサイト V5 仕様書

V5アーキテクチャ原則

V5は GitHub Pages + Jekyll を利用した山行記録サイトである。

本システムは、表示用途ごとにデータソースを明確に分離するデータ駆動型アーキテクチャを採用する。

records系

* site.posts を唯一のデータソースとする。
* records_master.json を直接参照してはならない。
* 山行記事一覧および個別記事を表示する。

logs系

* records_master.json
* SBrecords.json
* STrecords.json

以上3つのJSONを直接利用する。

* site.posts は利用しない。
* 横断検索・山行データ検索を担当する。

JSONデータの役割

データ	用途
records_master.json	hiro-san 山行データのマスターデータ
SBrecords.json	SilverBoy 山行データ
STrecords.json	ショウタン 山行データ

Markdown生成

Markdown化の対象は records_master.json のみとする。

SBrecords.json および STrecords.json は Markdownへ変換しない。

最重要ルール

* records/index は site.posts を利用する。
* logs/index は JSON を直接検索する。
* records系と logs系のデータソースを混在させない。
* この設計は V5 の中核仕様であり、変更してはならない。

⸻

概要

V5は GitHub Pages + Jekyll により構築する山行記録サイトである。

データ駆動型設計を採用し、以下の3つのJSONファイルを中心に運用する。

* records_master.json
* SBrecords.json
* STrecords.json

用途ごとにデータ取得方法を分離し、保守性・拡張性・実装の単純化を実現する。

⸻

データフロー

hiro-san データ

records_master.json
        │
        ▼
 Markdown生成
        │
        ▼
     _posts
        │
        ▼
   site.posts
        │
        ├── records/index
        └── record.html

⸻

共同管理データ

records_master.json
SBrecords.json
STrecords.json
        │
        ▼
   JSONを直接利用
        │
        ▼
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

将来拡張ページ

* area/index.html
* genre/index.html

これらのページについても、本仕様書で定義するV5アーキテクチャ原則に従って実装する。

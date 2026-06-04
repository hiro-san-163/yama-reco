DATA_SPEC.md

hiro-san 山歩きサイト V5 データ仕様書

⸻

概要

V5では山行データをJSONで管理する。

主データは records_master.json とし、個別記事(md)生成の元データとして利用する。

外部協力者データとして SBrecords.json および STrecords.json を利用する。

⸻

データファイル一覧

records_master.json

hiro-san の山行データ。

用途

* md生成元データ
* records/index表示元
* logs/index検索対象

⸻

SBrecords.json

silverboyさんの山行データ。

用途

* logs/index検索対象

制約

* md生成しない
* site.postsへ変換しない

⸻

STrecords.json

ショウタンさんの山行データ。

用途

* logs/index検索対象

制約

* md生成しない
* site.postsへ変換しない

⸻

records_master.json スキーマ

{
  "date_s": "",
  "date_e": "",
  "duration": "",
  "record_id": "",
  "title": "",
  "area": "",
  "genre": "",
  "members": "",
  "weather": "",
  "course_time": "",
  "course_note": "",
  "summary": "",
  "sm2": "",
  "yamareco_url": "",
  "map": "",
  "tm": "",
  "tmfg": "",
  "gp1": "",
  "gpfg1": "",
  "gp2": "",
  "gpfg2": "",
  "gp3": "",
  "gpfg3": "",
  "slug": ""
}

⸻

項目定義

date_s

型

string

形式

YYYY-MM-DD

説明

山行開始日

⸻

date_e

型

string

形式

YYYY-MM-DD

説明

山行終了日

日帰りの場合は date_s と同じ値を設定する。

⸻

duration

型

string

説明

山行期間

例

* 日帰り
* 1泊2日
* 2泊3日

⸻

record_id

型

string

説明

レコード識別ID

⸻

title

型

string

説明

山行タイトル

⸻

area

型

string

説明

山域・エリア名

⸻

genre

型

string

説明

山行ジャンル

⸻

members

型

string

説明

同行者

⸻

weather

型

string

説明

天候

⸻

course_time

型

string

説明

コースタイム

⸻

course_note

型

string

説明

コースに関する補足情報

⸻

summary

型

string

説明

山行記録の全文検索用テキスト

logs/index の全文検索対象として利用する。

一覧表示には利用しない。

⸻

sm2

型

string

説明

山行概要

records/index および logs/index の一覧表示に利用する。

⸻

yamareco_url

型

string

説明

ヤマレコ記録URL

⸻

map

型

string

説明

地図URLまたは地図情報

⸻

tm

型

string

説明

メイン画像パス

⸻

tmfg

型

string

説明

メイン画像キャプション

⸻

gp1

型

string

説明

ギャラリー画像1

⸻

gpfg1

型

string

説明

ギャラリー画像1キャプション

⸻

gp2

型

string

説明

ギャラリー画像2

⸻

gpfg2

型

string

説明

ギャラリー画像2キャプション

⸻

gp3

型

string

説明

ギャラリー画像3

⸻

gpfg3

型

string

説明

ギャラリー画像3キャプション

⸻

slug

型

string

説明

URL生成用スラッグ

⸻

md生成ルール

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

records_master.json の全項目をfront matterへ出力する。

⸻

利用ルール

records/index

利用データ

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

一覧表示

* title
* date_s
* area
* genre
* tm
* sm2

⸻

record.html

利用データ

front matter

⸻

logs/index

利用データ

* records_master.json
* SBrecords.json
* STrecords.json

site.posts は利用しない。

JavaScriptでJSONを直接検索する。

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

year

date_s から生成する。

⸻

month

date_s から生成する。

⸻

一覧表示

* title
* date_s
* area
* genre
* members
* sm2

⸻

データ管理ルール

records_master.json はV5の基幹データである。

⸻

既存項目名の変更は禁止。

⸻

既存項目の削除は禁止。

⸻

新規項目追加は可能。

ただし追加時は

* DATA_SPEC.md
* V5_SPEC.md

を同時に更新すること。

⸻

最重要ルール

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

SBrecords.json

STrecords.json

↓

JSONのまま利用

↓

logs/index

⸻

SBrecords.json と STrecords.json は md化しない。

site.postsへ変換しない。

この構造はV5アーキテクチャの中核であり変更してはならない。

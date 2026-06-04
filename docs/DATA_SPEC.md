DATA_SPEC.md

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

注意

* md生成しない
* site.postsへ変換しない

⸻

STrecords.json

ショウタンさんの山行データ。

用途

* logs/index検索対象

注意

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

山行日数

例

日帰り

1泊2日

2泊3日

⸻

record_id

型

string

説明

山行識別ID

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

山域・エリア

⸻

genre

型

string

説明

ジャンル分類

例

* 日帰り登山
* テント泊
* 小屋泊
* 縦走

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

コース補足情報

⸻

summary

型

string

説明

感想本文

/logs\indexで全文検索の対象データ

⸻

sm2

型

string

説明

山行概要

一覧表示や検索結果にも利用する。

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

代表画像

Thumbnail Main

⸻

tmfg

型

string

説明

代表画像フラグ

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

ギャラリー画像1フラグ

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

ギャラリー画像2フラグ

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

ギャラリー画像3フラグ

⸻

slug

型

string

説明

記事URL生成用スラッグ

⸻

md生成ルール

records_master.json から md ファイルを生成する。

生成先

_posts/

ファイル名形式

YYYY-MM-DD-slug.md

例

2025-08-15-tsubakurodake.md

⸻

利用ルール

records/index

利用データ

site.posts

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

開発ルール

records_master.json の項目名はV5の基本データ構造である。

既存項目名の変更は禁止。

項目追加は可能だが、既存機能への影響を確認した上で実施すること。

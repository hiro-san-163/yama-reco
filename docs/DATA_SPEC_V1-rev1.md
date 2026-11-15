DATA_SPEC.md

改訂日：2026-06-24 Version：Ver.1(Rev1)
       2026-07-23 Version：Ver.1(Rev2)
       2026-11-15 Version：Ver.1(Rev3)

# hiro-sanの山歩きサイト V5 データ仕様書

⸻

## 概要

hiro-san の山行データの正本は `records_master.xlsx` とする。`records_master.json` は Excel 正本から作成する派生データで、サイトの検索および Markdown 生成に利用する。

山行データの追加・修正は Excel 正本に対して行い、JSON や Markdown を正本として直接編集しない。

Excel→JSON 変換は `excel_to_json.py` で行う。JSON→Markdown の生成スクリプトは現在のリポジトリ内では確認できていない。

外部協力者データとして SBrecords.json および STrecords.json を利用する。

⸻

### データファイル一覧

records_master.xlsx

hiro-san の山行データを管理する唯一の正本（Single Source of Truth）。

⸻

records_master.json

records_master.xlsx から作成する派生データ。

用途

* Markdown生成用データ
* logs/index検索対象

records/index および record.html は、この JSON から生成された Markdown（site.posts）を利用する。

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

## records_master.json スキーマ

{
  "date_s": "",
  "date_e": "",
  "duration": 1,
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
}

上記はJSONの項目構成を示す。`duration` の `1` は整数型の例であり、実際の保存値は各山行の日数とする。

⸻

## 項目定義

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

### duration  rev2

**ExcelおよびJSONでの型**

整数

**説明**

山行日数を整数で保持する。1以上の値を使用する。

表示時は表示仕様に従って山行期間へ変換する。

**保存値**

* 1 … 日帰り
* 2 … 1泊2日
* 3 … 2泊3日
* n … n日間の山行

**表示仕様**

| 保存値    | 表示       |
| ------ | -------- |
| 1      | 日帰り      |
| 2      | 1泊2日     |
| 3      | 2泊3日     |
| n（2以上） | （n-1）泊n日 |

**備考**

この表示仕様は `record.html` および `logs.js` など、山行期間を表示するすべての画面で共通とする。

ExcelおよびJSONでは数値として保持し、表示時に変換を行う。MarkdownのFront Matterでは既存のLiquidテンプレートとの互換性を保つため、`duration` を引用符付き文字列として出力する。

⸻

record_id

型

string

説明

レコード識別ID

山行を一意に識別するID。通常はヤマレコ記録IDを格納する。

mdファイル名に利用する　yyyy-mm-dd-[レコード識別ID]

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

logs/index の抽出カードの山行概要に冒頭100字程度を引用する。

⸻

sm2

型

string

説明

山行概要

sumarryを200字前後に要約したもの

records/index および record の一覧表示に利用する。

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

地図表示に利用するURL

⸻

tm

型

string

説明

メイン画像のurl

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

ギャラリー画像1のurl

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

ギャラリー画像2のurl

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

ギャラリー画像3のurl

⸻

gpfg3

型

string

説明

ギャラリー画像3キャプション

⸻

## md生成ルール

元データ

records_master.json

⸻

出力先

_posts

⸻

ファイル名

mdファイル名は date_s と record_id を使用する。

YYYY-MM-DD-[record_id].md

例

2025-08-15-1234567.md

yamareco_urlから記録ID部分を抽出して使用する。

⸻

front matter

records_master.json の全項目を front matter へ出力する。
あわせて固定値として layout: record および tags: 山行記録 を付加する。

JSONの整数項目 `duration` は、既存のHOMEページのLiquid分岐との互換性を保つため、Markdownでは引用符付き文字列として出力する。

⸻

## 利用ルール

records/index

## 利用データ

site.posts

⸻

## 検索方式

JavaScriptによるクライアントサイド検索

⸻

## プルダウン検索対象

* area
* genre
* year

⸻

year

date_s から生成する。

⸻

## 一覧表示

* title
* date_s
* area
* genre
* tm
* sm2

⸻

## record.html

利用データ

front matter

⸻

## logs/index

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

## データ管理ルール

records_master.xlsx はV5の基幹データである。山行データの新規追加はこの Excel 正本に対して行う。登録済み記録の訂正・更新は今回の運用範囲外とし、別途確認・承認を得る。

records_master.json は Excel 正本から作成する派生データであり、records/index・record.html 用の Markdown 生成と logs/index 検索に利用する。

Excel→JSON 変換は `excel_to_json.py` で行う。JSON→Markdown の自動生成処理は現状のリポジトリ内では確認できていない。変換後は正本との整合性を確認し、承認された手順で各派生データを更新する。

## 現状と運用範囲（As-Is / To-Be）

### 現状（2026-11-15確認）

* `records_master.xlsx` は名前付き23項目、441件の山行データを持つ正本である。空行および空見出しの列があるため、変換時は無視する。
* `records_master.json` は正本と同じ441件・23項目に更新済みで、`record_id` は全件一意、スキーマ外の `"None"` 項目は含まない。
* 山行記録のMarkdown投稿は441件あり、JSONの各記録IDに対応する投稿がある。復元した13件はJSONとの一致を確認済みである。
* 投稿側だけにあった空の `slug` 9件は削除済みである。
* 既存投稿とJSONの値の差が4件残っている。`map` は `9714193`、`9720749`、`9696034` の3件、`title` は `5851831` の1件である。内容の確認は未了のため、これらの既存投稿はJSONに合わせて自動修正しない。

### 今回の運用範囲

* 今回のデータ追加フローは新規山行記録の追加を対象とする。登録済み記録の訂正・更新は対象外とし、別途確認・承認を得る。
* ヤマレコからの取得、AIによる項目整理・概要作成、写真・コメント・地図URLのExcel入力は手動で行う。
* ExcelからJSONへの変換と形式検証は `excel_to_json.py` で行う。生成先は既定で `data/records_master.generated.json` とし、本番JSONを自動上書きしない。
* 生成JSONの内容・件数・IDを確認し、承認後に `data/records_master.json` へ反映する。
* 新規IDのMarkdown投稿は既存ファイルを上書きせずに追加する。JSONからMarkdownを生成する自動処理は未実装のため、現状はこの工程を自動化済みと扱わない。
* Jekyllのビルドと、JSONの全IDに対応する投稿が存在することを確認してから公開する。GitHubへの反映は手動で行う。

#### Excel→JSON変換の実行

初回またはPython環境を再構築したときは、プロジェクトのルートで依存パッケージをインストールする。

```powershell
python -m pip install -r requirements.txt
```

変換を実行する。

```powershell
python excel_to_json.py
```

既定では `data/records_master.generated.json` に出力する。既存の `data/records_master.json` は上書きしない。出力内容を確認してから、承認された手順で本番用JSONを更新する。入力・出力先を変える場合は `--input` と `--output` を指定する。

### Excel→JSON変換時の取扱い

* 仕様で定義された名前のある列だけを読み込む。見出しが空の列は読み飛ばし、JSONに `None` などのキーを作らない。
* 全項目が空の行は読み飛ばす。データがあるのに `record_id` が空の行、または `record_id` が重複する場合はエラーとして扱い、生成を完了しない。
* `record_id` は文字列として保持する。先頭のゼロを含むIDも数値に変換しない。
* `duration` はExcel・JSONとも整数とし、Markdown Front Matterでは引用符付き文字列として出力する。
* 文字列項目の空セルはJSONで空文字列 `""` とする。`null` への置換や、空値の自動補完は行わない。
* 変換対象となる項目は本書のスキーマに限定し、書式設定だけがある余分な行・列をデータとして扱わない。

旧版の `records_master.json` には全レコードにスキーマ外の `"None": ""` 項目が含まれていた。この項目は正本Excelの定義列に存在しないため、`excel_to_json.py` は出力しない。仕様書や変換処理の更新のみでは既存JSONを変更しない。

⸻

## 既存項目名の変更は禁止。

⸻

## 既存項目の削除は禁止。

⸻

## 新規項目追加は可能。

ただし追加時は

* DATA_SPEC.md
* V5_SPEC.md

を同時に更新すること。

⸻

# 最重要ルール

records_master.xlsx

↓

Excel→JSON変換

↓

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

records/index は site.posts を利用する。

logs/index は JSON を直接検索する。

SBrecords.json と STrecords.json は md化しない。

site.postsへ変換しない。

この構造はV5アーキテクチャの中核であり変更してはならない。

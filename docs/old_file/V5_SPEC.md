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

records_master.json

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

記事一覧
記事絞り込み
個別記事表示

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

山行記録一覧および絞り込みページ

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

表示内容

* タイトル
* 山行日
* エリア
* ジャンル
* サムネイル
* 概要

⸻

機能

エリア絞り込み
ジャンル絞り込み
年絞り込み
ページネーション

⸻

record.html

目的

山行記事表示ページ

⸻

データソース

front matter

⸻

メタ情報

表示対象

* 山行日
* エリア
* ジャンル
* 同行者
* 天候

⸻

record.html は
Markdown本文を主コンテンツとしない。

主な表示内容は front matter の情報と画像である。

詳細な山行記録は yamareco_url への導線で提供する。

⸻


## record.html 表示仕様

### 基本方針

record.html は Markdown本文を主コンテンツとしない。

主な表示内容は front matter の情報および画像とする。

詳細な山行記録は `yamareco_url` への導線によって提供する。

---

### 表示項目

#### メタ情報

* title
* date_s
* date_e
* duration
* area
* genre
* members
* weather

#### メイン表示

* tm
* tmfg
* sm2

#### コース情報

* course_time
* course_note

#### フォトギャラリー

* gp1
* gpfg1
* gp2
* gpfg2
* gp3
* gpfg3

#### 外部リンク

* yamareco_url
* map

#### ナビゲーション

* 前の記事
* records一覧へ戻る
* 次の記事

---

### 表示順序

1. パンくず
2. タイトル
3. メタ情報
4. メイン画像（tm）
5. メイン画像キャプション（tmfg）
6. 山行概要（sm2）
7. コース情報（course_time / course_note）
8. フォトギャラリー
9. 外部リンク（yamareco_url / map）
10. ナビゲーション

---

### 空データの扱い

以下のルールを適用する。

* データが存在しない項目は表示しない
* 空欄項目のラベルのみを表示しない
* 画像が存在しない場合は該当画像ブロックを表示しない
* キャプションが存在しない場合はキャプションを表示しない
* ギャラリー画像が存在しない場合はフォトギャラリーセクション全体を表示しない

---

### ワイヤーフレーム

パンくず

タイトル

メタ情報

メイン画像

メイン画像キャプション

山行概要

コース情報

フォトギャラリー

外部リンク

ナビゲーション

---

### 備考

record.html は山行データシートとして機能する。

Jekyll の Markdown本文（{{ content }}）は主コンテンツとして利用しない。

山行の詳細閲覧は yamareco_url を利用する。

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

# logs/index 仕様

## 目的

logs/index は山行データ検索ページとする。

records/index が写真付き一覧ページであるのに対し、logs/index はテキスト主体の検索・閲覧ページとして位置付ける。

---

## データソース

以下のJSONファイルを直接読み込む。

* records_master.json
* SBrecords.json
* STrecords.json

site.posts は利用しない。

---

## 検索対象

### キーワード検索

対象項目

* title
* summary

---

## 絞り込み条件

プルダウン選択

* area
* genre
* year
* month

---

## 検索方式

検索条件入力後に検索ボタンを押して検索を実行する。

リアルタイム検索は採用しない。

---

## 初期表示

ページアクセス時は全件表示とする。

---

## 並び順

date_s 降順固定

新しい山行記録を先頭に表示する。

ソート変更機能は設けない。

---

## ページネーション

records/index と共通仕様とする。

### 初期表示件数

20件

### 表示件数変更

5件～50件

5件刻み

---

## 検索フォーム

### 項目

* キーワード入力
* area
* genre
* year
* month
* 検索ボタン

### レイアウト

PC

```text
キーワード

[________________________]

エリア[▼] ジャンル[▼] 年[▼] 月[▼]

[検索]
```

スマホ

横幅に応じて自動折返しとする。

---

## 検索結果ヘッダー

### 初期表示

```text
検索結果：◯◯件 / 全件表示
```

### 検索実行後

```text
検索結果：◯◯件

条件：
北アルプス ｜ 縦走 ｜ 2025年
```

### 表示ルール

未指定項目は表示しない。

例

```text
条件：
槍ヶ岳 ｜ 北アルプス
```

---

## 検索結果表示

### 表示形式

一覧型

---

### 表示項目

#### 1行目

タイトル

---

#### 2行目

* 山行日
* 山域(area)
* ジャンル
* データ種別

PCでは横並び表示とする。

横幅不足時は改行可。

例

```text
2025-10-12　北アルプス　縦走　hiro-san
```

---

#### 3行目

summary の先頭約100文字を表示する。

例

```text
北穂高岳から涸沢岳へ向かう。天候にも恵まれ稜線歩きを満喫した・・・
```

---

## データ種別

表示例

* hiro-san
* SilverBoy
* ショウタン

JSONには保持しない。

検索時にデータソースから判定して付与する。

---

## リンク仕様

検索結果全体をクリック可能とする。

クリック時は対象レコードの yamareco_url へ遷移する。

個別記事ページ(record.html)への遷移は行わない。

---

## レスポンシブ対応

### PC

```text
タイトル

2025-10-12　北アルプス　縦走　hiro-san

summary先頭100文字
```

### スマホ

```text
タイトル

2025-10-12
北アルプス / 縦走
hiro-san

summary先頭100文字
```

スマホでは可読性を優先し、情報を適切に改行して表示する。

⸻

## records/index 表示仕様

### 基本方針

records/index は site.posts を利用した山行一覧ページとする。

データソースは site.posts のみとし、records_master.json を直接検索してはならない。

検索・絞り込みは JavaScript によりクライアントサイドで実施する。

---

### データソース

* site.posts

データ生成フロー

records_master.json

↓

md生成

↓

_posts

↓

site.posts

↓

records/index

---

### カード表示項目

各山行カードには以下を表示する。

* tm（サムネイル画像）
* title
* date_s
* area
* genre
* sm2

---

### カード表示順

1. サムネイル画像（tm）
2. タイトル（title）
3. 山行日（date_s）
4. エリア（area）
5. ジャンル（genre）
6. 山行概要（sm2）

---

### 絞り込み対象

* area
* genre
* date_s（年）

---

### 絞り込み対象外

* title
* members
* summary
* weather
* course_time
* course_note

---

### 検索UI

以下の絞り込みUIを設置する。

#### エリア選択

対象

* area

プルダウンの選択肢は site.posts から生成する。

#### ジャンル選択

対象

* genre

プルダウンの選択肢は site.posts から生成する。

#### 年選択

対象

* date_s

date_s から年を抽出してプルダウンを生成する。

プルダウンの選択肢は site.posts から生成する。

---

### 並び順

標準並び順は以下とする。

* date_s 降順（新しい順）

---

### ページネーション

初期表示件数

* 20件

表示件数変更

以下の件数を選択可能とする。

* 5件
* 10件
* 15件
* 20件
* 25件
* 30件
* 35件
* 40件
* 45件
* 50件

5件刻みで変更可能とする。

---

### 空データの扱い

以下のルールを適用する。

* データが存在しない項目は表示しない
* サムネイル画像が存在しない場合は画像領域を表示しない
* sm2 が空欄の場合は概要を表示しない

---

### ワイヤーフレーム

絞り込みエリア

* エリア選択
* ジャンル選択
* 年選択
* 表示件数選択

↓

山行カード一覧

* サムネイル
* タイトル
* 山行日
* エリア
* ジャンル
* 山行概要

↓

ページネーション

---

### 備考

records/index は山行データベースの入口ページとして機能する。

records/index では全文検索を行わない。

山行タイトルや概要文の検索は logs/index が担当する。

プルダウンの選択肢は固定値を使用せず、site.posts のデータから動的生成する。

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

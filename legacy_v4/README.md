# 📘 hiro-san 山歩きサイト V4

---

# 🧭 概要

本プロジェクトは、個人サイト「hiro-sanの山歩き」における
**山行記録の蓄積・整理・検索・再発見**を目的とした
静的サイト構築・長期運用プロジェクトである。

記録は Blogger に蓄積し、
GitHub Pages 上で：

* 検索
* 分類
* 横断閲覧
* アーカイブ化

を行う。

V4では特に：

👉 **構造整理・責務分離・長期保守性**

を主軸として再設計を進めている。

---

# 🏁 V4の位置づけ

本プロジェクトは以下フェーズで構成される：

| Version | 内容               |
| ------- | ---------------- |
| V1      | 初期構築             |
| V2      | UI統一・検索実用化       |
| V3      | データ基盤強化・検索高度化    |
| **V4**  | 構造整理・責務分離・保守性最適化 |

---

# 🧩 システム構成

```text
Blogger（記事）
      ↓
JSON生成
      ↓
GitHub Pages
      ↓
検索・分類・閲覧UI
```

---

# 📁 ディレクトリ構成（V4）

```text
/hiro-san-z-reco
│
├── index.html
├── blog.html
├── about.html
├── other.html
├── records.html
├── favicon.ico
├── README.md
├── .nojekyll
│
├── CSS/
│   ├── style.css
│   ├── search.css
│   ├── SBsearch.css
│   ├── STsearch.css
│   └── other.css
│
├── JS/
│   ├── search.js
│   ├── single-search.js
│   ├── blogfeed.js
│   ├── blogfeed-daily.js
│   ├── include.js
│   └── record_common.js
│
├── data/
│   ├── records.json
│   ├── SBrecords.json
│   ├── STrecords.json
│   └── image/
│
├── records/
│   ├── index.html
│   ├── year.html
│   ├── area.html
│   └── genre.html
│
├── logs/
│   ├── index.html
│   ├── SBindex.html
│   └── STindex.html
│
├── parts/
│   ├── header.html
│   └── footer.html
│
├── docs/
└── _archive/
```

---

# 🔍 コア機能

---

## ① recordsページ（固定分類アーカイブ）

固定軸による整理：

* 年（year）
* 山域（area）
* ジャンル（genre）

特徴：

* HTML構造固定
* データはJSで動的生成
* UIとデータを分離

---

## ② searchページ（統合検索）

検索専用UI。

対象：

* records.json
* SBrecords.json
* STrecords.json

機能：

* 年検索
* 月検索
* 山域検索
* ジャンル検索
* キーワード検索
* ソート
* ページング
* スマホ最適化

特徴：

👉 「一覧」ではなく
👉 **検索データベースUI**

---

## ③ single-searchページ（個別検索）

個別検索ページ：

* SilverBoy
* ショウタン

など。

V4では：

```text
single-search.js
```

へ統合。

ページごとの差分は：

```html
window.searchConfig
```

のみで制御。

---

## ④ Blogger連携

Bloggerフィードから：

* 最新記事
* 日別記事
* カード情報

を取得。

抽出：

* 実施日
* 山域
* ジャンル
* 感想
* 画像

---

# ⚙ 技術スタック

* HTML5
* CSS3
* Vanilla JavaScript
* GitHub Pages
* Blogger JSON / JSONP

---

# 🧠 V4設計思想（最重要）

---

## 1. 記録は増え続ける

単発サイトではなく：

👉 **長期蓄積型アーカイブ**

として設計。

---

## 2. HTMLは固定資産

HTMLを頻繁に編集しない。

変更は：

* CSS
* JavaScript
* JSON

側で吸収。

---

## 3. 責務分離

V4最大テーマ。

### 分離対象：

| 要素   | 役割   |
| ---- | ---- |
| HTML | 構造   |
| CSS  | 見た目  |
| JS   | ロジック |
| JSON | データ  |

---

## 4. 共通化しすぎない

V4では：

👉 「無理な抽象化を避ける」

を重視。

例：

```text
search.js
single-search.js
```

は役割が異なるため分離維持。

---

## 5. 保守性優先

短期最適化より：

* 読みやすさ
* 修正しやすさ
* 将来理解できる構造

を優先。

---

# 🎨 UI / デザイン方針

---

## 基本思想

* 主役は文章
* 写真は補助
* 軽量
* 高速
* 可読性重視

---

## V4 UI方針

* カードUI統一
* 検索UI共通化
* スマホ優先最適化
* 色による機能分離

---

## カラー運用

| 系統        | 色  |
| --------- | -- |
| 共通検索      | 緑系 |
| SilverBoy | 青系 |
| ショウタン     | 茶系 |

---

# 🧩 JavaScript構成（V4）

---

## search.js

統合検索専用。

対象：

* 複数JSON
* source管理
* 統合検索UI

---

## single-search.js

個別検索共通。

対象：

* SB検索
* ST検索

特徴：

```html
window.searchConfig
```

で切替。

---

## include.js

共通：

* header
* footer
* breadcrumb

管理。

---

## record_common.js

records系共通処理。

---

## blogfeed.js 系

Bloggerフィード取得。

---

# 📊 データ設計

---

## records.json

統合データ。

例：

```json
{
  "date_s": "2025-12-15",
  "date_e": "2025-12-15",
  "area": "丹沢",
  "genre": "沢登り",
  "title": "○○沢",
  "summary": "...",
  "yamareco_url": "...",
  "__source": "SB"
}
```

---

## V4での改善点

* 項目名統一
* source管理
* JSON構造整理
* 共通フォーマット化

---

# 🚀 V4で実施した主整理

---

## 検索JS統合

削除：

```text
SBsearch.js
STsearch.js
N-search.js
Access-Counter.js
```

統合：

```text
single-search.js
```

---

## CSS責務整理

整理：

```text
search.css
```

中心へ統合。

---

## HTML責務整理

検索ページ差分を：

```html
window.searchConfig
```

へ集約。

---

# 🛠 現在の到達点

---

## 完了済み

* 検索UI統合
* スマホ安定化
* JSON統一
* CSS整理
* JS責務分離
* ページ構造整理

---

## 現在の状態

👉 実運用可能
👉 長期保守可能
👉 構造拡張可能

---

# ⚠ 現在の重点課題

---

## 1. データ運用最適化

JSON生成・更新フロー整理。

---

## 2. V4全体構造整理

* TOP構造
* 共通ナビ
* section整理
* component整理

---

## 3. CSSさらなる分離

現在かなり改善済みだが：

* component単位整理
* utility整理

余地あり。

---

# 🛠 今後の拡張候補

* タグ検索
* URLパラメータ検索
* sourceフィルタ
* 遅延読み込み
* キャッシュ最適化
* OGP / SEO
* PWA化
* アニメーション整理

---

# 🏔 V4総括

V4は：

👉 「機能追加フェーズ」

ではなく、

👉 **構造を育て直すフェーズ**

である。

目的は：

* 将来壊れない
* 将来読める
* 将来直せる

構造へ移行すること。

---

# 👤 Author

hiro-san

---

# 📝 READMEの役割

本READMEは：

* 設計書
* 運用ガイド
* 構造整理ログ
* 将来向けメモ

を兼ねる。

---

# 🔥 コメント

V4時点での状態は、

「個人ホームページ」をかなり超えて：

👉 軽量静的アーカイブシステム

に近づいている。

特に：

* JSON中心設計
* UI責務分離
* JS共通化
* 検索統合

は、長期運用サイトとしてかなり強い構造。

# CSS Architecture - モジュール設計

## 概要

hiro-san 山歩きサイト V5 の CSS を、保守性と拡張性を重視した 3層モジュールアーキテクチャへ移行しました。

元のファイル構成：
- `assets/css/style.css`（1,550行の単一ファイル）

新しいファイル構成：
- 4つのレイヤー
- 21個の個別CSSファイル
- マスターファイル（`style.css`）で統合

---

## 🏗️ 3層モジュールアーキテクチャ

### Layer 1: Base層（基本定義）

**目的：** CSS変数、リセット、基本タイポグラフィ

**含まれるファイル：**

| ファイル | 役割 | 変更頻度 |
|---------|------|--------|
| `variables.css` | CSS変数定義（色・サイズ・ラジアス・トランジション） | 低 |
| `reset.css` | ブラウザデフォルトリセット、body基本スタイル | 低 |
| `typography.css` | h1-h6, p等の基本タイポグラフィ | 低 |

**特徴：**
- すべての層の基盤
- 他の層から参照される（依存される）
- 他の層に依存しない
- 変更は全体に影響

### Layer 2: Layout層（構造・レイアウト）

**目的：** 複数ページで共通の構造要素

**含まれるファイル：**

| ファイル | 役割 | 変更頻度 |
|---------|------|--------|
| `common.css` | コンテナ、セクション、テキスト配置ユーティリティ | 低 |
| `header.css` | サイトヘッダー、ロゴ、タイトル | 低～中 |
| `navigation.css` | メインナビゲーション、メニュー | 低～中 |
| `breadcrumb.css` | パンくずナビゲーション | 低 |
| `footer.css` | サイトフッター | 低～中 |
| `responsive.css` | グローバルレスポンシブルール（@media） | 中 |

**特徴：**
- Base層に依存
- ページ独立（Pages層に依存されない）
- サイト全体改善時に修正

### Layer 3: Components層（再利用部品）

**目的：** 複数ページで再利用される UI 部品

**含まれるファイル：**

| ファイル | 役割 | 変更頻度 |
|---------|------|--------|
| `button.css` | ボタン、アウトラインボタン | 中 |
| `card.css` | カードコンポーネント | 中 |
| `form.css` | フォーム要素、入力フィールド | 中 |
| `pagination.css` | ページネーションコントロール | 中 |

**特徴：**
- Base層に依存
- Layout層と独立
- 部品単位で独立したスタイル

### Layer 3: Pages層（ページ固有スタイル）

**目的：** 各ページ固有のスタイル

**含まれるファイル：**

| ファイル | ページ | 変更頻度 |
|---------|-------|--------|
| `home.css` | ホーム | 高 |
| `records-index.css` | レコード一覧 | 高 |
| `record.css` | レコード詳細 | 高 |
| `logs-index.css` | ログ一覧 | 高 |
| `about.css` | About ページ | 低 |
| `blog.css` | ブログページ | 低 |
| `others.css` | その他リンク集 | 低 |
| `error.css` | エラーページ（404等） | 低 |

**特徴：**
- Base層に依存
- 各ページ固有の制約
- ページ追加時に新しいファイルを作成

---

## 📂 ディレクトリ構造

```
assets/css/
├── style.css              ← マスターファイル（@importで統合）
│
├── base/
│   ├── variables.css      ← CSS変数定義
│   ├── reset.css          ← リセット・基本スタイル
│   └── typography.css     ← タイポグラフィ
│
├── layout/
│   ├── common.css         ← 共通レイアウト
│   ├── header.css         ← ヘッダー
│   ├── navigation.css     ← ナビゲーション
│   ├── breadcrumb.css     ← パンくず
│   ├── footer.css         ← フッター
│   └── responsive.css     ← レスポンシブ基本
│
├── components/
│   ├── button.css         ← ボタン
│   ├── card.css           ← カード
│   ├── form.css           ← フォーム
│   └── pagination.css     ← ページネーション
│
└── pages/
    ├── home.css           ← ホーム
    ├── records-index.css  ← レコード一覧
    ├── record.css         ← レコード詳細
    ├── logs-index.css     ← ログ一覧
    ├── about.css          ← About
    ├── blog.css           ← ブログ
    ├── others.css         ← その他
    └── error.css          ← エラーページ
```

---

## 🔗 @import の順序（style.css）

GitHub Pages の Jekyll は `@import` を自動的に処理し、複数のCSSを1つに統合します。

```css
/* Layer 1: Base */
@import "base/variables.css";   ← 最初に読み込む（CSS変数を定義）
@import "base/reset.css";
@import "base/typography.css";

/* Layer 2: Layout */
@import "layout/common.css";
@import "layout/header.css";
@import "layout/navigation.css";
@import "layout/breadcrumb.css";
@import "layout/footer.css";
@import "layout/responsive.css";

/* Layer 3: Components */
@import "components/button.css";
@import "components/card.css";
@import "components/form.css";
@import "components/pagination.css";

/* Layer 3: Pages */
@import "pages/home.css";       ← 最後に読み込む（具体的なスタイル）
@import "pages/records-index.css";
@import "pages/record.css";
@import "pages/logs-index.css";
@import "pages/about.css";
@import "pages/blog.css";
@import "pages/others.css";
@import "pages/error.css";
```

**読み込み順の重要性：**
1. Base層で CSS変数を定義
2. Layout層で共通構造を定義
3. Components層で再利用部品を定義
4. Pages層で具体的なページスタイルを定義（上書き可能）

---

## 💡 使用方法

### 既存スタイルの修正

**例：ボタンのホバー色を変更**
```bash
# 修正
1. components/button.css を編集
2. .button:hover { background: var(--color-primary-light); }
3. ブラウザで確認
```

### ホームページに新しいスタイルを追加

```bash
# 追加方法
1. pages/home.css を編集
2. 新しい .home-new-section { ... } を追加
3. HTML に class="home-new-section" を指定
4. ブラウザで確認
```

### 複数ページで再利用する部品を追加

```bash
# 手順
1. components/ に新しいファイルを作成
   例：components/modal.css
2. モーダルのスタイルを定義
3. style.css に @import を追加
   @import "components/modal.css";
```

### 新しいページを追加

```bash
# 手順
1. pages/ に新しいファイルを作成
   例：pages/gallery.css
2. ページ固有のスタイルを定義
3. style.css に @import を追加
4. _layouts/ または pages/ に HTML を作成
```

---

## 📊 メリット

| メリット | 説明 |
|---------|------|
| **見読性向上** | 1,550行 → 平均150-200行 で 8-10倍短縮 |
| **保守性向上** | 修正時に関連ファイルのみ参照でOK |
| **拡張性向上** | 新ページ追加時に pages/ にファイル追加するだけ |
| **変更影響の隔離** | Pages層の修正が Layout層に影響しない |
| **チーム開発対応** | 複数人が異なるファイルで並行開発可能 |
| **デバッグ容易** | ファイルが小さいため問題特定が快速 |

---

## ⚠️ 注意事項

### CSS変数の使用

すべてのレイヤーで `var(--color-primary)` など CSS変数を使用しています。

新しい色や値を追加する場合：
```css
/* base/variables.css に追加 */
:root {
  --color-new: #ff0000;
}
```

その後、他のファイルで参照：
```css
.my-element {
  color: var(--color-new);
}
```

### @import の使用

GitHub Pages が @import を処理します。

**開発時：** ブラウザで個別に各ファイルを読み込む必要はありません
```html
<!-- style.css だけをリンク -->
<link rel="stylesheet" href="/assets/css/style.css">
```

Jekyll ビルド時に自動的に全 CSS が統合されます。

---

## 🔄 依存関係図

```
┌─────────────────────────────┐
│    Layer 1: Base層          │
│  (variables, reset, typo)   │
└────────────┬────────────────┘
             ▼
┌────────────────────────────────┐
│    Layer 2: Layout層           │
│  (header, nav, footer, etc)    │
└────────────┬────────────────────┘
             ▼
┌──────────────────────────────────────────┐
│  Layer 3: Components層 + Pages層        │
│  (buttons, cards / home, records, etc)   │
└──────────────────────────────────────────┘
```

**矢印の意味：** 下の層が上の層に依存

---

## 📝 今後の拡張

### 新しいコンポーネントを追加する場合

```css
/* components/tooltip.css を新規作成 */
.tooltip {
  /* スタイル定義 */
}

/* style.css に追記 */
@import "components/tooltip.css";
```

### テーマシステムの導入（将来）

```css
/* base/themes.css の追加例 */
:root {
  --theme-light: { ... };
  --theme-dark: { ... };
}
```

### メディアクエリの集約（将来）

現在：各ファイルにレスポンシブルールが分散
将来：`layout/responsive.css` に集約も検討

---

## 📚 参考資料

- **SMACSS**（Scalable and Modular Architecture for CSS）
- **BEM**（Block Element Modifier）
- **GitHub Pages + Jekyll**：CSS は自動でコンパイルされます

---

## 🎯 まとめ

この 3層モジュールアーキテクチャにより：
- ✅ **見読性** を最優先に改善
- ✅ **保守性** を大幅向上
- ✅ **拡張性** を確保
- ✅ **チーム開発** に対応

プロジェクトの方針「見読性重視」を実現しています。

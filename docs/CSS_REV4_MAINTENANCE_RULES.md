# CSS Rev.4 保守ルール

## 基本ルール

1. 現行 CSS の entry point は `assets/css/style.css` のみとし、HTML／Layout から個別 CSS を直接参照しない。
2. import 順は Base → Layout → Components → Pages → Responsive の責務順として扱う。現行 entry point の import 順は維持し、Responsive は Layout 内で最後に import する。
3. desktop の既定宣言は各責務ファイルに置く。768px 以下の上書きは `assets/css/layout/responsive.css` に集約する。
4. 同じプロパティを同じ selector に後段で再定義するときは、変更管理台帳に理由と最終責務を記録する。
5. 色、shadow、radius、transition、共通寸法の新規値は、先に `base/variables.css` への追加可否を確認する。
6. legacy と backup は `style.css` に import しない。削除・移動・復帰は CSS-R4-016 の変更管理を起票してから実施する。
7. PC 版の情報密度調整は `--density-*` token を優先し、769px 以上の `@media` に限定して行う。スマートフォン・タブレット向け調整は別管理番号で扱う。

## 修正先判定表

| 変更契機 | 修正すべきファイル | 修正してはいけない／条件 | 変更管理上の確認 |
|---|---|---|---|
| 新しいデータが追加された | 原則 CSS 変更なし。表示項目が増える場合だけ対象 Component または Page CSS | データ JSON の追加だけで CSS を変更しない | 既存 card/filter の overflow、折返しを実機確認 |
| 新しいページが追加された | `assets/css/pages/<page>.css`、`assets/css/style.css` の import、必要なら `layout/responsive.css` の対象節 | 共通部品を page CSS に複製しない | Page 名、利用 layout、mobile 節を台帳登録 |
| Component 追加 | `assets/css/components/<component>.css`、`assets/css/style.css`、必要なら `layout/responsive.css` | 1 ページ専用であれば Components に置かない | 使用ページが 2 以上かを確認 |
| Responsive 追加 | `assets/css/layout/responsive.css` | 各 `pages/*.css`、`components/*.css`、`layout/header.css` 等に `@media` を追加しない | Header→Error の節名、breakpoint、影響ページを記録 |
| 変数追加 | `assets/css/base/variables.css` | 各 CSS に同じ色・shadow・radius を直書きしない | 既存 token と重複しないか検索 |
| PC 版情報密度調整 | `assets/css/base/variables.css` の `--density-*`、必要に応じて共通 CSS と対象 page CSS | HTML/JS を変更しない。クリック領域を縮小しない。モバイル用 `@media (max-width: 768px)` に混在させない | 1920px幅、1366px幅、ブラウザ100%で可読性・横スクロール・重なりを確認 |
| Layout 変更 | `assets/css/layout/common.css`、`header.css`、`navigation.css`、`footer.css` の責務に応じて選択 | 特定ページのみの要望を Layout に置かない | 全ページへの影響を確認 |
| Page 追加 | `assets/css/pages/<page>.css`、`style.css`、`responsive.css` の該当 page 節 | 既存 page CSS を流用して名前だけ変えない | 新規 page selector に page prefix を付ける |
| 削除 | 対象 CSS と対象 HTML/JS の両方を検索してから削除候補を変更管理へ記録 | 参照未確認での削除禁止 | import、HTML class、JS classList/querySelector を確認 |
| 共通化 | `components/*.css` または `layout/*.css` | 見た目が似るだけで、利用箇所・プロパティ・状態が異なる selector を共通化しない | Component→Selector→Property 比較をレビュー台帳に追記 |
| 責務変更 | 移管元と移管先の両方、`style.css`、`responsive.css` | 移管中に値まで同時変更しない。値変更は別管理番号にする | before/after の computed style を desktop/mobile で確認 |
| Button の変更 | `components/button.css`、mobile は `responsive.css` Button 節 | Records/Logs の page CSS に `.button` を追加しない | Record、Error、Home、Logs、Records を確認 |
| Card の変更 | generic は `components/card.css`、Home/Records 固有は各 Pages | `.record-card` と `.home-record-card` の共有値を Pages で再定義しない | CSS-R4-008 の責務表を更新 |
| Form の変更 | `components/form.css`、Logs 固有は `pages/logs-index.css` | generic `.checkbox-group` を Logs で再定義しない | CSS-R4-009 と検索画面の keyboard 操作を確認 |
| Pagination の変更 | `components/pagination.css`、mobile は `responsive.css` Pagination 節 | Records/Logs 個別 CSS に pager の共通値を置かない | JS 生成 class、active、disabled、dots を確認 |
| Header / Navigation / Footer の変更 | 各 Layout CSS、mobile は responsive.css の該当節 | Page CSS から共通 Header/Nav/Footer を変更しない | desktop/mobile と navigation.js state を確認 |

## responsive.css の固定見出し順

```css
/* Header */
/* Navigation */
/* Footer */
/* Button */
/* Card */
/* Form */
/* Pagination */
/* Home */
/* Records */
/* Record */
/* Logs */
/* About */
/* Blog */
/* Others */
/* Error */
```

分割を行うのは、上記の並びでも全体を安全に把握できなくなった場合だけとする。その場合の上限は次の 2 ファイルである。

| 条件 | 分割案 | 収容内容 |
|---|---|---|
| `responsive.css` が見通しを失った場合 | `responsive-layout.css` | Header、Navigation、Footer、Button、Card、Form、Pagination |
| 同上 | `responsive-pages.css` | Home、Records、Record、Logs、About、Blog、Others、Error |

これを超える分割は行わない。

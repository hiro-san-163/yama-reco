# CSS Rev.4 To-Be 台帳

この台帳は CSS-R4-001 ～ CSS-R4-016 の実測レビューを根拠にした最終配置案である。ここでいう「実装内容」は、将来実施する変更内容であり、本資料の作成では CSS を変更していない。

| 管理番号 | Component | セレクタ | 現状 | 最終配置 | 実装内容 | 理由 | 優先度 | 影響範囲 | Responsive対応 |
|---|---|---|---|---|---|---|---|---|---|
| CSS-R4-001 | Design Tokens | `:root`、`.logs-filter`、`.log-card`、`.logs-condition-summary` | トークンは variables.css、Logs の 3 宣言だけ `var()` がない。 | `base/variables.css` と `pages/logs-index.css` | Logs の 3 宣言を既存 token の `var()` 参照へ変更する。 | 実在する 3 宣言が CSS custom property の参照構文ではなく、背景・border の意図が反映されないため。 | 高 | Logs の filter、card、条件要約の表示 | なし |
| CSS-R4-002 | Base / Typography | `h1`、`h2`、`h3`、`.section`、`.container` | 基本値は Base、768px 以下の共通変更は responsive.css。 | `base/*.css`、`layout/responsive.css` | 配置変更なし。 | Base と共通 Responsive の責務が分離済み。 | 低 | 全ページ | `responsive.css` の共通節を維持 |
| CSS-R4-003 | Header | `.header-inner`、`.site-brand`、`.site-logo`、`.site-title` | header.css 内に 768px 以下の値がある。 | desktop: `layout/header.css`、mobile: `layout/responsive.css` Header 節 | 既存の値を変えず、Header の mobile rule を移管する。 | 集中管理方針に合わせる。 | 中 | 共通 Header | `/* Header */` 節 |
| CSS-R4-004 | Navigation | `.site-nav`、`.nav-toggle`、`.nav-menu`、`.nav-overlay`、`body.nav-open` | navigation.css と reset.css に desktop/mobile/state が分散。 | desktop/state: 現行、mobile: `layout/responsive.css` Navigation 節 | `body.nav-open` は reset.css に維持し、navigation の mobile rule のみ移管する。 | scroll lock は body の基底状態、メニュー寸法は Navigation の責務という実測に基づく。 | 中 | Header、Navigation JS | `/* Navigation */` 節 |
| CSS-R4-005 | Footer | `.footer-nav-desktop`、`.footer-nav-mobile` | 表示切替は responsive.css、外観は footer.css。 | 現行維持 | 配置変更なし。コメントを Footer 節に統一する。 | 既に集中管理の実例になっている。 | 低 | 共通 Footer | `/* Footer */` 節 |
| CSS-R4-006 | Button | `.button`、`.btn`、`.button-outline`、`.btn-outline` | button.css のみが宣言し、Pages は利用のみ。 | `components/button.css` | 配置変更なし。 | 実測上の重複なし。 | 低 | Records、Logs、Record、Error、Home | 将来追加時は `/* Button */` 節 |
| CSS-R4-007 | Generic Card | `.card`、`.card-body`、`.card-title`、`.card-meta`、`.card-summary` | card.css のみが宣言。 | `components/card.css` | 配置変更なし。 | Blog の利用に対して上書きなし。 | 低 | Blog | 将来追加時は `/* Card */` 節 |
| CSS-R4-008 | Record Card | `.home-record-card`、`.record-card`、`.home-record-image`、`.record-card-image`、`.home-record-content`、`.record-card-content` | card.css の共通定義を records-index.css と home.css が後段で上書き。 | 共通骨格: `components/card.css`、Home 固有: `pages/home.css`、Records 固有: `pages/records-index.css` | 同一 selector に重なる値を分離し、Page 側は page prefix を持つ補助 selector に限定する。 | 240px/280px、padding、margin、clamp の意図がページ別で、共通 component の定義に混在しているため。 | 高 | HOME、Records 一覧、mobile card | `/* Card */`、`/* Home */`、`/* Records */` 節 |
| CSS-R4-009 | Form | `.checkbox-group`、`.checkbox-group input` | form.css が group 全体、logs-index.css が同値再定義と input margin。 | 基本: `components/form.css`、Logs 固有: `pages/logs-index.css` | 重複する group 宣言を component 側に一本化し、必要な場合は Logs 専用 selector にする。 | 同一 display/flex-wrap/gap は同じ責務であり、input margin のみ Logs 固有。 | 中 | Logs filter | `/* Form */`、`/* Logs */` 節 |
| CSS-R4-010 | Pagination | `.pagination`、`.pagination-btn`、`.pagination-dots` | component に desktop/mobile の両方がある。 | desktop: `components/pagination.css`、mobile: `layout/responsive.css` Pagination 節 | mobile rule を値変更なしで移管する。 | shared component の responsive を一箇所に集めるため。 | 低 | Records、Logs | `/* Pagination */` 節 |
| CSS-R4-011 | Records | `.records-filter`、`.records-condition-*`、`.records-page.is-search-active .records-filter` | records-index.css に desktop/mobile/state が混在。 | desktop: `pages/records-index.css`、mobile: `layout/responsive.css` Records 節 | mobile filter の 1 列化、panel 非表示、condition bar 配置を移管する。 | 全 selector が Records のみで、JS が mobile state を付与するため。 | 中 | Records 検索 UI | `/* Records */` 節 |
| CSS-R4-012 | Logs | `.logs-filter`、`.logs-condition-*`、`.logs-page.is-search-active .logs-filter`、`.log-card` | logs-index.css に desktop/mobile/state と token 誤記が混在。 | desktop: `pages/logs-index.css`、mobile: `layout/responsive.css` Logs 節 | CSS-R4-001 を先に実施後、mobile filter／condition bar rule を移管する。 | Logs 固有の表示状態。 | 高 | Logs 検索 UI | `/* Logs */` 節 |
| CSS-R4-013 | Page Shell | `.home-page`、`.records-page`、`.record-page`、`.logs-page`、`.about-page`、`.blog-page`、`.other-page` | desktop は各 Pages、mobile は About/Blog/Others/Record のみ。 | desktop: 各 Pages、mobile: `layout/responsive.css` 各 page 節 | 既存の page ごとの余白値を変えず、mobile rule だけ集約する。 | 現在の値に意図を示すデータはないため、共通値への変更は行わない。 | 中 | 全主要ページ | 各 page 節 |
| CSS-R4-014 | Record Detail | `.record-*`、`.gallery-*`、`.course-note`、`.image-caption` | record.css に desktop/mobile が同居。 | desktop: `pages/record.css`、mobile: `layout/responsive.css` Record 節 | 既存値を変えず mobile rule を移管。 | Page 固有の responsive である。 | 中 | 山行詳細 | `/* Record */` 節 |
| CSS-R4-015 | About / Blog / Others / Error | `.about-*`、`.post-*`、`.other-*`、`.link-*`、`.error-*` | 各 Pages ファイルに対象 page の @media がある。 | desktop: 各 Pages、mobile: `layout/responsive.css` 各 page 節 | 既存値を変えず全 mobile rule を移管。 | 集中管理方針の対象。 | 中 | 各固定ページ | `/* About */`、`/* Blog */`、`/* Others */`、`/* Error */` 節 |
| CSS-R4-016 | Historical / Backup CSS | legacy と backup の全 selector | V5 entry point から未参照。 | import 対象外のまま | Rev.4 CSS への取り込みを行わない。削除・移動は別承認で扱う。 | 参照関係がなく、現行 cascade に作用しないため。 | 低 | legacy_v4 と履歴ファイルのみ | 対象外 |

## Rev.4 最終 import 順

`assets/css/style.css` は現行順を維持する。`responsive.css` は import 位置を Layout の末尾に置いたまま、内部を以下の順で区切る。

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

分割はこの時点では提案しない。実測の responsive ルール量は 10 ファイルに分散しているが、統合後も single breakpoint（主に 768px）と上記 15 節で管理可能である。`responsive-layout.css` と `responsive-pages.css` への二分割は、統合後にファイルの見通しが実際に損なわれた場合に限る。

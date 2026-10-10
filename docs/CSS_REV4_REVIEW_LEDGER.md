# CSS Rev.4 レビュー台帳

## 調査根拠

| 項目 | 実測結果 |
|---|---|
| 現行スタイルシート参照元 | `_layouts/default.html` のみが `assets/css/style.css` を参照 |
| 現行 import 順 | Base → Layout → Components → Pages。`assets/css/style.css` の 20 本の `@import` を確認 |
| legacy_v4 の参照 | `legacy_v4/*.html` が `CSS/style.css` 等を参照。V5 の `_layouts/default.html` からは未参照 |
| backup の参照 | `assets/css/style.css.old`、`assets/css/style.css.backup` を参照する HTML／Layout は未検出 |
| 現行ページ CSS の responsive | `header.css`、`navigation.css`、`card.css`、`pagination.css`、`records-index.css`、`logs-index.css`、`about.css`、`blog.css`、`others.css`、`error.css` に `@media` を確認 |

比較の順序は Component → Selector → Property とした。値が異なるものは、宣言されているプロパティとカスケード順を比較して判定した。

## レビュー台帳

| 管理番号 | Component | 比較対象ファイル | 使用セレクタ | 内容比較（セレクタ→プロパティ） | 責務比較 | 一致率 | 判定 | 改善内容 | 優先度 |
|---|---|---|---|---|---|---:|---|---|---|
| CSS-R4-001 | Design Tokens | `base/variables.css`、全現行 CSS | `:root`、`var(--*)` | `:root` が色、surface、border、shadow、radius、transition を定義。現行 CSS は主に `var()` を参照するが、`logs-index.css` の `background: --color-panel-bg`、`border: 1px solid --color-card-border`、`background: --color-condition-bg` は `var()` ではない。 | トークン定義は Base、利用は各層で妥当。3 宣言のみ値として無効。 | 92% | ○ | `logs-index.css` の 3 宣言をトークン参照として正常化する変更を別途起票。 | 高 |
| CSS-R4-002 | Base / Typography | `base/reset.css`、`base/typography.css`、`layout/responsive.css` | `body`、`h1`、`h2`、`h3`、`.section` | Base は `body` の font-size 18px／line-height 1.8 と見出しの既定値を定義。responsive は 768px 以下で h1 2rem→1.7rem、h2 1.6rem→1.4rem、h3 1.3rem→1.2rem、`.section` の上下余白を変更。 | 基本値と共通可変値の責務が分離されている。 | 100% | ◎ | Rev.4 では `responsive.css` に維持する。 | 低 |
| CSS-R4-003 | Header | `layout/header.css`、`layout/responsive.css` | `.site-header`、`.header-inner`、`.site-brand`、`.site-logo`、`.site-title` | Header は sticky、背景、branding と 768px 以下の寸法を保持。共通 responsive に Header 規則はない。モバイル規則が header.css に残る。 | Header 固有の寸法変更であり内容は一貫。ただし集中管理方針と配置が不一致。 | 100% | ◎ | セレクタ・プロパティを変えず `responsive.css` の Header 節へ移管する。 | 中 |
| CSS-R4-004 | Navigation | `layout/navigation.css`、`layout/responsive.css`、`base/reset.css` | `.site-nav`、`.nav-toggle`、`.nav-menu`、`.nav-overlay`、`body.nav-open` | navigation.css は desktop と mobile の `.nav-menu` を、表示方式（flex→fixed）、位置、transform、overlay、state `.is-open` まで定義。reset.css は `body.nav-open` のスクロール停止を定義。 | 表示構造は Navigation、body state は Base に置かれており、状態責務が二層に跨る。プロパティ競合はない。 | 96% | ○ | state 規則を Navigation 節に集約するか、Base に残す理由を台帳で固定する。Rev.4 では後者を採用。 | 中 |
| CSS-R4-005 | Footer | `layout/footer.css`、`layout/responsive.css` | `.site-footer`、`.footer-inner`、`.footer-nav`、`.footer-nav-desktop`、`.footer-nav-mobile` | footer.css は外観と共通レイアウト、responsive.css は desktop/mobile の `display` 切替だけを定義。値・責務は重複しない。 | Footer 固有レスポンシブを共通ファイルへ集中する前例として整合。 | 100% | ◎ | 現行の分離を維持し、responsive.css の Footer 節へ明示コメントを置く。 | 低 |
| CSS-R4-006 | Button | `components/button.css`、`pages/records-index.css`、`pages/logs-index.css` | `.button`、`.btn`、`.button-outline`、`.btn-outline` | component は padding、border、背景、色、hover を定義。Pages は `.button` を再定義せず、条件バーにクラスを利用するのみ。 | 再利用部品として一元化済み。 | 100% | ◎ | button.css を唯一のスタイル定義元にする。 | 低 |
| CSS-R4-007 | Generic Card | `components/card.css`、`pages/blog.css` | `.card`、`.card-body`、`.card-title`、`.card-meta`、`.card-summary` | card.css が surface、border、shadow、overflow と内容余白／文字を定義。blog は `.card` をそのまま利用し独自上書きなし。 | Generic Card は Component に閉じている。 | 100% | ◎ | 現行配置を維持する。 | 低 |
| CSS-R4-008 | Record Card | `components/card.css`、`pages/home.css`、`pages/records-index.css` | `.home-record-card`、`.record-card`、`.home-record-image`、`.record-card-image`、`.home-record-content`、`.record-card-content`、`.home-record-summary`、`.record-card-summary` | card.css は両カードに `display:flex`、240px image、content padding `1rem 1.25rem`、title 1.15rem、hover/focus、モバイル column を定義。records-index.css は `.record-card` に gap、280px image、content padding 1rem、title/meta の margin・色を後段で再定義。home.css は `.home-record-summary` の clamp を 3 行から 4 行へ後段で変更。 | 共通外観とページ固有密度が同じセレクタへ重なり、責務が混在。後段 Pages が Components を上書きする実態。 | 63% | △ | 共通骨格を card.css、Records 固有の一覧 gap／データ表示を records-index.css、Home 固有 clamp を home.css としてセレクタを分離する設計へ移す。 | 高 |
| CSS-R4-009 | Form | `components/form.css`、`pages/logs-index.css` | `.form-group`、`label`、`input[type="*"]`、`select`、`textarea`、`.checkbox-group` | form.css は入力寸法、border、focus と checkbox group を定義。logs-index.css は `.checkbox-group` と `.checkbox-group input` を後段で再定義し、前者の display/flex-wrap/gap は同値。後者だけ margin-right を追加。 | ほぼ共通。logs 固有の input margin のみ Pages の責務として残る。 | 91% | ○ | `.checkbox-group input` を Form に寄せるか、Logs の source selector を追加して固有化する。 | 中 |
| CSS-R4-010 | Pagination | `components/pagination.css`、`records/index.html`、`logs/index.html`、`assets/js/pagination.js` | `.pagination`、`.pagination-btn`、`.pagination-dots` | component はコンテナ、active、disabled、focus、dots と mobile 寸法を定義。JS は生成ボタンに `pagination-btn`、active 状態に `active` を付与。両ページが `.pagination` を利用。 | 定義・利用・状態が一致している。 | 100% | ◎ | responsive 規則だけを responsive.css の Pagination 節に移管する。 | 低 |
| CSS-R4-011 | Records Filter / State | `pages/records-index.css`、`assets/js/records.js` | `.records-filter`、`.records-condition-bar`、`.records-condition-summary`、`.records-page.is-search-active .records-filter` | grid filter、件数、検索条件バー、empty message を定義。JS が 768px 以下かつ検索済み時に `is-search-active` を付与し、CSS が filter を `display:none` にする。 | page 固有の表示状態で、JS と CSS の役割が一致。responsive の配置のみ方針外。 | 100% | ◎ | Records 節として responsive.css へ移管。`records-condition-summary` は HTML に存在するが current JS が内容を設定しない点を別機能課題として扱う。 | 中 |
| CSS-R4-012 | Logs Filter / State | `pages/logs-index.css`、`assets/js/logs.js` | `.logs-filter`、`.logs-condition-bar`、`.logs-condition-summary`、`.logs-condition-actions`、`.logs-page.is-search-active .logs-filter` | filter grid、log card、source badge、mobile state を定義。JS が `is-search-active`、条件要約、card source class を生成。3 個の無効トークン参照を除き state と class 名が一致。 | Logs 固有 UI と状態表現が整合。 | 88% | ○ | 無効宣言を修正対象にし、mobile 規則は responsive.css の Logs 節へ移管。 | 高 |
| CSS-R4-013 | Page Shell | `pages/home.css`、`pages/records-index.css`、`pages/record.css`、`pages/logs-index.css`、`pages/about.css`、`pages/blog.css`、`pages/others.css` | `.home-page`、`.records-page`、`.record-page`、`.logs-page`、`.about-page`、`.blog-page`、`.other-page` | 各ページが desktop で概ね `padding-top/bottom:2rem`。About/Blog/Others は mobile で 1.5rem に変更する一方、Home/Records/Logs は page shell の mobile padding を持たない。 | 共通 page spacing と各ページの配置が混在。値差は利用データではなくファイルごとの差として現れている。 | 71% | △ | 共通 page shell を Layout に置くか、各 page の余白を維持するなら差分理由を明文化する。Rev.4 To-Be は既存値を変えない後者。 | 中 |
| CSS-R4-014 | Record Detail | `pages/record.css`、`_layouts/record.html` | `.record-*`、`.gallery-*`、`.course-note`、`.image-caption` | detail レイアウト、画像、gallery grid、prev/next を record.css が一元定義。768px 以下で余白、grid、navigation を変更。 | すべて record detail 固有。 | 100% | ◎ | desktop は record.css、mobile は responsive.css の Record 節へ移管。 | 中 |
| CSS-R4-015 | Other Pages | `pages/about.css`、`pages/blog.css`、`pages/others.css`、`pages/error.css` | `.about-*`、`.post-*`、`.other-*`、`.link-*`、`.error-*` | 各ページの固有コンテンツ構造を定義。各 file の `@media` は対象ページのみに作用し、Component と同名の再定義は確認されない。 | Page 固有責務として妥当。集中 responsive 方針のみ未達。 | 100% | ◎ | 個別の mobile rules を responsive.css の About/Blog/Others/Error 節へ移管。 | 中 |
| CSS-R4-016 | Historical / Backup CSS | `legacy_v4/css/*.css`、`assets/css/style.css.old`、`assets/css/style.css.backup` | legacy の `.pc-nav`、`.mobile-nav`、`.record-thumb`、`#pagination` 等、backup の旧 `.records-*`、`.logs-*` 等 | `legacy_v4` は旧 HTML が相対 `CSS/` を参照。V5 layout はこれらを参照しない。`.old`／`.backup` は参照元未検出。よって現行 cascade とのプロパティ競合は発生しない。 | 歴史資料・退避ファイルであり、Rev.4 の実行 CSS ではない。 | 0% | × | Rev.4 import に追加しない。削除は本レビューの範囲外。保管方針は変更管理台帳で明示する。 | 低 |
| CSS-R4-017 | PC Density Tokens | `base/variables.css`、`base/reset.css`、`layout/common.css`、`components/card.css`、`pages/home.css`、`pages/records-index.css`、`pages/logs-index.css` | `--density-*`、`body`、`.page-header`、`.section`、`.home-record-content`、`.record-card-content`、`.home-page`、`.records-page`、`.logs-page`、`.records-filter`、`.logs-filter`、`.log-card` | PC 表示限定の情報密度調整として、Design Tokens に `--density-*` を追加し、769px 以上の `@media` で本文行間、ページ余白、カード内余白、カード間隔、検索エリア余白を 10～20% 程度圧縮。HTML/JS/機能変更はなし。 | 値は Base token に集約し、適用は共通 CSS → page CSS の順に限定。スマートフォン・タブレット向け既存規則は変更しない。 | 100% | ◎ | PC 版の可読性を維持しつつ表示密度を上げる実装済み変更として記録。今後のレスポンシブ調整時に token 値との整合を再確認する。 | 中 |

## 総評

Rev.4 の目標構成は既にファイル構造と import 順で成立している。最も大きい設計上の未達は、レスポンシブ規則が `layout/responsive.css` 以外の 10 ファイルにも残っている点である。次点は Record Card の重複定義で、同一セレクタの `flex`、画像幅、padding、title/meta の値が Components と Records Pages で後段上書きされる点である。

| 観点 | 評価 | 根拠 |
|---|---|---|
| 改善点 | 高 | `logs-index.css` の無効トークン参照、Record Card の重複、responsive の分散を管理番号 CSS-R4-001／008／011～015 で追跡可能にした。 |
| メリット | 高 | Base、Layout、Components、Pages の分割と単一の entry point があり、影響範囲を import 単位で追える。 |
| デメリット | 中 | 同一セレクタの後段上書きは、変更時に Component と Page の両方を読む必要がある。 |
| 保守性 | 中 | 台帳と集中 responsive への移管が完了すれば高。現状は Card と responsive が調査コストを増やす。 |
| 可読性 | 中 | ファイル名は明快だが、実行時の最終値は import 順と重複定義の確認が必要。 |
| 拡張性 | 高 | page CSS と component CSS の受け皿はある。新規追加時に本台帳の配置ルールを守ることが条件。 |

## 追補: 2026-10-10 PC 密度調整レビュー

PC 版の情報密度向上を目的に、CSS-R4-017 として Design Tokens ベースの調整を実施済み。変更は CSS のみで、HTML 構造、JavaScript、機能追加・削除は行っていない。適用範囲は `@media (min-width: 769px)` に限定し、スマートフォン・タブレット向けの既存 responsive 規則は対象外とした。

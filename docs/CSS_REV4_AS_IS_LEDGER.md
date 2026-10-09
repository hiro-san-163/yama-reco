# CSS Rev.4 CSS台帳（As-Is）

## 対象範囲と読取り方法

| 区分 | ファイル | 実行時参照 | 台帳上の扱い |
|---|---|---:|---|
| 現行 entry point | `assets/css/style.css` | あり | `@import` の順に 001 以降へ記録 |
| 現行 Base | `assets/css/base/*.css` | あり | 詳細記録 |
| 現行 Layout | `assets/css/layout/*.css` | あり | 詳細記録 |
| 現行 Components | `assets/css/components/*.css` | あり | 詳細記録 |
| 現行 Pages | `assets/css/pages/*.css` | あり | 詳細記録 |
| legacy | `legacy_v4/css/style.css`、`search.css`、`SBsearch.css`、`STsearch.css`、`other.css` | V5 からなし | 全ファイルを検索済み。legacy_v4 内 HTML だけが参照するため Rev.4 cascade 比較から除外。CSS-R4-016 を参照。 |
| backup | `assets/css/style.css.old`、`assets/css/style.css.backup` | なし | 参照元未検出。Rev.4 cascade 比較から除外。CSS-R4-016 を参照。 |

`Responsive有無` は当該 selector が `@media` 内で宣言されるかで判定した。複数セレクタのルールは selector ごとに行を分けている。`責務` は宣言されたプロパティと、HTML／JS の利用箇所から記録した。

## Base

| No | セレクタ | ファイル | レイヤー | 責務 | Responsive有無 | 備考 |
|---:|---|---|---|---|---|---|
| 001 | `:root` | `base/variables.css` | Base | 色、surface、border、shadow、container、radius、transition の custom property 定義 | なし | 他層が `var(--*)` を参照 |
| 002 | `*` | `base/reset.css` | Base | `box-sizing:border-box` | なし | 003、004 と同一宣言を展開 |
| 003 | `*::before` | `base/reset.css` | Base | `box-sizing:border-box` | なし |  |
| 004 | `*::after` | `base/reset.css` | Base | `box-sizing:border-box` | なし |  |
| 005 | `html` | `base/reset.css` | Base | smooth scroll | なし |  |
| 006 | `body` | `base/reset.css` | Base | 余白、font、文字色、背景画像、背景表示 | なし | 全ページ |
| 007 | `body::before` | `base/reset.css` | Base | fixed overlay | なし | 全ページ |
| 008 | `img` | `base/reset.css` | Base | block、最大幅、auto height | なし | 全ページ画像 |
| 009 | `a` | `base/reset.css` | Base | 継承色、下線除去 | なし | 全ページリンク |
| 010 | `ul` | `base/reset.css` | Base | margin/padding reset | なし | 011 と同一宣言を展開 |
| 011 | `ol` | `base/reset.css` | Base | margin/padding reset | なし |  |
| 012 | `li` | `base/reset.css` | Base | list-style reset | なし |  |
| 013 | `table` | `base/reset.css` | Base | width、border-collapse | なし |  |
| 014 | `button` | `base/reset.css` | Base | font 継承 | なし | 015～017 と同一宣言を展開 |
| 015 | `input` | `base/reset.css` | Base | font 継承 | なし |  |
| 016 | `select` | `base/reset.css` | Base | font 継承 | なし |  |
| 017 | `textarea` | `base/reset.css` | Base | font 継承 | なし |  |
| 018 | `body.nav-open` | `base/reset.css` | Base | fixed と overflow hidden による背景スクロール停止 | なし | navigation.js が付与 |
| 019 | `h1` | `base/typography.css` | Base | 2rem、下余白 | あり | responsive.css が 1.7rem に変更 |
| 020 | `h2` | `base/typography.css` | Base | 1.6rem、下余白 | あり | responsive.css が 1.4rem に変更 |
| 021 | `h3` | `base/typography.css` | Base | 1.3rem、下余白 | あり | responsive.css が 1.2rem に変更 |
| 022 | `h4` | `base/typography.css` | Base | heading 色、line-height、margin-top | なし | 023～024 と同一宣言を展開 |
| 023 | `h5` | `base/typography.css` | Base | heading 色、line-height、margin-top | なし |  |
| 024 | `h6` | `base/typography.css` | Base | heading 色、line-height、margin-top | なし |  |
| 025 | `p` | `base/typography.css` | Base | 上下 margin | なし |  |
| 026 | `small` | `base/typography.css` | Base | 補助文字色 | なし |  |

## Layout

| No | セレクタ | ファイル | レイヤー | 責務 | Responsive有無 | 備考 |
|---:|---|---|---|---|---|---|
| 027 | `.container` | `layout/common.css` | Layout | 最大幅、中央寄せ、左右 padding | あり | responsive.css で左右 padding を変更 |
| 028 | `.site-main` | `layout/common.css` | Layout | 最小表示高さ | なし | default layout の main |
| 029 | `.section` | `layout/common.css` | Layout | 上下 section padding | あり | responsive.css で縮小 |
| 030 | `.text-center` | `layout/common.css` | Layout | text-align center | なし | utility |
| 031 | `.text-right` | `layout/common.css` | Layout | text-align right | なし | utility |
| 032 | `.site-header` | `layout/header.css` | Layout | sticky、surface、blur、border | なし | header include |
| 033 | `.header-inner` | `layout/header.css` | Layout | flex、幅、余白、最小高 | あり | mobile rule は header.css |
| 034 | `.site-brand` | `layout/header.css` | Layout | brand flex、gap、縮小防止 | あり | mobile rule は header.css |
| 035 | `.site-brand:hover` | `layout/header.css` | Layout | 下線抑止 | なし |  |
| 036 | `.site-brand:focus-visible` | `layout/header.css` | Layout | focus outline | なし |  |
| 037 | `.site-logo` | `layout/header.css` | Layout | ロゴ寸法、object-fit | あり | mobile rule は header.css |
| 038 | `.site-title` | `layout/header.css` | Layout | title font、nowrap、位置補正 | あり | mobile rule は header.css |
| 039 | `.site-nav` | `layout/navigation.css` | Layout | navigation flex container | あり | desktop/mobile 両方で再宣言 |
| 040 | `.nav-toggle` | `layout/navigation.css` | Layout | desktop hidden、button 寸法・interaction | あり | mobile で inline-flex |
| 041 | `.nav-toggle:hover` | `layout/navigation.css` | Layout | accent color | なし |  |
| 042 | `.nav-toggle:focus-visible` | `layout/navigation.css` | Layout | focus outline | なし |  |
| 043 | `.nav-toggle svg` | `layout/navigation.css` | Layout | SVG icon 寸法 | なし | current HTML は文字記号 |
| 044 | `.nav-toggle i` | `layout/navigation.css` | Layout | icon font size | なし | current HTML に i 要素なし |
| 045 | `.nav-menu` | `layout/navigation.css` | Layout | desktop flex menu、mobile fixed drawer | あり | mobile で position/transform を変更 |
| 046 | `.nav-menu li` | `layout/navigation.css` | Layout | list reset／mobile width | あり |  |
| 047 | `.nav-menu a` | `layout/navigation.css` | Layout | menu link の layout、font、interaction | あり | mobile で block/padding に変更 |
| 048 | `.nav-menu a:hover` | `layout/navigation.css` | Layout | desktop accent color／mobile surface background | あり | media により追加プロパティ |
| 049 | `.nav-menu a:focus-visible` | `layout/navigation.css` | Layout | desktop accent color／mobile surface background、outline | あり | 同 selector の宣言が 2 箇所 |
| 050 | `.nav-menu a[aria-current="page"]` | `layout/navigation.css` | Layout | current page color/weight、mobile background | あり | include が付与 |
| 051 | `.nav-overlay` | `layout/navigation.css` | Layout | desktop hidden、mobile overlay | あり | mobile で fixed/opacity/visibility |
| 052 | `.nav-menu.is-open` | `layout/navigation.css` | Layout | drawer translateX 解除 | あり | navigation.js が付与 |
| 053 | `.nav-overlay.is-open` | `layout/navigation.css` | Layout | overlay 表示・pointer events | あり | navigation.js が付与 |
| 054 | `.nav-toggle:disabled` | `layout/navigation.css` | Layout | disabled cursor/opacity | なし |  |
| 055 | `.footer-inner` | `layout/footer.css` | Layout | 幅、余白、中央寄せ | なし | footer include |
| 056 | `.site-footer` | `layout/footer.css` | Layout | 上余白、背景、blur、文字色 | なし | footer include |
| 057 | `.footer-nav` | `layout/footer.css` | Layout | 下余白 | なし |  |
| 058 | `.footer-nav a` | `layout/footer.css` | Layout | link color | なし |  |
| 059 | `.footer-nav a:hover` | `layout/footer.css` | Layout | underline | なし |  |
| 060 | `.footer-top` | `layout/footer.css` | Layout | 上下 margin | なし |  |
| 061 | `.footer-top a` | `layout/footer.css` | Layout | link color | なし |  |
| 062 | `.footer-copyright` | `layout/footer.css` | Layout | margin/font/opacity | なし |  |
| 063 | `.footer-nav-mobile` | `layout/footer.css` | Layout | 初期 hidden | あり | responsive.css が表示切替 |
| 064 | `.footer-nav-desktop` | `layout/responsive.css` | Responsive | mobile hidden / desktop block | あり | Footer 節 |

## Components

| No | セレクタ | ファイル | レイヤー | 責務 | Responsive有無 | 備考 |
|---:|---|---|---|---|---|---|
| 065 | `.button` | `components/button.css` | Components | primary button の表示、余白、色、border、hover transition | なし | 066 と同一宣言を展開 |
| 066 | `.btn` | `components/button.css` | Components | primary button の表示、余白、色、border、hover transition | なし |  |
| 067 | `.button:hover` | `components/button.css` | Components | primary hover background | なし | 068 と同一宣言を展開 |
| 068 | `.btn:hover` | `components/button.css` | Components | primary hover background | なし |  |
| 069 | `.button-outline` | `components/button.css` | Components | outline 色/border | なし | 070 と同一宣言を展開 |
| 070 | `.btn-outline` | `components/button.css` | Components | outline 色/border | なし |  |
| 071 | `.button-outline:hover` | `components/button.css` | Components | outline hover | なし | 072 と同一宣言を展開 |
| 072 | `.btn-outline:hover` | `components/button.css` | Components | outline hover | なし |  |
| 073 | `.card` | `components/card.css` | Components | generic card surface/border/shadow | なし | Blog が利用 |
| 074 | `.card-body` | `components/card.css` | Components | card content padding | なし |  |
| 075 | `.card-title` | `components/card.css` | Components | title margin/font | なし |  |
| 076 | `.card-meta` | `components/card.css` | Components | meta font/color | なし |  |
| 077 | `.card-summary` | `components/card.css` | Components | summary 上余白 | なし |  |
| 078 | `.home-record-card` | `components/card.css` | Components | Record Card 共通 flex/surface/shadow/transition | あり | pages/home.css が summary を上書き |
| 079 | `.record-card` | `components/card.css` | Components | Record Card 共通 flex/surface/shadow/transition | あり | pages/records-index.css が同 selector を上書き |
| 080 | `.home-record-card:hover` | `components/card.css` | Components | card hover translate/shadow/border | なし | 081～083 と同一宣言を展開 |
| 081 | `.record-card:hover` | `components/card.css` | Components | card hover translate/shadow/border | なし |  |
| 082 | `.home-record-card:focus-within` | `components/card.css` | Components | keyboard focus card state | なし |  |
| 083 | `.record-card:focus-within` | `components/card.css` | Components | keyboard focus card state | なし |  |
| 084 | `.home-record-card > a` | `components/card.css` | Components | home card link flex/full width | なし | HOME の article 内 link |
| 085 | `.record-card-link` | `components/card.css` | Components | record card link block/継承色 | なし | records page が後段再宣言 |
| 086 | `.record-card-link .record-card` | `components/card.css` | Components | link 内 card を flex | なし |  |
| 087 | `.home-record-image` | `components/card.css` | Components | image column 240px | あり | 088 と同一宣言を展開 |
| 088 | `.record-card-image` | `components/card.css` | Components | image column 240px | あり | records page が 280px に上書き |
| 089 | `.home-record-image img` | `components/card.css` | Components | image fill/object-fit | なし | 090 と同一宣言を展開 |
| 090 | `.record-card-image img` | `components/card.css` | Components | image fill/object-fit | あり | records page が aspect-ratio を追加 |
| 091 | `.home-record-content` | `components/card.css` | Components | content flex/padding/gap | あり | 092 と同一宣言を展開 |
| 092 | `.record-card-content` | `components/card.css` | Components | content flex/padding/gap | あり | records page が padding/flex を上書き |
| 093 | `.home-record-title` | `components/card.css` | Components | card title typography | なし | current HOME は h3 class なし |
| 094 | `.record-card-title` | `components/card.css` | Components | card title typography | なし | records page が margin/color を上書き |
| 095 | `.home-record-meta` | `components/card.css` | Components | meta flex/font/color | なし | 096 と同一宣言を展開 |
| 096 | `.record-card-meta` | `components/card.css` | Components | meta flex/font/color | なし | records page が margin を上書き |
| 097 | `.home-record-summary` | `components/card.css` | Components | summary font/line/color | なし | 098 と同一宣言を展開 |
| 098 | `.record-card-summary` | `components/card.css` | Components | summary font/line/color | なし | records page が margin を上書き |
| 099 | `.home-record-card .home-record-summary` | `components/card.css` | Components | home summary 3-line clamp | なし | home.css が 4 行に上書き |
| 100 | `.form-group` | `components/form.css` | Components | field 下余白 | なし | Records/Logs |
| 101 | `label` | `components/form.css` | Components | block/margin/font weight | なし | 全 form label |
| 102 | `input[type="text"]` | `components/form.css` | Components | input surface/size/border | なし | 103～106 と同一宣言を展開 |
| 103 | `input[type="search"]` | `components/form.css` | Components | input surface/size/border | なし | Logs |
| 104 | `input[type="number"]` | `components/form.css` | Components | input surface/size/border | なし |  |
| 105 | `input[type="date"]` | `components/form.css` | Components | input surface/size/border | なし |  |
| 106 | `select` | `components/form.css` | Components | input surface/size/border | なし | Records/Logs |
| 107 | `textarea` | `components/form.css` | Components | input surface/size/border | なし |  |
| 108 | `input:focus` | `components/form.css` | Components | focus border | なし | 109～110 と同一宣言を展開 |
| 109 | `select:focus` | `components/form.css` | Components | focus border | なし |  |
| 110 | `textarea:focus` | `components/form.css` | Components | focus border | なし |  |
| 111 | `.checkbox-group` | `components/form.css` | Components | checkbox flex/wrap/gap | なし | logs page が同値再宣言 |
| 112 | `.checkbox-group label` | `components/form.css` | Components | checkbox label alignment/gap | なし | Logs |
| 113 | `.pagination` | `components/pagination.css` | Components | pager flex/wrap/gap/margin | あり | Records/Logs |
| 114 | `.pagination-btn` | `components/pagination.css` | Components | pager button size/appearance | あり | JS が生成 |
| 115 | `.pagination-btn:hover:not(.active):not(:disabled)` | `components/pagination.css` | Components | inactive hover | なし |  |
| 116 | `.pagination-btn.active` | `components/pagination.css` | Components | selected page state | なし | JS が付与 |
| 117 | `.pagination-btn:disabled` | `components/pagination.css` | Components | disabled opacity/pointer | なし | 118 と同一宣言を展開 |
| 118 | `.pagination-btn.disabled` | `components/pagination.css` | Components | disabled opacity/pointer | なし |  |
| 119 | `.pagination-btn:focus-visible` | `components/pagination.css` | Components | focus outline | なし |  |
| 120 | `.pagination-dots` | `components/pagination.css` | Components | dots size/typography | あり | JS が生成 |

## Pages

| No | セレクタ | ファイル | レイヤー | 責務 | Responsive有無 | 備考 |
|---:|---|---|---|---|---|---|
| 121 | `.home-page` | `pages/home.css` | Pages | HOME 上下余白 | なし |  |
| 122 | `.home-records-section` | `pages/home.css` | Pages | HOME records section 最大幅 | なし | current HTML は `home-recent` を使用 |
| 123 | `.home-records-list` | `pages/home.css` | Pages | HOME list flex/gap | なし | 124 と同一宣言を展開 |
| 124 | `.records-list` | `pages/home.css` | Pages | list flex/gap | なし | records-index.css が後段上書き |
| 125 | `.home-record-card .home-record-summary` | `pages/home.css` | Pages | HOME summary 4-line clamp | なし | card.css の 3 行を後段変更 |
| 126 | `.home-concept` | `pages/home.css` | Pages | concept 最大幅/margin | なし |  |
| 127 | `.concept-card` | `pages/home.css` | Pages | concept padding/text align | なし |  |
| 128 | `.concept-title` | `pages/home.css` | Pages | concept title margin/font | なし |  |
| 129 | `.concept-text` | `pages/home.css` | Pages | concept text line/text-shadow | なし |  |
| 130 | `.records-page` | `pages/records-index.css` | Pages | Records page padding | なし | record.css も同名 `.records-page` を定義 |
| 131 | `.page-header` | `pages/records-index.css` | Pages | header 下余白 | なし | About/Logs/Others/Blog が利用 |
| 132 | `.page-description` | `pages/records-index.css` | Pages | description 色 | なし |  |
| 133 | `.records-filter` | `pages/records-index.css` | Pages | filter grid/panel | あり | mobile 1 列、state hide |
| 134 | `.records-count` | `pages/records-index.css` | Pages | count margin/weight | なし | record.css で margin を後段再定義 |
| 135 | `.records-list` | `pages/records-index.css` | Pages | record list gap 1.5rem | なし | home.css の gap 1rem を後段変更 |
| 136 | `.record-card-link` | `pages/records-index.css` | Pages | link display/color | なし | component と同値再定義 |
| 137 | `.record-card` | `pages/records-index.css` | Pages | Records card gap/280px design/surface | あり | component の共通規則を後段上書き |
| 138 | `.record-card-link:hover .record-card` | `pages/records-index.css` | Pages | link hover translate | なし | component hover と併存 |
| 139 | `.record-card-image` | `pages/records-index.css` | Pages | image column 280px | あり | component は 240px |
| 140 | `.record-card-image img` | `pages/records-index.css` | Pages | image size/object-fit/aspect ratio | あり |  |
| 141 | `.record-card-content` | `pages/records-index.css` | Pages | content flex/padding | なし | component padding と異なる |
| 142 | `.record-card-title` | `pages/records-index.css` | Pages | title margin/color | なし | component font/line/weight と併存 |
| 143 | `.record-card-meta` | `pages/records-index.css` | Pages | meta margin/font/color | なし | component flex/gap と併存 |
| 144 | `.record-card-summary` | `pages/records-index.css` | Pages | summary margin/color | なし | component font/line と併存 |
| 145 | `.records-condition-summary` | `pages/records-index.css` | Pages | selected condition panel | なし | HTML はあるが JS は text 設定なし |
| 146 | `.records-condition-bar` | `pages/records-index.css` | Pages | reset action bar alignment | あり | mobile left align |
| 147 | `.record-empty-message` | `pages/records-index.css` | Pages | empty text margin/color | なし |  |
| 148 | `.records-page.is-search-active .records-filter` | `pages/records-index.css` | Pages | mobile search 後 filter hide | あり | records.js が state 付与 |
| 149 | `.records-page.is-search-active .records-condition-bar` | `pages/records-index.css` | Pages | mobile condition bar display | あり |  |
| 150 | `.records-container` | `pages/record.css` | Pages | records container 最大幅 | なし | current records/index.html は未使用 |
| 151 | `.records-filter-panel` | `pages/record.css` | Pages | filter panel margin | なし | current records/index.html は未使用 |
| 152 | `.records-pagination` | `pages/record.css` | Pages | pager margin | なし | current records/index.html は `.pagination` を利用 |
| 153 | `.logs-page` | `pages/logs-index.css` | Pages | Logs page padding | なし |  |
| 154 | `.logs-filter` | `pages/logs-index.css` | Pages | filter grid/panel | あり | `background: --color-panel-bg` は無効 |
| 155 | `.logs-count` | `pages/logs-index.css` | Pages | count margin/weight | なし |  |
| 156 | `.logs-list` | `pages/logs-index.css` | Pages | logs list flex/gap | なし | logs.js が card を追加 |
| 157 | `.log-card` | `pages/logs-index.css` | Pages | log card surface/padding/transition | なし | `border: 1px solid --color-card-border` は無効 |
| 158 | `.log-card:hover` | `pages/logs-index.css` | Pages | hover translate | なし |  |
| 159 | `.log-card-title` | `pages/logs-index.css` | Pages | title margin/color | なし | JS が生成 |
| 160 | `.log-card-meta` | `pages/logs-index.css` | Pages | meta margin/font/color | なし | JS が生成 |
| 161 | `.log-card-summary` | `pages/logs-index.css` | Pages | summary margin | なし | JS が生成 |
| 162 | `.log-card-source` | `pages/logs-index.css` | Pages | source badge layout/typography | なし | JS が生成 |
| 163 | `.log-card.source-hiro .log-card-source` | `pages/logs-index.css` | Pages | hiro source badge 色 | なし | JS class source-hiro |
| 164 | `.log-card.source-sb .log-card-source` | `pages/logs-index.css` | Pages | sb source badge 色 | なし | JS class source-sb |
| 165 | `.log-card.source-st .log-card-source` | `pages/logs-index.css` | Pages | st source badge 色 | なし | JS class source-st |
| 166 | `.checkbox-group` | `pages/logs-index.css` | Pages | checkbox flex/wrap/gap | なし | component と同値重複 |
| 167 | `.checkbox-group input` | `pages/logs-index.css` | Pages | checkbox input 右 margin | なし | Logs only use |
| 168 | `.logs-condition-summary` | `pages/logs-index.css` | Pages | search condition summary | なし | `background: --color-condition-bg` は無効 |
| 169 | `.logs-condition-bar` | `pages/logs-index.css` | Pages | summary/action flex layout | あり | mobile column |
| 170 | `.logs-condition-actions` | `pages/logs-index.css` | Pages | action flex/wrap/gap | あり | mobile left alignment |
| 171 | `.logs-page.is-search-active .logs-filter` | `pages/logs-index.css` | Pages | mobile search 後 filter hide | あり | logs.js が state 付与 |
| 172 | `.logs-page.is-search-active .logs-condition-summary` | `pages/logs-index.css` | Pages | mobile summary display | あり |  |
| 173 | `.about-page` | `pages/about.css` | Pages | About padding | あり | mobile 1.5rem |
| 174 | `.about-page section` | `pages/about.css` | Pages | section margin | あり |  |
| 175 | `.about-page h2` | `pages/about.css` | Pages | heading border/margin | なし |  |
| 176 | `.about-page p` | `pages/about.css` | Pages | text margin/line-height | なし |  |
| 177 | `.about-page p:last-child` | `pages/about.css` | Pages | last paragraph margin reset | なし |  |
| 178 | `.blog-page` | `pages/blog.css` | Pages | Blog padding | あり | mobile 1.5rem |
| 179 | `.post-list` | `pages/blog.css` | Pages | post list flex/gap | なし |  |
| 180 | `.post-content figure` | `pages/blog.css` | Pages | figure margin/alignment | なし | post layout |
| 181 | `.post-content img` | `pages/blog.css` | Pages | post image sizing/radius | なし | post layout |
| 182 | `.post-content figcaption` | `pages/blog.css` | Pages | caption typography | なし | post layout |
| 183 | `.other-page` | `pages/others.css` | Pages | Others padding | あり | mobile 1.5rem |
| 184 | `.other-nav` | `pages/others.css` | Pages | navigation flex/gap/margin | あり | mobile margin |
| 185 | `.other-nav a` | `pages/others.css` | Pages | nav link appearance | なし |  |
| 186 | `.other-nav a:hover` | `pages/others.css` | Pages | hover translate | なし |  |
| 187 | `.other-section` | `pages/others.css` | Pages | section bottom margin | あり | mobile margin |
| 188 | `.other-section:last-child` | `pages/others.css` | Pages | last section margin reset | なし |  |
| 189 | `.section-intro` | `pages/others.css` | Pages | intro margin | なし |  |
| 190 | `.link-group` | `pages/others.css` | Pages | group margin | なし |  |
| 191 | `.link-group:last-child` | `pages/others.css` | Pages | last group margin reset | なし |  |
| 192 | `.link-group h3` | `pages/others.css` | Pages | group heading margin | なし |  |
| 193 | `.link-list` | `pages/others.css` | Pages | link grid/list reset | なし |  |
| 194 | `.link-card` | `pages/others.css` | Pages | card surface/radius/shadow | なし |  |
| 195 | `.link-card a` | `pages/others.css` | Pages | card link block/padding | なし |  |
| 196 | `.link-title` | `pages/others.css` | Pages | link title typography | なし |  |
| 197 | `.link-desc` | `pages/others.css` | Pages | description line-height | なし |  |
| 198 | `.coming-soon` | `pages/others.css` | Pages | future content panel | なし |  |
| 199 | `.coming-soon p` | `pages/others.css` | Pages | paragraph margin | なし |  |
| 200 | `.coming-soon p:last-child` | `pages/others.css` | Pages | last paragraph margin reset | なし |  |
| 201 | `.error-page` | `pages/error.css` | Pages | Error page padding | あり | mobile 3rem |
| 202 | `.error-content` | `pages/error.css` | Pages | content width/alignment | なし |  |
| 203 | `.error-content h1` | `pages/error.css` | Pages | 404 heading size/line | あり | mobile 3rem |
| 204 | `.error-content h2` | `pages/error.css` | Pages | heading margin | なし |  |
| 205 | `.error-content p` | `pages/error.css` | Pages | paragraph margin | なし |  |
| 206 | `.error-links` | `pages/error.css` | Pages | action flex/gap/margin | あり | mobile column/center |

## 非現行 CSS の索引

| No | ファイル | CSS rule header 実測数 | V5 参照 | Rev.4 判定 | 備考 |
|---:|---|---:|---|---|---|
| 207 | `legacy_v4/css/style.css` | 参照対象外 | なし | legacy | legacy_v4 HTML からのみ参照 |
| 208 | `legacy_v4/css/search.css` | 参照対象外 | なし | legacy | legacy_v4 search/logs からのみ参照 |
| 209 | `legacy_v4/css/SBsearch.css` | 参照対象外 | なし | legacy | legacy_v4 SB logs からのみ参照 |
| 210 | `legacy_v4/css/STsearch.css` | 参照対象外 | なし | legacy | legacy_v4 ST logs からのみ参照 |
| 211 | `legacy_v4/css/other.css` | 参照対象外 | なし | legacy | legacy_v4 other からのみ参照 |
| 212 | `assets/css/style.css.old` | 参照対象外 | なし | backup | 現行 layout の参照先ではない |
| 213 | `assets/css/style.css.backup` | 参照対象外 | なし | backup | 現行 layout の参照先ではない |

非現行 CSS はワークスペース検索の対象に含めたが、V5 の entry point から読み込まれず、現行 selector の最終 computed value に作用しない。このため 001～206 の selector-level comparison と混在させず、CSS-R4-016 で保管・削除判断を管理する。

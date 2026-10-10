# CSS Rev.4 変更管理台帳

本台帳は将来の CSS 変更に使用する。管理番号はレビュー台帳・To-Be 台帳の管理番号を参照する。今回の作成作業は CSS を変更していないため、初期登録だけを記録する。

| 管理番号 | 変更日 | 変更内容 | 対象ファイル | 対象セレクタ | 変更理由 | 実施者 | 確認者 | GitHub反映 | 動作確認 | 備考 |
|---|---|---|---|---|---|---|---|---|---|---|
| CSS-R4-001 | 未実施 | Logs の無効 token 参照を修正予定 | `assets/css/pages/logs-index.css` | `.logs-filter`、`.log-card`、`.logs-condition-summary` | レビューで `var()` 不使用の 3 宣言を確認 | 未定 | 未定 | 未反映 | 未実施 | To-Be 台帳 CSS-R4-001 を参照 |
| CSS-R4-003 | 未実施 | Header mobile rule の集中管理予定 | `assets/css/layout/header.css`、`assets/css/layout/responsive.css` | `.header-inner`、`.site-brand`、`.site-logo`、`.site-title` | Rev.4 responsive 集中管理 | 未定 | 未定 | 未反映 | 未実施 | To-Be 台帳 CSS-R4-003 を参照 |
| CSS-R4-004 | 未実施 | Navigation mobile rule の集中管理予定 | `assets/css/layout/navigation.css`、`assets/css/layout/responsive.css` | `.site-nav`、`.nav-toggle`、`.nav-menu`、`.nav-overlay` | Rev.4 responsive 集中管理 | 未定 | 未定 | 未反映 | 未実施 | `body.nav-open` は reset.css に維持 |
| CSS-R4-008 | 未実施 | Record Card の責務分離予定 | `assets/css/components/card.css`、`assets/css/pages/home.css`、`assets/css/pages/records-index.css` | `.home-record-*`、`.record-card*` | 同一セレクタの後段上書きを解消 | 未定 | 未定 | 未反映 | 未実施 | To-Be 台帳 CSS-R4-008 を参照 |
| CSS-R4-009 | 未実施 | checkbox group 重複の整理予定 | `assets/css/components/form.css`、`assets/css/pages/logs-index.css` | `.checkbox-group`、`.checkbox-group input` | 共通責務と Logs 固有責務を分離 | 未定 | 未定 | 未反映 | 未実施 | To-Be 台帳 CSS-R4-009 を参照 |
| CSS-R4-010 | 未実施 | Pagination mobile rule の移管予定 | `assets/css/components/pagination.css`、`assets/css/layout/responsive.css` | `.pagination`、`.pagination-btn`、`.pagination-dots` | Rev.4 responsive 集中管理 | 未定 | 未定 | 未反映 | 未実施 | To-Be 台帳 CSS-R4-010 を参照 |
| CSS-R4-011 | 未実施 | Records mobile rule の移管予定 | `assets/css/pages/records-index.css`、`assets/css/layout/responsive.css` | `.records-*`、`.records-page.is-search-active .records-filter` | Rev.4 responsive 集中管理 | 未定 | 未定 | 未反映 | 未実施 | To-Be 台帳 CSS-R4-011 を参照 |
| CSS-R4-012 | 未実施 | Logs mobile rule の移管予定 | `assets/css/pages/logs-index.css`、`assets/css/layout/responsive.css` | `.logs-*`、`.log-card*` | Rev.4 responsive 集中管理 | 未定 | 未定 | 未反映 | 未実施 | CSS-R4-001 と同一変更で検証 |
| CSS-R4-013 | 未実施 | Page shell mobile rule の移管予定 | 各 `assets/css/pages/*.css`、`assets/css/layout/responsive.css` | 各 `.*-page` | Rev.4 responsive 集中管理 | 未定 | 未定 | 未反映 | 未実施 | 値の統一は含めない |
| CSS-R4-014 | 未実施 | Record mobile rule の移管予定 | `assets/css/pages/record.css`、`assets/css/layout/responsive.css` | `.record-*`、`.gallery-*` | Rev.4 responsive 集中管理 | 未定 | 未定 | 未反映 | 未実施 | To-Be 台帳 CSS-R4-014 を参照 |
| CSS-R4-015 | 未実施 | 固定ページ mobile rule の移管予定 | About/Blog/Others/Error の各 CSS、`responsive.css` | 各 page selector | Rev.4 responsive 集中管理 | 未定 | 未定 | 未反映 | 未実施 | To-Be 台帳 CSS-R4-015 を参照 |
| CSS-R4-016 | 2026-10-01 | legacy／backup CSS の現状登録 | `legacy_v4/css/*.css`、`assets/css/style.css.old`、`assets/css/style.css.backup` | 当該ファイルの全 selector | 現行 V5 entry point から未参照であることを記録 | Codex | 未確認 | 未反映 | 参照検索済み | CSS の変更なし |
| CSS-R4-017 | 2026-10-10 | PC 版情報密度調整用 Design Tokens 追加と適用 | `assets/css/base/variables.css`、`assets/css/base/reset.css`、`assets/css/layout/common.css`、`assets/css/components/card.css`、`assets/css/pages/home.css`、`assets/css/pages/records-index.css`、`assets/css/pages/logs-index.css` | `--density-*`、`body`、`.page-header`、`.section`、`.home-record-content`、`.record-card-content`、`.home-page`、`.records-page`、`.logs-page`、`.records-filter`、`.logs-filter`、`.log-card` | PC 版で 1 画面内に表示できるコンテンツ量を増やすため | Codex | hiro-san | 未反映 | CSS 差分確認、対象ファイル確認、波括弧数確認。実ブラウザ確認は未実施 | HTML/JS 変更なし。769px 以上のみ対象 |

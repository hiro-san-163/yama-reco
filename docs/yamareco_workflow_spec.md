# 新規山行記録の生成・追加 運用マニュアル兼システム仕様書

## 1. 概要・目的
本ドキュメントは、ヤマレコからダウンロードした山行記録（CSV）を加工し、正本Excel（`records_master.xlsx`）への蓄積、JSONデータ化、およびWebサイト（Jekyll等）公開用のMarkdown生成までを行う一連の業務フローとデータ仕様を定めるものである。

### 1.1. 基本方針・システム構成
* **作業用ファイルと正本の分離**: ダウンロード直後の加工には作業用ファイル（`recordsyyyymmdd.xlsx`）を使用し、重複チェックと検証を経てから正本（`records_master.xlsx`）へ統合する。
* **自動化と検証のハイブリッド運用**: 加工・変換・検証はPython等のスクリプトによる一括自動化を基本とし、各工程の節目で自動チェック（スクリプト検証）および目視確認を挟んで品質を担保する。
* **スプレッドシート環境への対応**: Microsoft Excel のほか、Google スプレッドシートで編集し `.xlsx` 形式でダウンロードしたファイルでも同一フローで処理できる設計とする。
* **マスターデータの役割**: `records_master.xlsx` は表示用最適化ではなく、後工程（JSON生成、Markdown生成、山行一覧・検索・山域別整理）の源泉となる一貫性のあるマスターデータとして維持する。`map` 列には表示サイズやHTMLタグ（`<iframe>` 等）を含めず**純粋なURLのみ**を保持し、PC・タブレット・スマホなどの閲覧環境に応じたレスポンシブサイズ調整は公開サイト（Jekyll）側のフロントエンド処理で動的に行う。

---

## 2. 全体処理フロー（手順と実行主体）

| 工程 | フェーズ | 主な処理内容 | 実行主体 | 検証・確認ポイント（ゲート） |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **データ取得** | ヤマレコからCSVをダウンロードし、作業用Excelとして保存 | 手動 | 文字化けがないことの確認 |
| **2** | **データ整形・生成** | 項目変換、日付・期間・ID算出、`summary`整形、`sm2`要約生成 | スクリプト＋Copilot | 変換件数、日付形式、文字数、欠損値の自動チェック |
| **3** | **メディア情報登録** | 代表写真・ギャラリー写真・地図のURLとコメントを手動登録 | 手動 | URLの貼り付け漏れ・誤りがないことの確認 |
| **4** | **地図コード整形** | `map` 列に貼り付けたインラインフレーム用コードの除去 | スクリプト | URLのみが正しく抽出されているかの自動チェック |
| **5** | **正本への統合** | `records_master.xlsx` との重複確認および先頭への降順追加 | スクリプト | `record_id` の重複ゼロ、ソート順の自動検証 |
| **6** | **JSON生成・反映** | `excel_to_json.py` によるJSON生成、差分確認、本番JSON反映 | スクリプト＋承認 | 生成JSONと本番JSONの差分確認・承認 |
| **7** | **Markdown化・公開** | JSONからのMarkdown生成、ローカルビルド検証、GitHub反映 | スクリプト＋手動 | IDと記事の対応、Jekyllビルド、レスポンシブ表示の確認 |

---

## 3. 各工程の詳細手順と仕様

### 工程1：ヤマレコからのデータ取得【手動】
1. Webブラウザでヤマレコ（https://yamareco.com）を開き、「ユーザーメニュー」＞「マイページ」＞「山行記録」の順に移動する。
2. 「記録一覧（CSV）」の右側にある「詳細設定」を開く。
3. 書き出し対象データについて、デフォルト選択項目（「日程」「場所」「エリア」「ジャンル」「メンバー」「記録ページのURL」）に加え、**「天気」「コースタイム」「コース状況及びその他情報」「感想」**にチェックを入れる。
4. 「全項目出力する」にチェックが入っていることを確認し、CSVをダウンロードする（`records(*).csv`）。
5. ダウンロードしたCSVを開いて文字化けがないことを確認し、任意の作業フォルダへコピーする。
6. Excelまたは Google スプレッドシートで読み込み、文字が正しく表示されることを確認した上で、Excel形式（`.xlsx`）で保存する。
   * **作業用ファイル名**: `recordsyyyymmdd.xlsx`（`yyyymmdd` はダウンロード日。例：`records20261118.xlsx`）
   * **Google スプレッドシート利用時の手順**: スプレッドシートにインポート後、「ファイル」＞「ダウンロード」＞「Microsoft Excel（.xlsx）」を選択し、上記ファイル名でリポジトリの作業フォルダに保存する。

---

### 工程2：項目整理・データ変換・要約生成【スクリプト＋Copilot Chat】
作業用ファイル（`recordsyyyymmdd.xlsx`）に対し、以下の仕様に基づき項目変換・新規生成・初期値設定を一括実行する。
（※外部LLM APIは使用せず、2-A：Python前処理 → 2-B：VS Code Copilot Chat による要約生成 → 2-C：Python取り込み＆検証 の順に進める）

#### 2.1. 項目名の変換および追加・並び順（全23項目）
以下の順序（1〜23）で列を構成し、Excel出力する。

| 順 | 変換後の項目名 | 元の項目名（ヤマレコCSV） | データ種別・初期値・備考 |
| :--- | :--- | :--- | :--- |
| 1 | `date_s` | 日程 | 開始日（`yyyy-mm-dd` 形式に変換） |
| 2 | `date_e` | *(新規追加)* | 終了日（初期値：`null`、範囲表記時のみ生成） |
| 3 | `duration` | *(新規追加)* | 山行日数（整数、単位：日） |
| 4 | `record_id` | *(新規追加)* | 記録ID（URLから抽出） |
| 5 | `title` | 場所 | 山行タイトル・山名 |
| 6 | `area` | エリア | 山域 |
| 7 | `genre` | ジャンル | カンマ区切り文字列（例：`沢登, 日帰り`） |
| 8 | `members` | メンバー | カンマ区切り文字列（例：`hiro-san, silverboy`） |
| 9 | `weather` | 天気 | 天候 |
| 10 | `course_time` | コースタイム | コースタイム |
| 11 | `course_note` | コース状況及びその他情報 | 改行を保持する |
| 12 | `summary` | 感想 | 感想本文（クレンジング済み、改行を保持） |
| 13 | `sm2` | *(新規追加)* | 一覧カード・記事冒頭表示用の要約文 |
| 14 | `yamareco_url` | 記録ページのURL | ヤマレコ記録URL |
| 15 | `map` | *(新規追加)* | 地図URL（初期値：`null`、工程3で手動入力） |
| 16 | `tm` | *(新規追加)* | 代表写真URL（初期値：`null`、工程3で手動入力） |
| 17 | `tmfg` | *(新規追加)* | 代表写真コメント（初期値：`null`、工程3で手動入力） |
| 18 | `gp1` | *(新規追加)* | ギャラリー写真1 URL（初期値：`null`） |
| 19 | `gpfg1` | *(新規追加)* | ギャラリー写真1 コメント（初期値：`null`） |
| 20 | `gp2` | *(新規追加)* | ギャラリー写真2 URL（初期値：`null`） |
| 21 | `gpfg2` | *(新規追加)* | ギャラリー写真2 コメント（初期値：`null`） |
| 22 | `gp3` | *(新規追加)* | ギャラリー写真3 URL（初期値：`null`） |
| 23 | `gpfg3` | *(新規追加)* | ギャラリー写真3 コメント（初期値：`null`） |

#### 2.2. 各項目の変換・生成ルール
* **`date_s`（開始日）変換ルール**
  * `yyyy-mm-dd` 形式に変換し、Excelで日付として認識可能な形式にする（例：`2026年5月1日` → `2026-05-01`）。
  * Google スプレッドシート経由などで発生しやすい日付書式の揺れ（`yyyy/m/d`、Excelシリアル値等）も統一的に吸収して `yyyy-mm-dd` に変換する。
* **`date_e`（終了日）生成ルール**
  * 元の「日程」に範囲表記（`～`）がある場合のみ生成し、開始日の年を補完して `yyyy-mm-dd` 形式とする。範囲表記がない場合は `null` とする。
  * 例：`2026年5月1日～5月3日` → `date_s = 2026-05-01`、`date_e = 2026-05-03`
* **`duration`（日数）生成ルール**
  * 計算式：`duration = (date_e - date_s) + 1`（単位：日）。
  * `date_e` が `null` の場合は `duration = 1` とする。
* **`record_id`（記録ID）生成ルール**
  * `yamareco_url` から正規表現 `detail-([0-9]{5,10})\.html` に一致する数字部分を抽出する（例：`https://yamareco.commodules/yamareco/detail-1234567.html` → `1234567`）。取得できない場合は `null` とする。
* **`genre` / `members` 出力ルール**
  * 将来JSONへ配列変換しやすいよう、カンマ区切り文字列として出力する（例：`沢登, 日帰り`）。
* **`summary`（感想本文）クレンジングルール**
  * `summary` 内に含まれる署名文字列（例：`[hiro-san]--`、`[xxxxx]--`）を、表記揺れも考慮して削除する。本文のそれ以外の箇所や改行は変更しない。
* **`sm2`（一覧表示用要約）生成ルール**
  * `summary` をもとに、VS Code Copilot Chat を用いて要約文を生成する（`summary` 自体は変更しない）。生成できない場合は `null` とする。
  * **要約プロンプト条件**:
    * **役割**: 新聞や雑誌、Webメディアで記事を編集・執筆するプロの編集者、登山愛好家として200字程度の自然な日本語で要約する。
    * **文字数**: 約180〜230文字程度。
    * **構成**: 登山開始から下山までを時系列でまとめ、景色・天候・登山道状況、印象的な出来事を含め、最後に山行全体の印象をまとめる。
    * **制約**: 箇条書きを使用しない。原文の雰囲気・文体をできるだけ維持する。要約文のみを出力する。

#### 2.3. Excel出力・読み込み仕様（共通）
* 文字コードはUTF-8とし、1行1山行で出力する。
* 列幅を自動調整し、Excelで編集しやすい形式にする。
* `summary` および `course_note` のセル内改行を保持する。
* Google スプレッドシートからの `.xlsx` 書き出し時に発生する空セル（`NaN`）は適切に `null`（または初期値）として扱う。
* 不明な値や判断できない項目は推測で補完せず、`null` または元データのまま保持する。

#### 2.4. 工程2の検証ポイント（自動チェック＋目視）
* 全レコードの `date_s`、`date_e`、`duration`、`record_id` がルール通りに算出されているか。
* `sm2` が180〜230文字の範囲内に収まっているか、不自然な途切れや箇条書きがないか。

---

### 工程3：写真・コメント・地図URLの登録【手動】
作業用ファイル（`recordsyyyymmdd.xlsx`）を Excel または Google スプレッドシートで開き、ヤマレコの対象記録ページからメディア情報を転記する。

1. **代表写真の登録**
   * ヤマレコのマイページから対象の山行記録を開き、代表写真を選ぶ。
   * 画像リンクをコピーし、`tm` 列に貼り付ける。
   * 代表写真のコメント（キャプション）をコピーし、`tmfg` 列に貼り付ける。
2. **ギャラリー写真の登録**
   * ギャラリー写真（最大3枚）についても同様に、画像リンクを `gp1`〜`gp3` に、**コメントを `gpfg1`〜`gpfg3` に**それぞれ貼り付ける。
3. **地図コードの登録**
   * ヤマレコの対象記録ページで「地図出力・その他の機能」＞「ブログに貼り付け」を選択する。
   * 「コードをコピー」をクリックし、`map` 列に貼り付ける。
4. **保存・ダウンロード・確認**
   * 貼り付け列のズレ（URL欄にコメントが入っていないか等）を目視確認する。
   * Excelの場合は上書き保存する。Google スプレッドシートで編集した場合は、「ファイル」＞「ダウンロード」＞「Microsoft Excel（.xlsx）」からダウンロードし、作業フォルダの `recordsyyyymmdd.xlsx` を更新する。

---

### 工程4：地図インラインフレーム用コードの除去【スクリプト】
1. `map` 列に貼り付けられた文字列（`<iframe ... src="URL" ...></iframe>` 等）から、正規表現（`src=["'](https?://[^"']+)["']`）を用いて `src` 属性内の純粋な地図URLのみを抽出・上書きする。
2. すでに純粋なURL（`http://` または `https://` で始まる文字列）のみが格納されているセルはそのまま維持し、複数回実行しても結果が変わらない冪等性（べきとうせい）を担保する。
3. **検証ポイント**: 全対象行（`null` を除く）の `map` 列に `<` や `>` などのHTMLタグ文字列が残存しておらず、有効なURL形式（`https://...`）になっていることをスクリプトで自動検証し、保存する。

---

### 工程5：Excel正本（`records_master.xlsx`）への統合【スクリプト】
1. 作業用ファイル（`recordsyyyymmdd.xlsx`）と正本（`records_master.xlsx`）を突合し、`record_id` に重複がないかチェックする（重複がある場合はエラー停止または警告）。
2. 新規追加分のデータを `date_s`（または `record_id`）の**降順**に並べ替え、正本 `records_master.xlsx` の既存データの先頭に追加して保存する。
   * *(補足)* 別系統のマスター（`SBrecords.csv` → `SBrecords.xlsx`、`STrecords.csv` → `STrecords.xlsx`）を扱う場合も、入力ファイル名に応じた正本へ同様のルールで統合する。
3. **検証ポイント**: 正本への追加前後でレコード件数が「既存件数＋新規件数」と一致していること、重複がないことをスクリプトで自動確認する。

---

### 工程6：JSON生成および本番データへの反映【スクリプト＋承認】
1. 既存の変換スクリプト（`excel_to_json.py`）を実行し、追加分のJSONデータを生成する。
2. 生成された追加JSONデータを、降順で既存JSONデータの先頭に追加する。
3. **検証・承認ポイント**: 生成されたJSONと本番JSONの差分（diff）を出力・確認し、問題がないことを承認した上で本番JSONデータへ反映する。

---

### 工程7：Markdown生成・サイト検証・GitHub反映【スクリプト＋手動】
1. **JSON → Markdown生成**
   * 本番JSONをもとに、Webサイト公開用のMarkdownファイルを自動生成する（既存の手動作成手順および既存生成物のフォーマットに準拠）。
   * フロントマターの `map` フィールドには純粋なURL文字列のみを出力し、Markdown記事内に固定サイズの `<iframe>` タグは直接記述しない。
2. **レスポンシブ地図描画の実装仕様（Jekyllテンプレート・JavaScript）**
   * **テンプレート側（受け渡し）**: Jekyllのレイアウトまたはインクルードテンプレートにおいて、地図表示位置に `<div class="yamareco-map" data-url="{{ page.map }}"></div>` の形式でコンテナ要素を配置し、`data-url` 属性経由で地図URLを受け渡す。
   * **JavaScript側（動的サイズ計算と生成）**:
     1. ページ読み込み時およびウィンドウリサイズ（画面回転）時に `.yamareco-map` の親要素幅を取得し、PC・タブレット・スマホの各閲覧環境に適合する表示幅 `w`（最小 `280px` 〜 最大 `800px`）を算出する。
     2. 端末幅に応じたアスペクト比（スマホ `480px` 未満は `0.75`、タブレット・PCは `0.62`）から地図の高さ `h` を算出する。
     3. `URL` オブジェクトを用いて `data-url` 内のクエリパラメータ `w` と `h` を算出した値へ動的に書き換える。
     4. 標高グラフパラメータの有無（`graph=1` の場合は `+182px`、`graph=0` の場合は `+36px`）に応じて外枠の高さを自動判定・加算し、`loading="lazy"` を付与した `<iframe>` 要素をDOM内に動的生成して描画する。
3. **投稿・ローカルサイト検証**
   * 生成されたJSONの `record_id` とMarkdown投稿ファイルの対応関係に過不足がないか確認する。
   * ローカル環境でJekyllビルドを実行し、エラーが出ないこと、PC・タブレット・スマホの各画面幅で地図および標高グラフのレイアウト崩れがないことを確認する。
4. **GitHub反映（公開）**
   * 手動にて変更差分を確認し、GitHubリポジトリへコミット・プッシュを行う。
   * 公開サイト上で新規山行記録の一覧表示（`sm2`）・詳細ページ（`summary`、写真、地図）が正しく表示されることを最終確認する。

---

## 4. スクリプト実行例

以下はリポジトリのルートフォルダで PowerShell を使う場合の例である。`yyyymmdd` は実際の作業用ファイル名に置き換える。候補ファイルは工程ごとに確認し、`--apply` を付ける操作は承認後にのみ実行する。

```powershell
New-Item -ItemType Directory -Force work | Out-Null

# 工程2-A: Excelを正規化し、Copilot Chat用入力を作成
python -m scripts.record_workflow.prepare `
  --input work\records20261128.xlsx `
  --output work\prepared.xlsx `
  --copilot-output work\sm2-input.json
```

`work\sm2-input.json` の内容を Copilot Chat に渡し、指示されたJSON形式の回答を `work\sm2-output.json` として保存する。工程2-Bの内容とJSON構造を確認した後、工程2-Cで取り込む。

```powershell
# 工程2-C: 要約IDと180〜230文字を検証
python -m scripts.record_workflow.import_sm2 `
  --input work\prepared.xlsx `
  --summaries work\sm2-output.json `
  --output work\with-sm2.xlsx

# 工程3: with-sm2.xlsx に写真・コメント・mapを手動登録して保存した後に実行
# 工程4: map列をURLに正規化（入力ファイルは変更しない）
python -m scripts.record_workflow.clean_map `
  --input work\with-media.xlsx `
  --output work\map-cleaned.xlsx

# 工程5: 正本への追加候補を作成
python -m scripts.record_workflow.merge_master `
  --input work\map-cleaned.xlsx `
  --master data\records_master.xlsx `
  --output work\records-master-candidate.xlsx

# 候補を確認した後、正本が候補作成時から変わっていないことを検証
python -m scripts.record_workflow.promote_master `
  --input work\map-cleaned.xlsx `
  --master data\records_master.xlsx `
  --candidate work\records-master-candidate.xlsx

# 上の検証結果と候補を承認した場合のみ、バックアップ付きで正本を更新
python -m scripts.record_workflow.promote_master `
  --input work\map-cleaned.xlsx `
  --master data\records_master.xlsx `
  --candidate work\records-master-candidate.xlsx `
  --apply
```

```powershell
# 工程6: 候補Excelから候補JSONを生成し、まず差分を確認
python excel_to_json.py `
  --input work\records-master-candidate.xlsx `
  --output work\records-master-candidate.json
python -m scripts.record_workflow.publish_json `
  --candidate work\records-master-candidate.json `
  --production data\records_master.json

# 差分を承認した場合のみ本番JSONへ反映（バックアップを作成）
python -m scripts.record_workflow.publish_json `
  --candidate work\records-master-candidate.json `
  --production data\records_master.json `
  --apply

# 工程7: 新規記事をレビュー用フォルダに生成し、ID・日付の対応を検証
python -m scripts.record_workflow.generate_posts `
  --records data\records_master.json `
  --posts-dir _posts `
  --output-dir work\generated_posts
python -m scripts.record_workflow.validate_posts `
  --records data\records_master.json `
  --posts-dir _posts `
  --candidate-dir work\generated_posts
ridk exec bundle exec jekyll build
```

`work\generated_posts` の記事を目視確認してから `_posts` へ追加する。既存記事を含むJSON項目の変更が差分に出た場合は内容を確認し、承認できる変更に限り `publish_json` に `--allow-existing-changes` を追加する。

## 5. ディレクトリ構成（参考構成）
※以下は本ワークフローにおける標準的なファイル配置の**参考構成**である。実際の実装・適用にあたっては、既存のローカル環境およびGitHubリポジトリのディレクトリ構造との整合性を確認し、既存パスに合わせて読み替えること。

```text
project-root/
├── work/                         # 作業用フォルダ（工程1〜4）
│   ├── records(*).csv            # ヤマレコからダウンロードした元CSV
│   └── recordsyyyymmdd.xlsx      # 日次作業用Excel
├── master/                       # 正本データ格納フォルダ（工程5）
│   └── records_master.xlsx       # 累積正本Excel
├── scripts/                      # 各種自動化スクリプト
│   ├── clean_map_url.py          # 工程4: map列のiframe除去・URL抽出スクリプト
│   └── excel_to_json.py          # 工程6: Excel→JSON変換スクリプト
├── _data/                        # Jekyllデータディレクトリ
│   └── records.json              # 本番JSONデータ
├── _posts/                       # Jekyll投稿ディレクトリ
│   └── yyyy-mm-dd-record.md      # 生成された山行記録Markdown
├── _includes/                    # Jekyll共通パーツ
│   └── yamareco_map.html         # 工程7: 地図コンテナ用テンプレート（data-url受け渡し）
└── assets/
    └── js/
        └── yamareco_map.js       # 工程7: レスポンシブ地図描画スクリプト
```

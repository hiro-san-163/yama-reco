# 山行記録ワークフロー自動化ツール

このツール群は [yamareco_workflow_spec.md](./yamareco_workflow_spec.md) に沿い、工程ごとの確認を維持して山行記録を追加します。外部LLM APIは呼び出しません。入力・候補出力は `work/` に置き、`work/` はGit管理対象外です。

## 事前準備

リポジトリのルートで依存パッケージを準備します。

```powershell
python -m pip install -r requirements.txt
New-Item -ItemType Directory -Force work
```

## 工程2-A：Excelの前処理

```powershell
python -m scripts.record_workflow.prepare --input work\records20261126.xlsx --output work\01-prepared.xlsx
```

元ファイルは変更せず、23項目のExcelと `work\01-prepared.sm2-input.json` を出力します。日付セル、`yyyy/m/d`、日本語日付、Excelシリアル値を扱い、空セルを空文字に正規化します。日付・記録ID・署名除去の結果とCopilot用JSONを確認してください。

## 工程2-B：Copilot Chatで要約

`01-prepared.sm2-input.json` をCopilot Chatに指定し、JSON内の `prompt` に従って `summaries` 配列を作成します。回答を `work\02-sm2.json` として保存してください。各要素は `record_id` と `sm2` を持つ形式です。

## 工程2-C：要約の取り込み・検証

```powershell
python -m scripts.record_workflow.import_sm2 --input work\01-prepared.xlsx --summaries work\02-sm2.json --output work\03-sm2-validated.xlsx
```

全IDへの対応、余分・重複IDの有無、`sm2` の180〜230文字を検証します。失敗時は出力しません。生成文の内容・自然さは目視でも確認してください。

## 工程3・4：メディア登録と地図URL整形

Excelで写真・コメント・地図コードを入力後、候補ファイルへ整形します。

```powershell
python -m scripts.record_workflow.clean_map --input work\03-media.xlsx --output work\04-map-clean.xlsx
```

iframeの `src` URLと、URL後ろにiframe属性が連結した既存形式を扱います。純粋なURLは変更しません。エラーがある場合は全体を保存せず、変換件数・変更なし件数を表示します。正本を直接整形する場合も同じスクリプトを使えますが、事前確認後に `--in-place` を指定してください。自動でタイムスタンプ付きバックアップを作成します。

現在の正本Excelにも過去の属性残りが3件あります。初回の新規統合前に、バックアップを確認した上で正本を一括整形してください。

```powershell
python -m scripts.record_workflow.clean_map --input data\records_master.xlsx --in-place
```

統合・JSON公開・新規記事生成は、対象レコードの `map` が空欄または純粋なHTTP(S) URLであることを検証します。

## 工程5：正本への統合候補作成

```powershell
python -m scripts.record_workflow.merge_master --input work\04-map-clean.xlsx --master data\records_master.xlsx --output work\05-master-candidate.xlsx
```

新規IDの重複、要約文字数、地図URL、件数を検証します。新規分は日付・IDの降順で先頭に挿入されます。正本は変更しません。候補の内容を確認してから、承認された手順で正本へ反映してください。

## 工程6：JSON候補の生成・確認・反映

まず既存の変換処理でJSON候補を作ります。

```powershell
python excel_to_json.py --input work\05-master-candidate.xlsx --output work\06-records-candidate.json
python -m scripts.record_workflow.publish_json --candidate work\06-records-candidate.json --production data\records_master.json
```

2つ目のコマンドは追加・削除・既存項目の変更差分を表示するだけで、本番JSONを変更しません。削除は反映できず、既存記録の変更は明示的な許可なしには反映できません。差分を確認・承認した後に限り、以下を実行します。

```powershell
python -m scripts.record_workflow.publish_json --candidate work\06-records-candidate.json --production data\records_master.json --apply
```

反映前の本番JSONはタイムスタンプ付きバックアップとして保存されます。既存記録の変更も承認済みの場合に限り、さらに `--allow-existing-changes` を付けてください。

## 工程7：新規記事候補と対応検証

```powershell
python -m scripts.record_workflow.generate_posts --records data\records_master.json --posts-dir _posts --output-dir work\generated_posts
python -m scripts.record_workflow.validate_posts --records data\records_master.json --posts-dir _posts --candidate-dir work\generated_posts
```

記事名は `YYYY-MM-DD-<record_id>.md`、Front Matterは既存23項目・`layout: "record"`・`tags: "山行記録"` に準拠します。`duration` は既存記事と同じ引用符付き文字列です。生成先はレビュー用で、既存記事を上書きしません。検証後、承認された新規ファイルだけを `_posts/` に追加します。

地図URLはFront Matterにそのまま保持し、[yamareco_map.html](../_includes/yamareco_map.html) と [yamareco_map.js](../assets/js/yamareco_map.js) が画面幅に応じたiframeを生成します。ローカル表示とJekyllビルドを確認してから公開してください。

## テスト

```powershell
python -m unittest discover -s tests -v
```

# hiro-san 山歩きサイト V5

## 概要

個人の山行記録サイト。

GitHub Pages + Jekyll で運用する。

## 基本方針

- GitHub Pages標準環境で動作
- プラグイン非依存
- データ駆動型設計
- 検索機能重視

## ローカルでの表示確認（Windows）

### 初回設定

RubyInstaller の Ruby+Devkit をインストールする。MSYS2 の開発ツールがまだの場合は、PowerShell で次を一度実行する。

```powershell
ridk install 3
```

プロジェクトのフォルダーで、Jekyll などの依存パッケージをインストールする。

```powershell
ridk exec bundle install
```

### サイトの起動

```powershell
ridk exec bundle exec jekyll serve
```

PC のブラウザーで `http://localhost:4000/yama-reco/` を開く。停止するには、起動した PowerShell で `Ctrl+C` を押す。

スマートフォンで確認する場合は、PC とスマートフォンを同じ Wi-Fi に接続し、次のように起動する。

```powershell
ridk exec bundle exec jekyll serve --host 0.0.0.0
```

`ipconfig` でPCのIPv4アドレスを調べ、スマートフォンで `http://<PCのIPv4アドレス>:4000/yama-reco/` を開く。ファイアウォールの確認が表示された場合は、プライベートネットワークでのアクセスを許可する。確認後は `Ctrl+C` でサーバーを停止する。

## 開発方針

本プロジェクトは設計優先で開発を行う。

既存V5アーキテクチャの範囲で実装すること。

仕様変更が必要な場合は実装を行わず、

- 変更理由
- メリット
- デメリット
- 影響範囲

を整理した上で提案を行うこと。

## ディレクトリ構成

(フォルダ構成)

## 仕様書

詳細は以下を参照。

- docs/V5_SPEC_1-1.md
- docs/CODEX_RULES.md
- docs/DATA_SPEC_V1-rev1.md
- docs/DIRECTORY_STRUCTURE.md
- docs/CSS_ARCHITECTURE.md - CSS設計（モジュールアーキテクチャ）

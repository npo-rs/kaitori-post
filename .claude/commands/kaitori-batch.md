---
description: CSVの複数商品に対して買取記事パイプラインをまとめて回す
argument-hint: [対象範囲 例: all / 1-5 / スラッグをカンマ区切り]
allowed-tools: Read, Write, Edit, Bash(ls:*), Bash(sed:*), Bash(cat:*), Bash(wc:*), Task
---

対象範囲: $ARGUMENTS

`data/products.csv`（なければ `data/sample_products.csv`）の各商品について、
`/kaitori` と同じパイプライン（researcher → blog-writer / sns-writer → editor）を回してください。

## 進め方
1. 対象行を確定し、**処理する商品の一覧と件数を先に提示して確認を取る**。
   （引数が空なら全件を対象候補として提示する）
2. 1商品ずつ順に処理する。商品内では blog-writer と sns-writer を並行で呼んでよいが、
   商品どうしは順番に処理し、途中経過を1商品ごとに1〜2行で報告する。
3. 既に `output/blog/<スラッグ>.md` がある商品はスキップし、その旨を報告する
   （作り直したい場合はユーザーの明示指示があるときだけ上書きする）。
4. 途中でエラー・情報不足があった商品は止めずに記録し、最後にまとめて報告する。

## 最終報告
| スラッグ | 商品名 | 判定 | 要確認の件数 |
の表と、要対応商品のリストを出す。

10件を超える範囲を指定された場合は、先に「まず○件で試しますか？」と提案する。

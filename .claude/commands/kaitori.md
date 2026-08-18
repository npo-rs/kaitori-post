---
description: 1商品ぶんの記事・SNS投稿をリサーチ→執筆→校正まで一気に生成する
argument-hint: <商品スラッグ / 商品名 / CSVの行番号>
allowed-tools: Read, Write, Edit, Bash(ls:*), Bash(sed:*), Bash(cat:*), Task
---

対象商品: $ARGUMENTS

以下の手順で、買取記事パイプラインを最後まで回してください。

## 0. 対象商品の特定
- `data/products.csv`（なければ `data/sample_products.csv`）を読む。
- 引数がスラッグ・商品名なら該当行、行番号ならその行（ヘッダを除いた n 行目）を対象にする。
- 引数が空なら、CSV の商品一覧を提示して、どれを処理するか確認する。
- スラッグは CSV の `slug` 列を使う。空なら `<ブランド>-<型番 or 商品名>` を英数ハイフンで生成する。

## 1. リサーチ
`kaitori-researcher` サブエージェントを呼び、対象行の情報をそのまま渡す。
→ `output/research/<スラッグ>.md`

## 2. 執筆（2つは並行で呼んでよい）
- `kaitori-blog-writer` → `output/blog/<スラッグ>.md`
- `kaitori-sns-writer` → `output/sns/<スラッグ>.md`

## 3. 校正
`kaitori-editor` サブエージェントに blog / sns の両方をレビューさせる。
→ 原稿を直接修正 + `output/review/<スラッグ>-review.md`

## 4. 報告
最後に次を1画面でまとめて報告する。
- 生成したファイルのパス一覧
- editor の判定（OK / 要修正）
- 残っている `<!-- 要確認 -->` の中身（人手で埋める必要がある項目）
- 公開前に人がやるべきこと（相場の再確認・画像の用意 など）

判定が「要修正」なら、何を直せば OK になるかを箇条書きで示す。
自動で何度もループさせず、1周した結果を必ず人に見せてから次に進む。

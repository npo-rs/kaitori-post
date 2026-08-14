# kaitori-post

買取商品の記事（ブログ）・SNS投稿を、Claude Code のサブエージェントチームで半自動生成するプロジェクト。

## エージェントチーム構成

| エージェント | 役割 | 主な入出力 |
| --- | --- | --- |
| `kaitori-researcher` | 相場・スペック・需要のリサーチ | CSV/テキスト → `output/research/` |
| `kaitori-blog-writer` | SEOブログ記事の執筆 | research → `output/blog/` |
| `kaitori-sns-writer` | X / Instagram 投稿の執筆 | research/blog → `output/sns/` |
| `kaitori-editor` | 校正・法令・SEOチェック＆修正 | 原稿 → 上書き修正 + `output/review/` |

## 標準ワークフロー

1. `data/products.csv` に商品情報を用意する（`data/sample_products.csv` を参考に）。
2. 1商品ごとに次の順で回す：
   `kaitori-researcher` → `kaitori-blog-writer` / `kaitori-sns-writer` → `kaitori-editor`
3. `output/review/` の判定が「OK」になったら、WordPress や SNS へ投稿する（投稿は現状オフライン＝人手 or 別途連携）。

複数商品をまとめて処理したいときは、メインの対話で「CSVの各行に対してチームを回して」と指示すればオーケストレーションできる。

## ディレクトリ

```
.claude/agents/   … サブエージェント定義
data/             … 入力CSV
output/research/  … リサーチメモ
output/blog/      … ブログ記事（フロントマター付きMarkdown）
output/sns/       … SNS投稿案
output/review/    … 校正レポート
```

## 執筆ルール（全エージェント共通）

- 価格・買取金額は必ず「目安」「時期・状態で変動」と分かる書き方にする。
- 根拠のない最上級・断定（「最高値」「必ず」等）は使わない（景品表示法）。
- 化粧品・美容/健康の効果効能を断定しない（薬機法）。
- リサーチメモにない事実（価格・スペック）を創作しない。不足は `<!-- 要確認 -->` で残す。

## 配送・送料の表記ルール（全エージェント共通・出品記事は必須）

在庫商品を「出品」する記事・投稿（個体を特定して販売するブログ記事・SNS投稿）には、送料問い合わせの手間を減らすため、配送業者「アートセッティングデリバリー（家財おまかせ便）」の情報を必ず記載する。

- 案内・料金確認先URL: https://www.008008.jp/ （見積もりフォーム: https://form.008008.jp/mitumori/PKZI1100Action_doInit.action ）
- 対象商品の**サイズランク**（A〜Gランク。3辺合計サイズ〔cm〕で区分）を明記する。ランクは商品情報（CSV・リサーチメモ等）に記載があればそれを使う。記載がなければ `<!-- 要確認: サイズランク -->` として空欄にせず必ず注記する。
- 送料の具体額は断定しない。「送料はサイズランク・お届け先エリアにより異なります。詳細・正確な金額は上記URLでご確認ください」という趣旨を明記する。
- 各ランクの正確なcm基準・料金額は捏造しない。数値が確認できない場合は上記URL参照を案内するに留める。

## スラッグ命名

`<ブランド>-<型番 or 商品名>` を英数ハイフンで。例：`rolex-submariner-116610`, `iphone-13-128gb`。
research / blog / sns / review で同じスラッグを使い、商品を横断で辿れるようにする。

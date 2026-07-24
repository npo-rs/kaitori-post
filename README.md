# kaitori-post

買取商品の**記事・SNS投稿を自動生成する Claude Code エージェントチーム**。

スプレッドシート/CSV の商品情報を入力に、リサーチ → 記事執筆 → SNS投稿 → 校正 までを
役割分担したサブエージェントで回します。

## エージェント

- **kaitori-researcher** … 相場・スペック・需要を調べてリサーチメモを作る
- **kaitori-blog-writer** … SEOブログ記事（WordPress向け）を書く
- **kaitori-sns-writer** … X / Instagram 用の投稿文を書く
- **kaitori-editor** … 誤情報・誇大表現・法令(景表法/薬機法)・SEO をチェックして修正

## 使い方

### 1. 商品情報を用意

`data/sample_products.csv` をコピーして `data/products.csv` を作り、商品を記入します。

### 2. Claude Code で回す

1商品を仕上げる例（メインの対話で指示）：

```
data/products.csv の1行目の商品について、
kaitori-researcher → kaitori-blog-writer → kaitori-sns-writer → kaitori-editor
の順でチームを回して。
```

特定エージェントだけ呼ぶこともできます：

```
> use the kaitori-researcher subagent for the Rolex Submariner row
```

### 3. 出力を確認

- `output/research/` … リサーチメモ
- `output/blog/` … ブログ記事（フロントマター付き。WordPressに貼れる）
- `output/sns/` … SNS投稿案
- `output/review/` … 校正レポート（公開可否の判定つき）

## 注意

- 価格は必ず「目安・変動する」前提で書かれます。実掲載前に相場を再確認してください。
- 投稿(WordPress/SNSへの実送信)は現状スコープ外です。必要なら次段で連携を追加できます。

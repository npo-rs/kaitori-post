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

**1商品ぶんを一気に仕上げる（推奨）**

```
/kaitori rolex-submariner-116610
```

スラッグ・商品名・行番号のいずれでも指定できます。引数なしなら一覧から選べます。
リサーチ → ブログ執筆 / SNS執筆 → 校正 まで自動で回り、最後に判定と要確認事項が出ます。

**複数商品をまとめて**

```
/kaitori-batch all
```

`1-5` や `slug1,slug2` のような範囲指定も可能。既に記事がある商品はスキップされます。

**特定エージェントだけ呼ぶ**

```
> use the kaitori-researcher subagent for the Rolex Submariner row
```

### 3. 出力を確認

- `output/research/` … リサーチメモ
- `output/blog/` … ブログ記事（フロントマター付き。WordPressに貼れる）
- `output/sns/` … SNS投稿案
- `output/review/` … 校正レポート（公開可否の判定つき）

## 表現ルール（重要）

禁止表現・言い換え・価格の書き方の基準は `.claude/rules/ng-expressions.md` に集約しています。
4つのエージェントはすべてこのファイルを参照するので、**運用ルールを変えたいときはここだけ直せば全体に効きます**。

カテゴリ別のリサーチ観点（時計・スマホ・バッグ・貴金属・カメラ 等）は
`.claude/rules/category-checklists.md` にあります。扱う商材が増えたら追記してください。

## 注意

- 価格は必ず「目安・変動する」前提で書かれます。実掲載前に相場を再確認してください。
- 投稿(WordPress/SNSへの実送信)は現状スコープ外です。必要なら次段で連携を追加できます。

# line-relay 見積もり中継Bot

元請の14人グループLINEに届く見積もり依頼を外注1社へ自動転送し、外注からの金額回答に
20%（デフォルト）を上乗せして元請グループへ自動送信するBotです。

kaitori-post本体（買取記事生成エージェント）とは無関係の別ツールです。

## できること / できないこと

- 元請グループの**全テキストメッセージ**を外注へ自動転送します（選別はしません）
- 外注がLINEの「返信（リプライ）」機能で該当メッセージを指定して金額を送ると、自動で案件を判定します
- 金額を正しく読み取れた場合のみ、20%上乗せして元請グループへ**即自動送信**します（確認ステップなし）
- 金額が読み取れない／案件が特定できない場合は、元請グループには何も送らず、管理者(あなた)個人に通知します
- 画像・スタンプ等の非テキストメッセージは転送されません（届いたら管理者に通知だけします。手動で転送してください）
- 個人のLINEアプリを直接自動操作するものではありません（LINE公式アカウントのMessaging APIを使う、規約に沿った方法です）

## 全体の仕組み

```
元請14人グループ ──(全メッセージ)──> [Bot] ──(転送)──> 外注
                                        ^                │
                                        │                │(LINEの「返信」機能で金額のみ返信)
                                        └──(20%上乗せ)────┘
```

Botの正体は LINE公式アカウント（Messaging API）+ Cloudflare Workers（Webhookサーバー）+
Cloudflare KV（どの依頼への回答かを一時的に覚えておく場所）です。

## 事前準備

1. **LINE公式アカウントの作成**（あなたのLINEアカウントで）
   - https://entry.line.biz/start/jp/ から作成（無料プランで可）
2. **Messaging APIの有効化**
   - LINE Official Account Manager → 設定 → Messaging API → 「Messaging APIを利用する」
   - チャンネルアクセストークン（長期）を発行してメモ
   - チャンネルシークレットもメモ
3. **グループ参加を許可**
   - LINE Official Account Manager → 設定 → 応答設定
   - 「グループ・複数人チャットへの参加」を **許可する** に変更
   - 「応答メッセージ」「あいさつメッセージ」はオフにしておくと余計な自動返信が来ずおすすめです

## デプロイ手順（Cloudflare Workers）

```bash
cd line-relay
npm install -g wrangler   # 未導入の場合
wrangler login

# KV namespace を作成し、出力されたIDを wrangler.toml の id に貼る
wrangler kv namespace create PENDING_QUOTES

# シークレットを登録
wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
wrangler secret put LINE_CHANNEL_SECRET

# デプロイ
wrangler deploy
```

デプロイ後に表示されるURL（例: `https://line-relay.xxxx.workers.dev`）を、
LINE Official Account Manager → 設定 → Messaging API → Webhook URL に設定し、
「Webhookの利用」をオンにしてください。

## 初期セットアップ（ID登録）

`MOTOUKE_GROUP_ID` / `GAICHU_USER_ID` / `ADMIN_USER_ID` は最初は分からないため、
Bot自身に教えてもらいます。

1. **管理者(あなた)がBotを友だち追加し、何かメッセージを送る**
   → Botが「あなたのユーザーIDです: Uxxxx…」と返信します
2. **外注にもBotを友だち追加してもらい、何かメッセージを送ってもらう**
   → 同様にユーザーIDが返信されます
3. **Botを元請14人グループに招待する**
   → Botが「このグループのIDです: Cxxxx…」と返信します（`MOTOUKE_GROUP_ID`未設定の間だけ表示されます）
4. 取得した3つのIDを環境変数として設定:
   ```bash
   wrangler secret put MOTOUKE_GROUP_ID
   wrangler secret put GAICHU_USER_ID
   wrangler secret put ADMIN_USER_ID
   # 上乗せ率を変えたい場合（デフォルト1.2 = 20%増）
   wrangler secret put MARKUP_RATE
   ```
5. 再度 `wrangler deploy`

設定が完了すると、setup用の自動返信は出なくなり、通常の中継動作に切り替わります。

## 動作確認

1. 元請グループでテストメッセージを送る → 外注に「【見積り依頼】…」が転送されることを確認
2. 外注側で、その転送メッセージを**長押し→返信**し、金額（例:「50000円」）だけ送る
3. 元請グループに「【見積り回答】…¥60,000」のように届くことを確認（デフォルト20%増）
4. 外注が「返信」を使わずに送ったり、金額の読み取れない文章を送った場合は、
   元請グループには何も届かず、管理者に個別通知が来ることを確認

## 制限・注意事項

- 金額の抽出は正規表現ベースです。想定形式: `50000`, `50,000円`, `5万円`, `5.5万` など。
  複雑な表現（「五万円くらい」等の日本語数字・幅のある回答）は読み取れません。
- 転送待ちの依頼はKVに3日間保持されます。それを過ぎて返信されると「対応する依頼が見つからない」通知になります。
- 元請グループの全メッセージが外注に転送されるため、見積もりと無関係な雑談も届く点は運用上ご了承ください。
- 上乗せ額は `Math.ceil(金額 × MARKUP_RATE)` で1円単位切り上げです。丸め単位を変えたい場合はコード側で調整してください。

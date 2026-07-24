# 制作メモ：夜逃げ残置物コラム

対象ファイル: `output/seo/yonige-zanchibutsu-hiyou.html`
公開想定日: 2026-07-24 起票

## 想定キーワード軸
- 夜逃げ 残置物 処分
- 自力救済禁止
- 残置物 処分 費用相場（間取り別）
- 建物明渡し 強制執行 費用

## 既存コラムの参照について（要確認）
- `https://rs-nagoya.jp/zanchibutsu/` および `https://rs-nagoya.jp/zanchibutsu/column/` をWebFetchで取得を試みたが、いずれもサーバー側で **403 Forbidden** を返し、ヘッダー/フッター/CSS構成を確認できなかった。
- 依頼元からの参照ファイルの提供もなく、リポジトリ内にも既存コラムHTMLの現物は確認できなかった（Bash/Glob等のディレクトリ探索ツールが本セッションでは利用不可のため、既知パスのみ確認）。
- そのため、指示に従い**汎用構造（自作ヘッダー/フッター/CSS）で作成**し、HTML冒頭に `<!-- 要確認: ... -->` コメントを残した。
- **アップロード前に必ず**、実際の `column/` 配下の既存記事HTMLを取得し、ヘッダー・フッター・CSSパス（`<link>`タグ等）・クラス名を本物に差し替えてください。本文（`<article>`内）はそのまま流用可能な想定です。
- ナビ内リンク `https://rs-nagoya.jp/zanchibutsu/column/`（コラム一覧）は実在パス未確認のため、実際のURLに合わせて要修正。

## 法律面（自力救済禁止・明渡し手続き）参照元
- 自力救済禁止の原則・所有権・判例（大阪高裁の慰謝料事例言及）: https://www.tago-law.com/zanchi.html
- 賃借人が残した家財道具等の処置（公益社団法人 全日本不動産協会）: https://www.zennichi.or.jp/law_faq/賃借人が残した家財道具等の処置/
- 自力救済に関する解説（品川目黒不動産管理）: https://smf-kanri.jp/2488/
- 所有権と自力救済（弁護士メディア）: https://asbirds.jp/media/leftovers/
- 連絡が取れない住人の残置物を勝手に処分すると違法か（河辺法律事務所）: https://www.kawabe-law.com/連絡が取れない住人の「残置物」を勝手に処分すると違法/
- 元入居者の残置物、勝手な処分の可否（弁護士法人ALG）: https://www.komonbengoshi.biz/news/news_vol64_fixed_property.html
- 刑法235条（窃盗罪）条文: https://ja.wikibooks.org/wiki/刑法第235条
- 借主行方不明時の対応・公示送達（オーナーズエージェント）: https://owners-age.com/blog/soudan20210112
- 入居者行方不明・夜逃げ時の対応（弁護士法人赤坂見附法律事務所）: https://chintai-bengoshi.com/yukuefumei_yonige/
- 残置物処理の基本的流れ（弁護士法人世田谷用賀法律事務所）: https://setayoga.com/blog/20250204095432.html
- 残置物の処理等に関するモデル契約条項（国土交通省・参考／死亡時想定のモデル条項のため、本文では「あらかじめ条項を整備」程度の一般論に留めて引用）: https://www.mlit.go.jp/common/001486429.pdf

## 費用相場 参照元
- 明渡・強制執行の実費（文の風東京法律事務所）: https://ik-law.jp/akewatashi_shikko/
- 明渡し強制執行の実費（オーブ法律事務所）: https://aube-fudosan.com/tatemonoakewatasi_hiyou/
- 建物明渡の弁護士費用（グリーンリーフ法律事務所）: https://www.g-bengoshihiyou.jp/akewatashi/aw01/
- 残置物撤去費用相場・間取り別（お清め不動産）: https://goodbyebuy.jp/jiko-bukken/column/leftover-removal-cost-guide/
- 残置物撤去費用相場（志田エコロジー）: https://www.shida-eco.com/media/remaining-item-cost/
- 夜逃げされた残置物の処分（いえらぶパートナーズ）: https://ielove-partners.co.jp/media/9749/
- 夜逃げ入居者の撤去費用相場（エスタス管財）: https://s-tus.co.jp/rent_arrears

## 記事内で数値を丸めた・書かなかった点
- 強制執行費用「50万〜100万円」は物件規模により幅が大きいとする複数情報源の目安を採用。記事内では「見込んでおくケースもある」という表現にとどめ、確約的な言い回しは避けた。
- 大阪高裁の判例は、事件番号・判決日など一次情報を裏取りできなかったため、具体的な引用（金額の断定など）は避け「裁判例では〜認められたケースも報告されている」という一般的な書き方にした。個別の法的判断は弁護士へ、と本文中に明記済み。

## 要確認事項（まとめ）
1. 既存コラムのヘッダー/フッター/CSSへの差し替え（最重要）
2. ナビ内「コラム一覧」リンク先の実在URL確認
3. 大阪高裁判例の一次情報での裏取り（余裕があれば）
4. 公開日表記（現在 2026年7月24日で仮置き）の確認

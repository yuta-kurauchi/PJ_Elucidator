# 🗺️ 1日目のロードマップ：カメラ起動からMediaPipe連携まで

フェーズ2（カメラ制御）とフェーズ4（MediaPipe連携）を完了させ、Webブラウザ上で手の座標（Landmarks）を取得・表示することを目指す。

## 📍 フェーズ2：JSでカメラを扱う

- [x] **ステップ1：HTMLで映像の「受け皿」を作る**
  - `<video>` タグを配置し、`autoplay` などの属性を設定する。
  - CSSで映像を左右反転させる（鏡合わせ）。
  - *検索キーワード:* `HTML videoタグ autoplay 使い方`, `videoタグ 左右反転 CSS`

- [x] **ステップ2：JSでカメラを起動し、映像を受け皿に流す**
  - `navigator.mediaDevices.getUserMedia()` を使ってカメラ（iVCam）を起動する。
  - <mark>非同期処理(Primiseやasync/await)による待ち回し方。</mark> `未理解`
  - 取得したストリームを `<video>` の `srcObject` に渡す。
  - *検索キーワード:* `MDN getUserMedia`, `JavaScript addEventListener 関数 括弧`, `js コールバック関数 実行されてしまう`

---

## 📍 フェーズ4：MediaPipe Hands (JS版) の統合

- [x] **ステップ3：MediaPipe Handsのライブラリを読み込む**
  - CDNを利用して、HTMLの `<script>` タグでMediaPipeの必要なライブラリ群をインポートする。
  - *検索キーワード:* `MediaPipe Hands JavaScript CDN 導入`, `MediaPipe Web 公式ドキュメント`

- [ ] **ステップ4：カメラ映像をMediaPipeに解析させる**
  - MediaPipe Handsのインスタンスを生成し、初期設定（手の検出最大数など）を行う。
  - ステップ2で取得・再生しているカメラ映像のフレームを、連続してMediaPipeに送信する（`requestAnimationFrame` や MediaPipeの `Camera` ユーティリティを使用）。
  - *検索キーワード:* `MediaPipe Hands JS 使い方 Qiita`, `MediaPipe Hands send video JavaScript`, `requestAnimationFrame MediaPipe 連携`

- [ ] **ステップ5：推論結果（Landmarks）をコンソールに表示する**
  - 解析結果を受け取るコールバック関数（`onResults` など）を設定する。
  - 取得した手の21箇所の3D座標（x, y, z）を `console.log` で出力し、データの構造を確認する。
  - *検索キーワード:* `MediaPipe landmarks 配列 構造`, `console.log オブジェクト 中身 確認 JS`

---
**💡 開発のヒント**
* エラーが起きたら必ず「開発者ツール（F12）」の「Console」タブを確認する。
* コピペに頼らず、公式ドキュメントやQiitaのコードブロックごとに「何をしている処理か」を読み解いてから自分のプロジェクトに落とし込む。
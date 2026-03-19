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

- [x] **ステップ4：カメラ映像をMediaPipeに解析させる**
  - MediaPipe Handsのインスタンスを生成し、初期設定（手の検出最大数など）を行う。
  - ステップ2で取得・再生しているカメラ映像のフレームを、連続してMediaPipeに送信する（`requestAnimationFrame` や MediaPipeの `Camera` ユーティリティを使用）。
  - *検索キーワード:* `MediaPipe Hands JS 使い方 Qiita`, `MediaPipe Hands send video JavaScript`, `requestAnimationFrame MediaPipe 連携`

- [x] **ステップ5：推論結果（Landmarks）をコンソールに表示する**
  - 解析結果を受け取るコールバック関数（`onResults` など）を設定する。
  - 取得した手の21箇所の3D座標（x, y, z）を `console.log` で出力し、データの構造を確認する。
  - *検索キーワード:* `MediaPipe landmarks 配列 構造`, `console.log オブジェクト 中身 確認 JS`

---
**💡 開発のヒント**
* エラーが起きたら必ず「開発者ツール（F12）」の「Console」タブを確認する。
* コピペに頼らず、公式ドキュメントやQiitaのコードブロックごとに「何をしている処理か」を読み解いてから自分のプロジェクトに落とし込む。

---

## 🗺️ フェーズ3：Three.js の 3D 空間構築 ロードマップ

目標：MediaPipeの座標を反映させるための「箱庭（3D空間）」をブラウザ上に構築し、テスト用の3Dオブジェクト（箱など）を表示・回転させる。

### 📍 基本セットアップ（箱庭の準備）

- [ ] **ステップ1：Three.js のライブラリを読み込む**
  - MediaPipeの時と同様に、CDNを使ってESモジュール（`import`）形式でThree.jsを導入する。
  - *検索キーワード:* `Three.js ES module CDN 導入`, `Three.js 公式ドキュメント Installation`

- [ ] **ステップ2：3大要素（Scene, Camera, Renderer）の作成**
  - **Scene:** オブジェクトを置くための空間を作る。
  - **Camera:** 空間を映し出すカメラ（`PerspectiveCamera`）を設定し、引いた位置（Z軸方向など）に配置する。
  - **Renderer:** 3D空間を2Dの画面に描画するエンジン（`WebGLRenderer`）を作成し、HTMLにすでにある `<canvas id="output_canvas">` に紐づける。
  - *検索キーワード:* `Three.js Scene Camera Renderer 基礎`, `Three.js WebGLRenderer canvas 既存`



### 📍 オブジェクトと照明の配置

- [ ] **ステップ3：テスト用のオブジェクト（Mesh）を置く**
  - Three.js では **Geometry（形の骨組み）** と **Material（表面の質感・色）** を組み合わせて **Mesh（実体）** を作る。
  - まずはシンプルな箱（`BoxGeometry`）を作成して、Sceneに追加（`scene.add`）する。
  - *検索キーワード:* `Three.js Mesh Geometry Material 違い`, `Three.js BoxGeometry 使い方`

- [ ] **ステップ4：ライト（照明）を当てる**
  - 光がないとオブジェクトが真っ黒（または立体的でないベタ塗り）になってしまう。全体を照らす環境光（`AmbientLight`）や、太陽のような平行光源（`DirectionalLight`）を追加する。
  - *検索キーワード:* `Three.js AmbientLight DirectionalLight`

### 📍 描画ループの作成

- [ ] **ステップ5：3D空間の描画ループ（Update処理）を作る**
  - `requestAnimationFrame` を使って、Three.js の画面を毎フレーム更新（`renderer.render(scene, camera)`）する無限ループ関数を作る。
  - ループの中で、ステップ3で作った箱を少しずつ回転（例: `mesh.rotation.x += 0.01`）させて、3D空間が正しく動いていることを確認する。
  - *検索キーワード:* `Three.js requestAnimationFrame アニメーション`, `Three.js renderer.render`

---

**💡 開発のアドバイス・ヒント**

* **Unityとの概念マッピング:**
  * `Scene` = Scene（Hierarchy）
  * `Mesh` = GameObject (Mesh Filter + Mesh Renderer)
  * `requestAnimationFrame`のループ = `Update()` メソッド
* **ファイル分割のすすめ:** `hand-tracking.js` にThree.jsの処理もすべて書くとファイルが肥大化して混乱しやすくなります。3D関連の処理は `3d-space.js` のような別ファイルに切り出し、`import/export` で連携する設計にすると、後々Blenderで作った剣のモデル（Elucidator等）を読み込む時にもコードがスッキリして管理しやすくなります。
* **座標系の違いに注意:**
  Three.jsの座標系は**右手系（Yが上、Zが画面の手前方向）**です。カメラの位置を設定するときは、Z軸をプラス方向に設定しないと、オブジェクトの中にカメラが埋まってしまい画面が真っ暗になるので注意してください。
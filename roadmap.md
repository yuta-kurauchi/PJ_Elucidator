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

- [x] **ステップ1：Three.js のライブラリを読み込む**
  - MediaPipeの時と同様に、CDNを使ってESモジュール（`import`）形式でThree.jsを導入する。
  - *検索キーワード:* `Three.js ES module CDN 導入`, `Three.js 公式ドキュメント Installation`

- [x] **ステップ2：3大要素（Scene, Camera, Renderer）の作成**
  - **Scene:** オブジェクトを置くための空間を作る。
  - **Camera:** 空間を映し出すカメラ（`PerspectiveCamera`）を設定し、引いた位置（Z軸方向など）に配置する。
  - **Renderer:** 3D空間を2Dの画面に描画するエンジン（`WebGLRenderer`）を作成し、HTMLにすでにある `<canvas id="output_canvas">` に紐づける。
  - *検索キーワード:* `Three.js Scene Camera Renderer 基礎`, `Three.js WebGLRenderer canvas 既存`



### 📍 オブジェクトと照明の配置

- [x] **ステップ3：テスト用のオブジェクト（Mesh）を置く**
  - Three.js では **Geometry（形の骨組み）** と **Material（表面の質感・色）** を組み合わせて **Mesh（実体）** を作る。
  - まずはシンプルな箱（`BoxGeometry`）を作成して、Sceneに追加（`scene.add`）する。
  - *検索キーワード:* `Three.js Mesh Geometry Material 違い`, `Three.js BoxGeometry 使い方`

- [x] **ステップ4：ライト（照明）を当てる**
  - 光がないとオブジェクトが真っ黒（または立体的でないベタ塗り）になってしまう。全体を照らす環境光（`AmbientLight`）や、太陽のような平行光源（`DirectionalLight`）を追加する。
  - *検索キーワード:* `Three.js AmbientLight DirectionalLight`

### 📍 描画ループの作成

- [x] **ステップ5：3D空間の描画ループ（Update処理）を作る**
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

  ---

  # 🗺️ フェーズ3〜完結・リファクタリングまでのロードマップ

目標：MediaPipeの座標をThree.jsの空間に正しくマッピングし、自作のBlenderモデル（エリュシデータ）を導入。手の向きに合わせて剣を振り回せるようにし、最後にプロ水準のコードへリファクタリングする。

## 📍 フェーズ3（続き）：座標系の統一（オブジェクト吹っ飛び問題の解決）

- [x] **ステップ1：Three.jsの空間スケールを理解し、座標を変換する**
案Aを採用した。
  - 現在、MediaPipeの生データ（0.0〜1.0）に画面サイズ（1280など）を掛けているため、Three.jsの世界では「1280メートル先」にオブジェクトが飛んでしまっている状態。
  - **対策案A：** Three.jsのカメラ位置（`Z=5`など）に収まるように、掛け算する係数を `10` などの小さな値にする。
  - **対策案B（プロ向け）：** 座標を `-1.0 〜 +1.0` の正規化デバイス座標（NDC）に変換し、画面の特定距離の平面にマッピングする。
  - *検索キーワード:* `Three.js MediaPipe 座標変換`, `Three.js 正規化デバイス座標 (NDC) 変換`

## 📍 フェーズ4：Blenderモデルのインポート

- [ ] **ステップ2：Blenderからモデルを書き出す**
  - Web上で最も軽く、Three.jsと相性が良いフォーマットである **glTF（`.gltf` または `.glb`）** 形式でエリュシデータをエクスポートする。
  - *検索キーワード:* `Blender glTF エクスポート Three.js`

- [ ] **ステップ3：Three.jsでモデルを読み込む**
  - Three.jsに標準で用意されている拡張機能 `GLTFLoader` をインポートし、`.glb` ファイルを読み込んで Scene に追加する。（テスト用のBoxGeometryとお別れ）
  - *検索キーワード:* `Three.js GLTFLoader 使い方`, `Three.js glb 表示されない`（※ライトが当たっていなくて真っ黒になる罠がよくあります）

## 📍 フェーズ5：姿勢制御（剣を手に持たせて振る）

- [ ] **ステップ4：手首の位置にモデルを追従させる**
  - ステップ1で修正した座標（`wristPosRial`）を、剣のモデルの `position` に毎フレーム代入する。

- [ ] **ステップ5：法線ベクトルと指のベクトルで回転（Rotation）を制御する**
  - これが最大の難関かつ、最も数学が面白い部分！
  - 剣の「刃の向き」を法線ベクトル（`palmNormal`）に、「剣先の向き」を中指のベクトル（`middleVec`）に合わせる。
  - 3Dの回転計算には、ジンバルロック（回転がおかしくなる現象）を防ぐために **クォータニオン（Quaternion）** という概念を使うのがUnityでもThree.jsでも王道。
  - *検索キーワード:* `Three.js Quaternion 使い方`, `Three.js クォータニオン ベクトル 向き合わせる (setFromUnitVectors)`

---
🎉 **ここで「剣を振り回せる Webアプリ v1.0」がひとまず完成！** 🎉
---

## 📍 フェーズ6：コードの整理とモジュール化（リファクタリング）

動くようになったスパゲッティコードを、後から見ても美しく、拡張しやすい「オブジェクト指向」なコードに書き直す（リファクタリング）。

- [ ] **ステップ6：役割ごとにクラス（Class）を作成する**
  - 例：`CameraManager.js`（カメラ起動・停止担当）、`HandTracker.js`（MediaPipe解析担当）、`SceneManager.js`（Three.js描画担当）などに分割。
  - *検索キーワード:* `JavaScript クラス設計`, `Three.js オブジェクト指向 書き方`

- [ ] **ステップ7：モジュール間のデータ受け渡しを洗練させる**
  - 今回苦戦した `export` や `undefined` の罠を踏まえ、「コールバック関数」や「イベントリスナー（カスタムイベント）」を使って、TrackerからSceneへ座標データを安全に渡す仕組みを作る。
  - *検索キーワード:* `JavaScript クラス間 データ受け渡し コールバック`, `JS CustomEvent 使い方`

- [ ] **ステップ8（追加の推奨ステップ）：ウィンドウのリサイズ対応**
  - ブラウザの画面サイズが変更されたときに、キャンバスのサイズやカメラのアスペクト比を自動で再計算する処理（`window.addEventListener('resize', ...)`）を追加し、Webアプリとしての完成度を高める。
  - *検索キーワード:* `Three.js リサイズ対応`
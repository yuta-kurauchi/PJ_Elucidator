# Elucidator Web 開発ノート
---
## Express 
1. **fileの送信方法**
    * **`get`メソッド**
        `res.sendFile`を使って特定のURLからのアクセスだけを`get`で受け取り、その時に結果として、特定のファイルを送信する。
        ```JS
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });
        ```
        **`get`についての補足**
            第一引数は場所の指定。エンドポイントの指定という。URLの最後のpathだから
            /の下の/userという場所にいるときの処理を書きたいなら、"/user" とすればよい。
            例を以下に示す。
        ```JS
        app.get("/user", (req, res) => {
            res.send("ユーザーです");
        });
        ```
        **`req`について**
            `req`は`app.get`の第一引数で指定したpathに入ってきたHTTPリクエストを表すオブジェクトで、リクエストしてきた人のHTTP以下の情報を含んでいる。
        ```JS
        localhost:8000/hoge\?name=user1
        このようなリンクでリクエストすると、
        req.query.name にuser1という名前が入る。
        ```
        **`res`について**
            `res`は指定されたパスに入ってきたリクエストに対するHTTPレスポンスを構成するためのオブジェクト。何かしら、そのアドレスに返信したりするのに使う。
        ```JS
        res.send("ユーザーです");
        ```

    * **`public`フォルダの送信**
        公開するファイルを`public`フォルダにまとめて、そのフォルダごと送信する。
        ```JS
        app.use(express.static(path.join(__dirname, 'folderNmae')))
        ```

---
## Docker
1. **Docker Compose 実行モード比較**

    | 項目 | フォアグラウンド (`up`) | バックグラウンド (`up -d`) |
    | :--- | :--- | :--- |
    | **画面の状態** | ログが常に流れ続け、そのターミナルでは操作できない | 実行後すぐにプロンプト（`PS >`）に戻り、操作可能になる |
    | **終了方法** | `Ctrl + C` を押すとコンテナも停止する | `docker-compose down` を実行するまで動き続ける |
    | **用途** | エラー解決中や、ログをリアルタイムで監視したい時 | 開発が安定し、他のコマンド操作と並行したい時 |

    * ログの確認方法(推奨)
        バックグラウンドで動かしているけど、ログだけ見たいというとき。
        ```cmd
        # ログを流しっぱなしにする（Ctrl+Cでログ視聴だけ終了、コンテナは止まらない）
        docker logs -f elucidator-web
        ```

--- 
## JSON
1. **package.jsonと-lockの違い**
    | 項目 | `package.json` | `package-lock.json` |
    | :--- | :--- | :--- |
    | **役割** | プロジェクトの概要・必要なもの | インストール済みの詳細な記録 |
    | **バージョンの書き方** | ゆるめ（例: ^1.0.0）| 厳密（例: 1.0.5）|
    | **編集** |　自分で書き替える | `npm`が自動更新する |

---
## カメラAPIの制限
* ブラウザのセキュリティ上の制限により、Webカメラを起動するAPIは **「https:// で配信されているサイト」または「http://localhost」** でしか動かない。
> [!note]
> 今はローカルホストでいいが、ポートフォリオ化するときに公開したいので、その時に調べる。
---
## JavaScript
1. **カメラ映像の取得**
    **getUserMedia,(Promise)でデバイス(今回はカメラ)をOpen**
    ```JavaScript
    // 第一引数で、何を取得するかを選択
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        // カメラが取得できた時に実行
        .then((stream) => {
            userVideo.srcObject = stream; // 映像を video タグに表示
        })
        .catch((error) => {
            console.error("カメラの起動に失敗しました:", error)
        });
    // .then, .catch は非同期処理のPromise結果を扱うメソッド
    // Promise とは、非同期処理の操作が完了したときに結果を返すもの。
    ```
    **getUserMediaで取得,Openしたデバイスの閉じ方。**
    ```JS
    // getTrackで、stream中のデバイスの配列を取得
    // その各要素をforEachで取り出して、stopさせ。。
    stream.getTracks().forEach(track => track.stop());
    ```
2. **`addEventListener`の関数実行タイミング**
    ```JavaScript
    // ダメな例(即時実行)
    btn.addEventListener('click', functionName());
    // よい例(イベント時)
    btn.addEventListener('click', functionName);
    btn.addEventListener('click', () => {
        functionName();
    });
    ```
3. **コールバック <a href="https://developer.mozilla.org/ja/docs/Glossary/Callback_function">MDN</a>**
    関数の引数に別の関数を指定すること。
    ```JavaScript
    function(引数, (コールバック関数の引数) => {
        // コールバック関数の処理内容
    })
    ```
    * **同期コールバック**
        外部の関数の呼び出し直後に呼び出される。以下の場合、`value = 2`が出力される。
    * **非同期コールバック**
        非同期処理が完了した時点で呼び出される。以下の場合、`value = 1`が出力される。
    ```JavaScript
    let value = 1;

    doSomething(() => {
    value = 2;
    });

    console.log(value);
    ```
4. <mark>**同期処理・非同期処理 少しは理解したつもり** </mark> <a href="https://developer.mozilla.org/ja/docs/Learn_web_development/Extensions/Async_JS/Introducing"> MDN</a>
- **同期処理**
    * 各行が前の行の処理結果に依存しているため、前の行の処理が終わるまで、次の処理に進まない。
    * 長時間実行される同期処理があると、その間、他の処理ができなくて困る。(JSはシングルスレッド)
    * 長時間実行される同期処理として、今回使っている。`getUserMedia`などがある。
- **非同期処理**
    - 長い処理を実行している間に別のスレッドを立てるなどして、処理を中断させないようにすること。最終的に処理が完了したら、その結果を通知する。
- **`Promise`**
    - `promise`オブジェクトは、非同期処理の完了もしくは失敗を表すオブジェクト。
    - 基本的な使い方としては、プロミスはコールバック関数に渡すかわりに、関数が返したオブジェクトに対してコールバックを登録するようにするというもの。
- **今回のプロジェクトにおける非同期処理(実際のコードは下にある。)**
    - `vision`や`handLandmarker`の作成は、時間がかかる非同期である。
    - `async/await`について
        `async`: 非同期処理を伴う関数定義につける。
        > [!note]
        > `async`がないと、関数内で、`await`を使えない

        `await`: 非同期処理を伴う関数実行時に`await`をつけることで、その処理の完了を待つ。

        ここで、以下のような疑問が生じた。
        > [!note]
        > 非同期処理は、その処理を待たずに他の処理をできるのがメリットなのでは？
        > 結果がないとだめな処理で、困るからawaitとかを使うのはわかるのだけど、ならばなぜ非同期処理として定義されているの？
        > 最初から、同期処理としてメソッドつければいいのに。

        > [!important]
        > それに対する答えはこうだ。
        > <mark>処理結果を使うため処理完了を待ってほしいが、同期処理として定義してしまうとそこで、完全にブラウザがフリーズしてしまうからである。</mark>
        > `await`を使うと… 非同期だけど、処理完了まで待つようにすることができる。
```JavaScript:hand-tracking.js
const createHandLandmarker = async () => {
    // vision 作成まで待つ
    const vision = await FilesetResolver.forVisionTasks(
        // wasmへのpath
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    // handlandmarker 作成まで待つ
    const handLandmarker = await HandLandmarker.createFromOptions(
        // しっかりとvision が定義されている。
        vision,
        {
            baseOption: {
                // .taskファイルへのpath
                modelAssetPath: "./models/hand_landmarker.task"
            },
            runningMode: "VIDEO",
            numHands: 2,
        });
}
```
5. **CDNのimport**
インポートの仕方はいくつかあるが、今主流なのは、Import 文を直接スクリプトに書くことで、importするやり方。
```HTML
<head>
    <!-- headの中で、type="importmap"として、importsをまとめて書く -->
    <script type="importmap">
        {
            "imports" : {
                "three" : "https://unpkg.com/three@0.162.0/build/three.module.js"
            }
        }
    </script>

    <!-- 使いたいスクリプトをtype="module"として宣言 -->
    <script type="module" src="./hand-tracking.js" defer></script>
    <script type="module" src="./3d-space.js" defer></script>

</head>
```

```JS
// 一番上で、importする。
// * as Name で module の全ての export をimport してNameで管理
import * as THREE from "three";
```

6. **変数のスコープ**
- ループ内での`const`宣言。
    Q. ループごとに値が変わるのになぜ、`const` でいいのか疑問だった。
    A. これへの解答は、
    <mark>まず、`const`はそのブロック内では変更できないというものである。</mark>
    そのため、ループごとに別のブロックとして認識されるから、ブロック内で変更を加えるもの以外はOK。
    <mark>逆に言うと、ループごとに初期化されてしまうので、前のループの値を使いたい場合は、グローバルに`let`で宣言する必要がある。</mark>

7. **ブラウザをフリーズさせる `while(true)` の罠**
    JavaScriptは「シングルスレッド（1人の職人が全作業を順番にこなす）」で動いている。
    そのため、トップレベルで `while(true)` などの無限ループを回すと、職人がそこから抜け出せなくなり、「画面の描画」や「カメラの取得」など他の処理が一切できずブラウザがフリーズする。
    * **対策:** 毎フレームの変化を監視したい場合は、`requestAnimationFrame` で回している描画ループ（`renderLoop` など）の中に `console.log` を仕込む。

8. **`console.log` の罠（参照渡し）**
    オブジェクト（`{}` や `Vector3` など）を `console.log` で出力した際、ブラウザのコンソールは「その瞬間のデータ」ではなく「メモリ上の住所（参照）」を表示する。
    そのため、後からコンソールの `▶` を開いて中身を確認しようとすると、すでにループ処理などで最新の値に上書きされた後のデータが表示されてしまう。
    * **対策:** その瞬間のスナップショットを正確にログに残したい場合は、一度文字列に変換する。
    `console.log(JSON.stringify(オブジェクト));`

9. **記憶喪失の `this` と アロー関数**
    クラス内で作ったメソッドを、`requestAnimationFrame` や `addEventListener` などのコールバックとして外部に渡すと、実行される頃には `this` が「自分自身のクラス」を指さなくなり（記憶喪失）、`undefined` エラーになる。
    * **対策:** アロー関数 `() => {}` で包んでから渡す。<mark>アロー関数には「自分が定義された時の this を一生忘れない（束縛する）」</mark>という強力な仕様がある。
    ```javascript
    // ❌ エラーになる渡し方
    this.renderer.setAnimationLoop(this.tick);
    
    // ⭕️ 正しい渡し方
    this.renderer.setAnimationLoop(() => {
        this.tick();
    });
    ```

---
## MediaPipe for Web
公式ドキュメント見ればわかる。
<a href="https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js#video">MP公式ドキュメント</a>
detectionで得られる結果がどのようなデータ構造をしているのかをconsole.logでしっかり調べることが大事

* **Y軸の向き（HTML vs 3D空間）**
    * **OpenCV / HTML Canvas:** 画面の左上が(0, 0)で、**下に行くほどYがプラス**。
    * **Three.js / Unity:** **上に行くほどYがプラス**。
    座標を3D空間に持ち込む際は、どこかでY軸を反転させる（`1 - y` など）必要がある。

---
## Three.js
1. `Vectorクラス`
メソッドの紹介見ればわかる。
<a href="https://qiita.com/aa_debdeb/items/c58d5eda9a4052b5dd2f">メソッド</a>
2. `Render`
3. **既存のキャンバスへのレンダラー紐づけ**
    HTML上にすでに用意してある `<canvas>` を Three.js で使いたい場合、新しく生成した要素を `appendChild` すると「キャンバスの中にキャンバスが入る」という異常な構造になりエラーになる。
    * **対策:** レンダラーのインスタンス化時に、引数として既存のキャンバスを渡す。
    ```javascript
    const canvasElement = document.getElementById("output_canvas");
    this.renderer = new THREE.WebGLRenderer({ canvas: canvasElement });
    ```

4. **`Vector3` の破壊的メソッドと `lerp`**
    Three.jsのベクトル計算（`.add()` や `.multiplyScalar()` など）は、結果を新しく返すのではなく**自分自身の値を直接書き換えてしまう（破壊的変更）**仕様になっている。
    * **対策:** 元のデータを残したい場合は `.clone()` や `.copy()` を使う。
    * **EMA（指数移動平均）の最強メソッド:** 前回の座標と新しい座標を一定の割合でブレンドして手ブレを抑える処理は、`.lerp()` を使うと1行で完結する。
    ```javascript
    // 前回の座標に、今回の新しい座標を 20% (0.2) だけ混ぜる（近づける）
    smoothedVector.lerp(rawPosVec, 0.2);
    ```

5. **フレームレートに依存しないアニメーション**
    `mesh.rotation.y += 0.01` のように毎フレーム固定値を足す処理だと、AIの計算などで処理落ちした時（FPSが下がった時）に動きが遅くなってしまう。
    * **対策:** Unityの `Time.deltaTime` と同じように、Three.jsの `THREE.Clock` を使って「前回から何秒経過したか」を取得し、それを掛け算して動かす。

6. **PBRマテリアル（金属光沢）が真っ黒になる問題**
    glTFのPBR（物理ベースレンダリング）において、金属（Metallic）は**「周囲の景色を反射すること」**で質感を表現する。暗闇（背景色のみ）の空間では「無」を反射して真っ黒になる。
    * **対策:** `RoomEnvironment` などの環境マップ（架空の部屋の反射光）を設定する。
    ```javascript
    import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
    // レンダラーから環境マップ生成機を作成し、シーンの environment に適用
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    ```

7. **ループ内の `new` 禁止令（ガベージコレクション対策）**
    毎フレーム実行される `requestAnimationFrame` の中で `new THREE.Vector3()` などを実行すると、大量のオブジェクトが生成されては捨てられ、メモリ解放（GC）の瞬間に画面がカクつく（GCスパイク）。
    * **対策（オブジェクトプーリング）:** クラスの `constructor` 等で最初に1つだけ「空箱」を用意し、ループ内ではその箱の**中身だけを上書き**して使い回す。

8. **代入（`=`）の罠と `.copy()`**
    JavaScriptでは、オブジェクトに対して `=` を使うと「値のコピー」ではなく「箱の共有（参照渡し）」になってしまう。
    ```javascript
    // ❌ 2つの変数が同じ箱を共有してしまう（slerpなどが効かなくなる）
    this.smoothedQua = this.rotQua; 
    
    // ⭕️ 別の箱のまま、中身の数字だけを写し取る
    this.smoothedQua.copy(this.rotQua);
    ```

9. **破壊的メソッドの連鎖（メソッドチェーン）**
    Three.jsの数学計算メソッドは、自分自身を書き換えて自分自身を返すため、効率よく繋げて書くことができる（ゴミが出ない最速の書き方）。
    ```javascript
    // 用意しておいた this.handAxes.z の箱を上書きして正規化
    this.handAxes.z.crossVectors(vecX, vecY).normalize();
    ```

10. **キャンバスの完全な破棄（メモリリーク防止）**
    カメラ停止時などにThree.jsの処理を終わらせる場合、単にDOMを消すだけでは裏でWebGLコンテキストが動き続けてメモリリークを起こす。
    * **正しい終了手順:**
        1. `setAnimationLoop(null)` で描画ループを止める。
        2. シーン内の `geometry` と `material` を `dispose()` する。
        3. `renderer.dispose()` と `renderer.forceContextLoss()` でコンテキストを破棄。
        4. 親のHTML要素から `renderer.domElement` を `removeChild` する。

--- 
## Blender & glTF
1. **モディファイアーの適用順序の罠**
    Blenderのモディファイアーは**「上から順に」**計算される。
    `Subdivision`（細分化）の後に `アーマチュア`（ボーン変形）がある状態で、下のアーマチュアだけを先に適用しようとすると、計算の辻褄が合わなくなり形が崩壊する。

2. **glTFエクスポートとボーン（アーマチュア）の罠**
    Three.js側でアニメーション（骨の可動）が不要で、「特定のポーズのまま固まったメッシュ」として書き出したい場合がある。
    しかし、エクスポート設定の「モディファイアーを適用」は、**アーマチュア変形には効かない**という隠し仕様がある（ボーンアニメーション保護のため）。
    * **確実な解決策（ベイク作戦）:** 書き出したいオブジェクトを複製（`Shift + D`）し、`オブジェクト ＞ 変換 ＞ メッシュ` を実行する。これで現在の見た目のまま全てのモディファイアーが適用された「ただのポリゴン」になるので、これをエクスポートする。

---
## 3D数学（姿勢制御・トラッキング）
1. **外積（Cross Product）による正規直交座標の作成**
    2つのベクトルから、姿勢制御に必要な「完璧な90度で交わる3つの軸」を作る手法。内積で角度を計算するより圧倒的に処理が軽く、精度が高い。
    * **手順（中指方向を最優先する場合）:**
        1. 中指のベクトルを絶対のX軸（$\vec{X}$）とする。
        2. $\vec{X}$ と掌の法線（$\vec{Y}_{raw}$）の**外積**を取り、完璧なZ軸（$\vec{Z}$）を作る。
        3. $\vec{Z}$ と $\vec{X}$ の**外積**を取り、補正された完璧なY軸（$\vec{Y}_{true}$）を作る。

2. **なぜ3x3ではなく 4x4行列（Matrix4）なのか？**
    * 3x3行列: 「回転」と「スケール」しか扱えない。
    * **4x4行列:** もう1行・1列追加することで、**「回転・スケール・平行移動」のすべてを1つの行列にパッキング**できる。3Dグラフィックスの世界標準フォーマット。
    `Matrix4.makeBasis(x, y, z)` を使うと、用意した3つの基底ベクトルをこの4x4の「回転」の部屋に自動で清書してくれる。

3. **クォータニオン（Quaternion）と状態管理**
    4x4行列は計算を繰り返すと誤差で歪む（ジンバルロック等）ため、回転情報の保存・適用には安全なカプセルであるクォータニオンを使う（`setFromRotationMatrix` で変換）。
    * **フラグによる状態管理:**
        トラッキングが途切れた際、クォータニオンを `null` や初期値 `(0,0,0,1)` に戻すのは非効率でバグの元。
        `let isTracking = false` のような**真偽値（フラグ）**を用意し、見失った時はフラグを折るだけにするのがゲームプログラミングの鉄則。
    * **slerp（球面線形補間）:**
        前回のクォータニオンに今回のクォータニオンを一定割合（例: 0.2）だけ混ぜることで、AI推論特有のプルプルとした手ブレを劇的に抑えることができる。
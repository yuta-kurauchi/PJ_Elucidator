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
    stream.getTrack().forEach(track => track.stop());
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

---
## MediaPipe for Web
公式ドキュメント見ればわかる。
<a href="https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js#video">MP公式ドキュメント</a>
detectionで得られる結果がどのようなデータ構造をしているのかをconsole.logでしっかり調べることが大事

---
## Three.js
1. `Vectorクラス`
メソッドの紹介見ればわかる。
<a href="https://qiita.com/aa_debdeb/items/c58d5eda9a4052b5dd2f">メソッド</a>
2. `Render`
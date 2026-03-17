# Elucidator Web 開発ノート
---
## Express 
1. **fileの送信方法**
    * **`get`メソッド**
        `res.sendFile`を使って特定のURLからのアクセスだけを`get`で受け取り、その時に結果として、特定のファイルを送信する。
        ```express
        app.get("/", (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));
        });
        ```
        **`get`についての補足**
            第一引数は場所の指定。エンドポイントの指定という。URLの最後のpathだから
            /の下の/userという場所にいるときの処理を書きたいなら、"/user" とすればよい。
            例を以下に示す。
            ```express
            app.get("/user", (req, res) => {
                res.send("ユーザーです");
            });
            ```
    * **`public`フォルダの送信**
        公開するファイルを`public`フォルダにまとめて、そのフォルダごと送信する。
        ```express
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
* <mark>今はローカルホストでいいが、ポートフォリオ化するときに公開したいので、その時に調べる。</mark>

---
## JavaScript
1. **カメラ映像の取得**
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

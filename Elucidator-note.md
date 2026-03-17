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
// express というライブラリを持ってくる import,include と同じノリ
const express = require('express');
// pathを管理するライブラリかな?
const path = require('path');
// インスタンス化?
const app = express();
// ポート番号の指定
const port = 3000;

// 現在のディレクトリにあるファイルを静的ファイルとして公開
app.use(express.static(__dirname));

// ルートにアクセスされたら、index.htmlというwebの設計図を渡す
// 第一引数は場所の指定。エンドポイントの指定という。urlの最後のpathだから
// /の下の/userという場所にいるときの処理を書きたいなら、"/user" とすればよい。
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// なぜかうまくいない。
// app.get("/user", (req, res) => {
//     res.send("ユーザーです");
// });

// 3000番を開けて待機
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
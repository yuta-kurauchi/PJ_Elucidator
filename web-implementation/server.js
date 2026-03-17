// フレームワークの導入
const express = require('express');
const path = require('path');
// インスタンス化
const app = express();
// ポート番号の指定
const port = 3000;

// publicフォルダの中身を静的に公開
app.use(express.static(path.join(__dirname, "public")));

// 3000番を開けて待機
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
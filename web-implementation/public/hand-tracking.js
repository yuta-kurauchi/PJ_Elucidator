document.addEventListener("DOMContentLoaded", () => {
    main();
});

function main() {
    camOn();
}

function camOn() {
    // ボタンを取得
    const btn = document.getElementById('startButton');

    // クリックされたらカメラon
    // ()つけると即時実行になる
    btn.addEventListener('click', startCamera);
}

function startCamera() {
    const userVideo = document.getElementById("userVideo");

    // カメラの映像を取得 
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        // カメラが取得できた時に実行
        .then((stream) => {
            userVideo.srcObject = stream; // 映像を video タグに表示
        })
        .catch((error) => {
            console.error("カメラの起動に失敗しました:", error)
        });
}
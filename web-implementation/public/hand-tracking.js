/* MediaPipeのクラスをインポート */
import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

/* グローバル変数 */
const video = document.getElementById("webCam");
let handLandmarker; // 空の箱を用意

/* エントリーポイントの指定 */
document.addEventListener("DOMContentLoaded", () => {
    main();
});

/* 
Main 
*/
function main() {
    camOn();
}

/* 
button camOn 
*/
function camOn() {
    // ボタンを取得
    const btn = document.getElementById('startButton');

    // クリックされたらカメラon
    // ()つけると即時実行になるので
    btn.addEventListener('click', startCamera);
}

/* 
start Camera
*/
function startCamera() {
    // カメラの映像を取得 
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
        // カメラが取得できた時に実行
        // 帰ってきたプロミスに対してコールバック実行。
        .then((stream) => {
            video.srcObject = stream; // 映像を video タグに表示
        })
        .catch((error) => {
            console.error('カメラの起動に失敗しました:', error);
        });
        /* ランドマークの初期化 */
        createHandLandmarker();
}

/* HandLandmarkの初期化 */
const createHandLandmarker = async () => {
    /* MediaPipeの初期設定 */
    const vision = await FilesetResolver.forVisionTasks(
        // vision tasksをとってきている。
        // tasksってそもそもなんやねん。solutionが入ってる箱？
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    /* オプションを選択してインスタンス化 */
    handLandmarker = await HandLandmarker.createFromOptions(
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

/* requestAnimationFrame調べる */
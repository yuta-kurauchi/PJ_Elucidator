/* MediaPipeのクラスをインポート */
import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

/* グローバル変数 */
const video = document.getElementById("webCam");
let handLandmarker; // 空の箱をグローバルに用意
let lastVideoTime = -1;
let isCamRunning = false;
const WristId = 0;


/* エントリーポイントの指定 */
document.addEventListener("DOMContentLoaded", () => {
    main();
});

/* 
Main 
*/
function main() {
    camStartBtn();
    camStopBtn();
}

/* 
button camOn 
*/
function camStartBtn() {
    // ボタンを取得
    const btn = document.getElementById('startButton');

    // クリックされたらカメラon
    // ()つけると即時実行になるので
    btn.addEventListener('click', startCamera);
}

function camStopBtn() {
    // ボタンを取得
    const btn = document.getElementById('stopButton');

    // クリックされたら、カメラと解析を停止
    btn.addEventListener('click', stopAll);
}

function stopAll() { 
    // ループフラグを折る。
    isCamRunning = false;
    
    // カメラの電源を完全に切る
    const stream = video.srcObject;
    if (stream) {
        const track = stream.getTracks()[0];
        // カメラを停止
        track.stop();
        // ソースを取り除く
        // ここで、stream = null にすると、constantをいじるなと怒られる。
        video.srcObject = null;
    }
}

/* 
start Camera
*/
function startCamera() {
    isCamRunning = true;
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
            baseOptions: {
                // .taskファイルへのpath
                modelAssetPath: "./models/hand_landmarker.task"
            },
            runningMode: "VIDEO",
            numHands: 2,
        });
    /* 解析ループを呼び出す */
    renderLoop();
}

/* 
解析用のループ(毎フレームごとに解析) 
*/
// 返り値はなし
function renderLoop() {
    // framecont
    let fc = 0;
    /* フレーム更新がされている場合 */
    if (video.currentTime > 0 && video.currentTime !== lastVideoTime) {
        // 現在の時刻を取得
        let startTimeMs = performance.now();
        // 解析
        const detections = handLandmarker.detectForVideo(video, startTimeMs);
        // ラストタイムの更新
        lastVideoTime = video.currentTime;

        // 手があってかつ、60フレームごと
        if (detections.handednesses[0] !== undefined && fc % 590 === 0) {
            // 結果の出力
            console.log(detections.landmarks[0][WristId]);
            // object、{landmarks:Array(num), worldLandmarks:Array(num), handednesses:Array(num)}
            fc++;
        }
    }

    /* 次の画面更新の際にもう一度、引数の関数を呼び出す。予約なので、()はつけない */
    if (isCamRunning) {
        requestAnimationFrame(renderLoop);
    }
}
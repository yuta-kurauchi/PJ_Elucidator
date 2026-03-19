/* MediaPipeのクラスをインポート */
import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

/* Three.jsのインポート */
// * as name はモジュールの全てのexportをimportし、名前空間として管理する。
import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';

/* グローバル変数 */
const video = document.getElementById("webCam");
const WRIST = 0;
const THUMB = 1;
const MIDDLE = 9;
const PINKY = 17;
let handLandmarker; // 空の箱をグローバルに用意
let width, height; // 画面サイズの変数を宣言
let palmNormal; // 法線ベクトル格納用
let lastVideoTime = -1;
let isCamRunning = false;


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
    // 動画のサイズを取得
    width = video.videoWidth;
    height = video.videoHeight;
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
            numHands: 1,
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
        // 解析 何でconstでいいのだろうか。毎回変わるよね？代入でなく毎回初期化だからいいのかな？
        // 毎回初期化されているからok 
        // constはそのブロック内では変更できないというものなので、ループごとに別のブロックとして認識されるから、大丈夫
        // object、{landmarks:Array(num), worldLandmarks:Array(num), handednesses:Array(num)}
        const detections = handLandmarker.detectForVideo(video, startTimeMs);
        // ラストタイムの更新
        lastVideoTime = video.currentTime;

        // 手があってかつ、60フレームごと
        // フレーム条件の機能していないかも
        if (detections.handednesses[0] !== undefined && fc % 59 === 0) {
            /* ベクトルの作成 */
            const landmark = detections.landmarks[0];
            const worldLandmarks = detections.worldLandmarks[0];
            const isRightHand = detections.handednesses[0].categoryName === "Right";
            /* 手首の座標を実寸大に変更 */
            const wristPosRial = new THREE.Vector3(
                landmark[WRIST].x * width, 
                landmark[WRIST].y * height, 
                landmark[WRIST].z
            );
            /* 手首からの相対ベクトルを計算 */
            // pythonの時はunityでの動きをリアルスケールにするために、worldを使ってた
            const thumb_vec = makeVector(THUMB, landmark);
            const middle_vec = makeVector(MIDDLE, landmark);
            const pinky_vec = makeVector(PINKY, landmark);
            /* 掌の法線ベクトルを計算 */
            if (isRightHand) {
                palmNormal = new THREE.Vector3().crossVectors(thumb_vec, pinky_vec);
            }
            else {
                palmNormal = new THREE.Vector3().crossVectors(pinky_vec, thumb_vec);
            }

            /* 姿勢制御に必要なもの */
            /* 
            data.json = {
                "wristPos" : wristPosRial,
                "palmNormal" : palmNormal,
                "middleVec" : middle_vec.
                "isRight" : isRightHand
            }
            */

            /* これがうまくいってない */
            // 手の左右判定はあっている。
            // 系も考慮して、負が上にしている。
            const isUp = palmNormal.y < 0;

             
            // 結果の出力
            console.log(`isUp : ${isUp}`);
            fc++;
        }
    }

    /* 次の画面更新の際にもう一度、引数の関数を呼び出す。予約なので、()はつけない */
    if (isCamRunning) {
        requestAnimationFrame(renderLoop);
    }
}

/* 
Three.jsのVector3クラスを使ってベクトルに変換
*/
function makeVector(id, landmark) {
    const target_pos = new THREE.Vector3(
        landmark[id].x,
        landmark[id].y,
        landmark[id].z
    );
    const wrist_pos = new THREE.Vector3(
        landmark[WRIST].x,
        landmark[WRIST].y,
        landmark[WRIST].z
    );
    // 手首からの相対ベクトルを作成
    const relative_vec = new THREE.Vector3().subVectors(target_pos, wrist_pos);
    return relative_vec;
}
/*
Import
*/

// MediaPipeのクラス
import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

// Three.js
// * as name はモジュールの全てのexportをimportし、名前空間として管理する。
import * as THREE from "three";

// 3d-space.jsのexport
import { Canvas } from "./3d-space.js";


/* 
グローバル変数 
*/
// LandmarkID
const WRIST = 0;
const THUMB = 1;
const MIDDLE = 9;
const PINKY = 17;
const ID = [WRIST, THUMB, MIDDLE, PINKY];
// EMA用
const ALPHA = 0.2; // 生データの比率
// 平滑化されたベクトルの格納用(Vector3)
let smoothedVector = {
    0:null,
    1:null,
    9:null,
    17:null
}
// 箱の用意(グローバルにつかうため)
const video = document.getElementById("webCam"); // videoのdom
let handLandmarker;
let width, height;
let palmNormal;
let lastVideoTime = -1; // 画面更新のフラグを初期化
let isCamRunning = false; // カメラのフラグを初期化
let canvas;


/* 
エントリーポイントの指定 
*/
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
    // ()つけると即時実行になるので注意
    btn.addEventListener('click', startCamera);
}

function camStopBtn() {
    // ボタンを取得
    const btn = document.getElementById('stopButton');

    // クリックされたら、カメラと解析を停止
    btn.addEventListener('click', stopAll);
}

/* 
init 3D 
*/
function init3D(stream) {
    /* 3Dの初期化 */
    const videoTrack = stream.getVideoTracks()[0]; // Video Trackを取得
    const settings = videoTrack.getSettings(); // 現在のカメラ設定を取得
    // サイズを取得
    width = settings.width;
    height = settings.height;
    // console.log(width, height);
    /* キャンバスの初期化 */
    canvas = new Canvas(width, height);    
}

/*
stopCamAll 
*/
function stopAll() { 
    // ループフラグを折る。
    isCamRunning = false;
    
    // カメラの電源を完全に切る
    const stream = video.srcObject;
    if (stream) {
        // getUserMediaで開いたデバイスのindex:0のtrackを取得
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
            init3D(stream);     
        })
        .catch((error) => {
            console.error('カメラの起動に失敗しました:', error);
        });
    /* ランドマークの初期化 */
    createHandLandmarker();
}

/* 
HandLandmarkの初期化 
*/
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
    /* フレーム更新がされている場合 */
    if (video.currentTime > 0 && video.currentTime !== lastVideoTime) {
        // 現在の時刻を取得
        const startTimeMs = performance.now();
        // ラストタイムの更新
        lastVideoTime = video.currentTime;
        // 解析結果を取得
        /* detections = {
            landmarks:Array(num), 
            worldLandmarks:Array(num), 
            // 二次元なので注意
            handednesses:Array(0)(num)
        } */
        const detections = handLandmarker.detectForVideo(video, startTimeMs);

        // 手がある場合
        if (detections.handednesses[0] !== undefined) {
            /* Landmarkの取得 */
            const landmark = detections.landmarks[0];
            // const worldLandmarks = detections.worldLandmarks[0];

            /* 平滑化された位置ベクトルを作成 */
            makePosVec(landmark);

            // /* 座標の確認(デバック用) */
            // 参照渡しにならないようにする方法まとめる。
            // オブジェクトを一度文字列（JSON）に変換してから表示する
            // console.log(JSON.stringify(smoothedVector));

            /* 手首の座標を実寸大に変更 */
            const wristPosRial = new THREE.Vector3(
                smoothedVector[WRIST].x * width, 
                smoothedVector[WRIST].y * height, 
                smoothedVector[WRIST].z
            );

            /* 手首からの相対ベクトルを計算 */
            // pythonの時はunityでの動きをリアルスケールにするために、worldを使ってた
            const thumb_vec = makeRelativeVec(THUMB);
            const middle_vec = makeRelativeVec(MIDDLE);
            const pinky_vec = makeRelativeVec(PINKY);

            /* 掌の法線ベクトルを計算 */
            // 右手かどうかの判断
            const isRightHand = detections.handednesses[0][0].categoryName === "Right";
            if (isRightHand) {
                palmNormal = new THREE.Vector3().crossVectors(thumb_vec, pinky_vec);
            }
            else {
                palmNormal = new THREE.Vector3().crossVectors(pinky_vec, thumb_vec);
            }

            /* 姿勢制御に必要なもの */
            /* 
            data.json = {
                "wristPos" : wristPosRial, // 手の座標を示すため
                "palmNormal" : palmNormal, // 手の表裏を示すため
                "middleVec" : middle_vec, // 手の向きを示すため
                "isRight" : isRightHand //右手の場合のみ動かすため
            }
            */

            /* 手の上下判定(デバック用) */
            const isUp = palmNormal.y < 0;
            console.log(`isUp : ${isUp}`);
        }
        // 手がない場合
        else {
            resetSmoothedVec();
        }
    }

    /* 次の画面更新の際にもう一度、引数の関数を呼び出す。予約なので、()はつけない */
    if (isCamRunning) {
        requestAnimationFrame(renderLoop);
    }
}

/* 
位置ベクトルの計算 
*/
function makePosVec(landmark) {
    ID.forEach((id) => {
        // 生データのposVecを作成
        const rawPosVec = new THREE.Vector3(
            landmark[id].x,
            landmark[id].y,
            landmark[id].z
        );
        // 前回のデータがない場合
        if (smoothedVector[id] === null) {
            // Vector3として代入
            smoothedVector[id] = new THREE.Vector3(
                rawPosVec.x,
                rawPosVec.y,
                rawPosVec.z
            );
        } else {
            // 平滑化 (rawをALPHA(0.2)だけ混ぜる)
            // 書き方とイメージまとめる。
            smoothedVector[id].lerp(rawPosVec, ALPHA);
        }
    });
}

/*
smothedVecのリセット 
*/
function resetSmoothedVec() {
    ID.forEach((id) => {
        smoothedVector[id] = null;
    });
}

/* 
手首からの相対ベクトルを作成
*/
function makeRelativeVec(id) {
    // 手首からの相対ベクトルを作成
    const relative_vec = new THREE.Vector3().subVectors(smoothedVector[id], smoothedVector[WRIST]); 
    return relative_vec;
}
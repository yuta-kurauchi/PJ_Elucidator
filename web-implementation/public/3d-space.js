import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export class Canvas {
    constructor(width, height) {
        /* 手のデータ */
        this.handData = {
            "wristPos": undefined, // 手の座標を示すため
            "wristPosNDC": new THREE.Vector3(), // 座標トラッキング用
            "palmNormal": undefined, // 手の表裏を示すため
            "middleVec": undefined, // 手の向きを示すため
            "isRight": undefined //右手の場合のみ動かすため
        };
        /* 姿勢制御用の正規直交軸 */
        this.handAxes = {
            "x" : new THREE.Vector3(),
            "y" : new THREE.Vector3(),
            "z" : new THREE.Vector3()
        };
        /* quaternion生成用matrix4 */
        this.mat4 = new THREE.Matrix4();
        /* 回転qua */
        this.rotQua = new THREE.Quaternion();
        /* quaternionの平滑化用 */
        this.somoothedQua = new THREE.Quaternion();
        // 平滑化用の定数
        const ALPHA = 0.2;
        // 前回のデータがあるかのフラグ
        this.isTracking = false;
        /* サイズ */
        this.w = width;
        this.h = height;
        /* スクリーン座標計算用(toScreanPos) */
        this.center2D = new THREE.Vector2(this.w / 2, this.h / 2);
        this.center = new THREE.Vector3(this.center2D.x, this.center2D.y, 0);
        this.relative_vec = new THREE.Vector3();
        /* 座標トラッキング用のワールド座標 */
        this.wristPosWorld = new THREE.Vector3();

       /* レンダラーを作成 */
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.w, this.h); // 描画サイズ
        this.renderer.setPixelRatio(window.devicePixelRatio); // ピクセル比

        /* キャンバスに設定 */
        this.canvas = document.getElementById("output_canvas");
        this.canvas.appendChild(this.renderer.domElement);

        /* カメラを作成(視野角, 画面のアスペクト比, カメラに映る最短距離, カメラに映る最遠距離) */
        this.camera = new THREE.PerspectiveCamera(60, this.w / this.h, 1, 10);
        this.camera.position.z = 5; // カメラを遠ざける。

        /* シーンを作成 */
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x949593);

        // レンダラーを使って環境マップを生成するための準備
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        // 架空の部屋(RoomEnvironment)を作り、シーン全体の「反射光(environment)」として設定
        this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

        /* ライトを追加 */
        this.light = new THREE.AmbientLight(0xffffff, 5);
        this.scene.add(this.light);

        // /* 立方体のジオメトリを作成(幅、高さ、奥行き) */
        // this.geo = new THREE.BoxGeometry(1, 1, 1);
        // /* マテリアルを作成 */
        // this.mat = new THREE.MeshNormalMaterial();
        // /* ジオメトリとマテリアルからメッシュを作成 */
        // this.box = new THREE.Mesh(this.geo, this.mat);
        // /* メッシュをシーンに追加 */
        // this.scene.add(this.box);

        /* モデルを動かすための親を作成 */
        this.handGroup = new THREE.Group();
        this.handGroup.rotateX(-Math.PI / 2);
        this.scene.add(this.handGroup);
        // ローカル座標軸を表示(引数は長さ)
        const groupAxes = new THREE.AxesHelper(2);
        this.handGroup.add(groupAxes);

        this.object = null;
        /* GLTF形式のモデルインポート */
        const loader = new GLTFLoader();
        loader.load('./models/Elucidator.glb', (data) => {
            const gltf = data;
            this.object = gltf.scene;
            this.object.scale.set(2, 2, 2);
            this.object.position.set(0, 0 ,0);
            this.object.rotateX(-Math.PI);
            this.object.rotateY(-Math.PI / 8);
            // // 軸表示
            // const objAxes = new THREE.AxesHelper(1);
            // this.object.add(objAxes);
            // // シーンに追加
            // this.scene.add(this.object);
            /* 子にモデルを追加 */
            this.handGroup.add(this.object);
        });

        /* ループの予約 */
        // コールバック関数だと、thisが参照元を見失い、undefinedになる。
        // ループ内でnewを使うな!!
        this.renderer.setAnimationLoop(() => {
            /* 右手トラッキング */
            // 手が写っていて、それが右手の場合
            if (this.handData.wristPos !== undefined && this.handData.isRight) {
                // スクリーン内の正規化座標をワールド座標に変換
                this.worldPointFromScreenPoint(this.handData.wristPosNDC, this.camera);
                /* 座標トラッキング */
                this.handGroup.position.copy(this.wristPosWorld);
                /* 姿勢制御 */
                // 制御用の正規直交座標を計算
                this.toMakeAxes();
                // Matrix4に変換
                this.mat4.makeBasis(this.handAxes.x, this.handAxes.y, this.handAxes.z);
                // Quaternionに変換
                this.rotQua.setFromRotationMatrix(this.mat4);
                if (!this.isTracking) {
                    // 前のデータがない場合
                    this.somoothedQua.copy(this.rotQua);
                    // データができたので、フラグを立てる
                    this.isTracking = true;
                } else {
                    // 前のデータがある場合
                    this.somoothedQua.slerp(this.rotQua, ALPHA);
                }
                /* 姿勢トラッキング */
                this.handGroup.quaternion.copy(this.somoothedQua);
            } else {
                // フラグを折る
                this.isTracking = false;
            }
            /* 画面に表示 */
            this.renderer.render(this.scene, this.camera);
        });
    }
    /* ハンドデータの更新 */
    upDateData(data) {
        this.handData.wristPos = data.wristPos;
        this.toScreenPos(data.wristPos);
        this.handData.palmNormal = data.palmNormal;
        this.handData.middleVec = data.middleVec;
        this.handData.isRight = data.isRight;
    }
    /* 手の正規直交座標を作成 */
    toMakeAxes() {
        // 中指方向を基準
        this.handAxes.x.copy(this.handData.middleVec.normalize());
        // これってnew必要なんだっけ？そしてなぜ必要？
        // newは新しく指定のクラスのインスタンスを作成するのに必要
        this.handAxes.z.crossVectors(this.handAxes.x, this.handData.palmNormal).normalize();
        // z,xから正規直交のyを生成
        this.handAxes.y.crossVectors(this.handAxes.z, this.handAxes.x);
    }
    /* スクリーン座標への変換 */
    // z軸、奥行きも反映できるようにしたい。
    toScreenPos(pos) {
        if (pos !== undefined) {
            /* 画面中心からの相対座標へ変換 */
            this.relative_vec.subVectors(pos, this.center);
            // 正規化
            // 奥行きはpos.zでそのまま入れればいいのでは？(mpとの軸の違いに注意)
            this.handData.wristPosNDC.set(this.relative_vec.x / this.center2D.x, this.relative_vec.y / this.center2D.y, 0);
        }
        // loopの条件で、undefinedの場合wristPosNDCの値は使われないので、初期値のままでok
    }
    /* スクリーン座標をワールド座標へ変換 */
    worldPointFromScreenPoint( screenPoint, camera ) {
        // unprojectが破壊的メソッドなので、移してから行う
        this.wristPosWorld.set(screenPoint.x, screenPoint.y, 0);
        this.wristPosWorld.unproject( camera );
    }
    /* キャンバスの除去 */
    removeCanvas() {
        // animationLoopをキャンセル
        this.renderer.setAnimationLoop(null);
        // traverse(巡回)して、メッシュを消去
        this.scene.traverse(function (object) {
            if (object.isMesh) {
                object.geometry.dispose();
                object.material.dispose();
            }
        });
        // オブジェクトがなくなるまでループしてシーンを空にする。
        while(this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        // webGLコンテキストを破棄
        this.renderer.dispose();
        // 強制的にコンテキストを失わせる
        this.renderer.forceContextLoss();
        // DOMから消去
        // disposeの前に書くべきでは？
        if (this.renderer && this.renderer.domElement) {
            this.canvas.removeChild(this.renderer.domElement);
        }
    }
}
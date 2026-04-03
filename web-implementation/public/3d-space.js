import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export class Canvas {
    constructor(width, height) {
        /* 姿勢制御用のデータ */
        this.handData = {
            "wristPos": undefined, // 手の座標を示すため
            "wristPosNDC": undefined, // 座標トラッキング用
            "palmNormal": undefined, // 手の表裏を示すため
            "middleVec": undefined, // 手の向きを示すため
            "isRight": undefined //右手の場合のみ動かすため
        };
        this.handAxes = {
            "x" : undefined,
            "y" : undefined,
            "z" : undefined
        };
        /* サイズ */
        this.w = width;
        this.h = height;

       /* レンダラーを作成 */
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(this.w, this.h); // 描画サイズ
        this.renderer.setPixelRatio(window.devicePixelRatio); // ピクセル比

        /* キャンバスに設定 */
        const canvas = document.getElementById("output_canvas");
        canvas.appendChild(this.renderer.domElement);

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
        this.renderer.setAnimationLoop(() => {
            /* 右手トラッキング */
            // 手が写っていて、それが右手の場合
            if (this.handData.wristPos !== undefined && this.handData.isRight) {
                // スクリーン内の正規化座標をワールド座標に変換
                const wristPosWorld = this.worldPointFromScreenPoint(this.handData.wristPosNDC, this.camera);
                /* 座標トラッキング */
                this.handGroup.position.copy(wristPosWorld);
                /* 姿勢制御 */
                // 制御用の正規直交座標を計算
                this.toMakeAxes();
                // Matrix4に変換
                const mat4 = new THREE.Matrix4();
                mat4.makeBasis(this.handAxes.x, this.handAxes.y, this.handAxes.z);
                // Quaternionに変換
                const rotQua = new THREE.Quaternion();
                rotQua.setFromRotationMatrix(mat4);
                /* 姿勢トラッキング */
                this.handGroup.quaternion.copy(rotQua);
            }
            /* 画面に表示 */
            this.renderer.render(this.scene, this.camera);
        });
    }
    /* ハンドデータの更新 */
    upDateData(data) {
        this.handData.wristPos = data.wristPos;
        this.handData.wristPosNDC = this.toScreenPos(data.wristPos);
        this.handData.palmNormal = data.palmNormal;
        this.handData.middleVec = data.middleVec;
        this.handData.isRight = data.isRight;
    }
    /* 手の正規直交座標を作成 */
    toMakeAxes() {
        // 中指方向を基準
        this.handAxes.x = this.handData.middleVec.normalize();
        // これってnew必要なんだっけ？そしてなぜ必要？
        this.handAxes.z = new THREE.Vector3().crossVectors(this.handAxes.x, this.handData.palmNormal).normalize();
        // z,xから正規直交のyを生成
        this.handAxes.y = new THREE.Vector3().crossVectors(this.handAxes.z, this.handAxes.x);
    }
    /* スクリーン座標への変換 */
    toScreenPos(pos) {
        if (pos !== undefined) {
            /* 画面中心からの相対座標へ変換 */
            const center2D = new THREE.Vector2(this.w / 2, this.h / 2);
            const center = new THREE.Vector3(center2D.x, center2D.y, pos.z);
            const relative_vec = new THREE.Vector3().subVectors(pos, center);
            // 正規化
            const ndc = new THREE.Vector3(relative_vec.x / center2D.x, relative_vec.y / center2D.y, 0);
            return ndc;
        } else {
            return pos;
        }
    }
    /* スクリーン座標をワールド座標へ変換 */
    worldPointFromScreenPoint( screenPoint, camera ) {
        // unprojectが破壊的メソッドなので、移してから行う
        let worldPoint = new THREE.Vector3();
        worldPoint.x = screenPoint.x;
        worldPoint.y = screenPoint.y;
        worldPoint.z = 0;
        worldPoint.unproject( camera );
        return worldPoint;
    }
}
import * as THREE from "three";

export class Canvas {
    constructor(width, height) {
        /* 姿勢制御用のデータ */
        this.handData = {
            "wristPos": undefined, // 手の座標を示すため
            "palmNormal": undefined, // 手の表裏を示すため
            "middleVec": undefined, // 手の向きを示すため
            "isRight": undefined //右手の場合のみ動かすため
        }
       /* レンダラーを作成 */
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height); // 描画サイズ
        this.renderer.setPixelRatio(window.devicePixelRatio); // ピクセル比

        /* キャンバスに設定 */
        const canvas = document.getElementById("output_canvas");
        // この書き方について調べる
        canvas.appendChild(this.renderer.domElement);

        /* カメラを作成(視野角, 画面のアスペクト比, カメラに映る最短距離, カメラに映る最遠距離) */
        this.camera = new THREE.PerspectiveCamera(60, width / height, 1, 10);
        this.camera.position.z = 5; // カメラを遠ざける。

        /* シーンを作成 */
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);

        /* ライトを追加 */
        this.light = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(this.light);

        /* 立方体のジオメトリを作成(幅、高さ、奥行き) */
        this.geo = new THREE.BoxGeometry(1, 1, 1);
        /* マテリアルを作成 */
        this.mat = new THREE.MeshNormalMaterial();
        /* ジオメトリとマテリアルからメッシュを作成 */
        this.box = new THREE.Mesh(this.geo, this.mat);
        /* メッシュをシーンに追加 */
        this.scene.add(this.box);

        /* ループの予約 */
        // コールバック関数だと、thisが参照元を見失い、undefinedになる。
        this.renderer.setAnimationLoop(() => {
            // 吹っ飛ぶので、座標の仕組み調べる。
            if (this.handData.wristPos !== undefined && this.handData.isRight) {
                this.box.position.copy(this.handData.wristPos);
                
            }
            // console.log(this.handData);
            /* 画面に表示 */
            this.renderer.render(this.scene, this.camera);
        });
    }
    /* ハンドデータの更新 */
    upDateData(data) {
        this.handData.wristPos = data.wristPos;
        this.handData.palmNormal = data.palmNormal;
        this.handData.middleVec = data.middleVec;
        this.handData.isRight = data.isRight;
    }
}
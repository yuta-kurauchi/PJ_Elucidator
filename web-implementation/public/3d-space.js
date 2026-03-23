import * as THREE from "three";

export function init3D(width, height) {
    
    /* レンダラーを作成 */
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height); // 描画サイズ
    renderer.setPixelRatio(window.devicePixelRatio); // ピクセル比

    /* キャンバスに設定 */
    const canvas = document.getElementById("output_canvas");
    // この書き方について調べる
    canvas.append(renderer.domElement);

    /* カメラを作成(視野角, 画面のアスペクト比, カメラに映る最短距離, カメラに映る最遠距離) */
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 10);
    camera.position.z = 5; // カメラを遠ざける。

    /* シーンを作成 */
    const scene = new THREE.scene();

}
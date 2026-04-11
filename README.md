# WebCam Hand-Tracking 3D Viewer

## 概要 (Overview)
Webカメラの映像からリアルタイムで手のランドマークを検出し、ブラウザ上で3D空間と連動させるシステムです。
特別なVR/ARデバイスを必要とせず、標準的なWebブラウザとカメラのみで動作するインタラクティブな3Dビューアを目指して開発しています。
現在はプロトタイプとして、手の動きに合わせて特定の3Dモデル（剣）の姿勢制御を行う実装まで完了しています。

## デモ (Demo)
※ここにGIF動画を追加予定

## 使用している主な技術 (Tech Stack)
* **フロントエンド**: HTML / CSS / Vanilla JavaScript
* **3D描画 (WebGL)**: Three.js
* **AI・姿勢推定**: MediaPipe (Hand Landmarker)
* **サーバー・インフラ**: Node.js (Express), Docker / Docker Compose

## ディレクトリ構成 (Directory Structure)
本リポジトリは、過去の検証用プロジェクトと現在のWeb実装が混在していますが、メインの開発領域は `web-implementation` フォルダです。

```text
WEBCAM-HANDTRACKING-3D-VIEWER/
├── python-tracking/      # [旧版] Python(OpenCV)を用いたトラッキング検証用
├── unity-project/        # [旧版] Unityを用いた3D空間への反映テスト用
├── web-implementation/   # [現在のメイン] Webブラウザ完結型の実装
│   ├── public/           # フロントエンドのアセット (JS, HTML, CSS, 3Dモデル)
│   ├── server.js         # Expressによる静的ファイル配信サーバー
│   ├── package.json      
│   └── Dockerfile        # Node.js環境構築用
├── docker-compose.yml    # コンテナ起動用定義ファイル
└── README.md


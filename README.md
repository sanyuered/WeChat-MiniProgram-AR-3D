[Chinese README](https://zhuanlan.zhihu.com/p/82773324)  

## Updated

| Date　　　| Update |
| -- | -- |
| 2022-01-02 | New: Gamma color space correction. |
| 2021-09-07 | New: Added a compass and map demo. Update: Fixed the value of the Device Orientation Control on Android is opposite to iOS. |
| 2021-02-25 | New: Scan a QR code to update the url of the gltf model. Update: 1. add a directional light for the model viewer to make the model have shadows. 2. add the device pixel ratio for the panorama viewer to make the picture clear. |
| 2019-10-31 | Updated: Use a new Gltf loader modified by "wechat-miniprogram". Support .glb format without textures and .gltf format. |
| 2019-09-17 | New: A WeChat MiniProgram 3D that includes a Panorama Viewer and a 3D Viewer using the device orientation control. |

## Introduction on WeChat MiniProgram 3D

Three.js is a JavaScript 3D library.

[Three.js](https://github.com/mrdoob/three.js)

There is a WeChat MiniProgram adapted version of Three.js.

[threejs-miniprogram](https://github.com/wechat-miniprogram/threejs-miniprogram)
 
Index Page

![avatar](screenshot/1.jpg)

## 3D Viewer

![avatar](screenshot/4.gif)

When click the "Model Viewer" button, a 3D viewer will be showed.

![avatar](screenshot/5.jpg)

We can rotate the screen by a device orientation control or using guestures.

![avatar](screenshot/6.jpg)

## Panorama Viewer

When click the "Panorama Viewer" button, a panorama viewer will be showed.

portrait screen

![avatar](screenshot/2.jpg)

landscape screen

![avatar](screenshot/3.jpg)

When start a device motion, the device orientation control will rotate the screen.

When stop a device motion, use guestures to rotate the screen.

## Compass and Map Viewer

When click the "Compass Viewer" button, a Compass and Map will be showed.

![avatar](screenshot/7.jpg)

Clicking on the map control will search for buildings near the clicked position. 

Entering tickets, roads and landmarks in the input box will locate the search position on the map control.

## How to build

The Mini-program depends on a "threejs-miniprogram" npm package. 

step 1: npm install

step 2: run "微信开发者工具--工具--构建npm", a folder "miniprogram_npm" will be updated.

The project includes a folder "miniprogram_npm" precompiled.

File: /package.json

```javascript
  "dependencies": {
    "threejs-miniprogram": "0.0.2"
  }
```

## What changes to GLTFLoader.js

You can search a keyword "2019.9.11 modified" in GLTFLoader.js. The search result is a code modified.

For example, added a export of function "GLTF_Loader". Use the function to set the "THREE" object into the "GLTFLoader.js" module.

File: /utils/GLTFLoader.js

```javascript
   // 2019.9.11 modified
   // THREE.GLTFLoader = ( function () {
   export function GLTF_Loader(THREE) {
```
## Set your website url of models

The project includes a gltf model that are depolyed on a website. The default value of parameter "modelUrl" is a website url that may be very slow on your network. You can replace the default url with a web site url.

Download models: https://github.com/sanyuered/sanyuered.github.io/tree/master/gltf

```javascript
    // set your site url of a gltf model
    const modelUrl = 'https://sanyuered.github.io/gltf/robot.glb';
    //const modelUrl = 'http://127.0.0.1/robot.glb';
```

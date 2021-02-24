const { createScopedThreejs } = require('threejs-miniprogram');
const { registerGLTFLoader } = require('../../utils/GLTFLoader.js');
const deviceOrientationControl = require('../../utils/DeviceOrientationControl.js');
const deviceMotionInterval = 'ui';
var camera, scene, renderer;
var canvas;
var touchX, touchY, device = {};
var lon, lat, gradient;
var THREE;
var mainModel, requestId;
var isDeviceMotion = false;
var last_lon, last_lat, last_device = {};

function initThree(canvasId, modelUrl) {
    wx.createSelectorQuery()
        .select('#' + canvasId)
        .node()
        .exec((res) => {
            canvas = res[0].node;
            THREE = createScopedThreejs(canvas);

            initScene();
            loadModel(modelUrl);
        });
}

function initScene() {
    lon = -90;
    lat = 0;

    // init Perspective Camera
    camera = new THREE.PerspectiveCamera(75,
        canvas.width / canvas.height,
        1,
        1000);
    // according to camera position
    camera.position.set(0, 3, 5);

    scene = new THREE.Scene();
    // ambient light
    scene.add(new THREE.AmbientLight(0xffffff));
    // direction light
    var directionallight = new THREE.DirectionalLight(0xffffff, 1);
    directionallight.position.set(5, 10, 7.5);
    scene.add(directionallight);

    // init render
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    const devicePixelRatio = wx.getSystemInfoSync().pixelRatio;
    console.log('devicePixelRatio', devicePixelRatio);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(canvas.width, canvas.height);

    animate();

}

function loadModel(modelUrl) {
    registerGLTFLoader(THREE);
    var loader = new THREE.GLTFLoader();
    wx.showLoading({
        title: 'Loading Model...',
    });
    loader.load(modelUrl,
        function (gltf) {
            console.log('loadModel', 'success');
            var model = gltf.scene;
            // save model
            mainModel = model;
            scene.add(model);
            wx.hideLoading();
        },
        null,
        function (error) {
            console.log('loadModel', error);
            wx.hideLoading();
            wx.showToast({
                title: 'Loading model failed.',
                icon: 'none',
                duration: 3000,
            });
        });
}

function updateModel(modelUrl) {
    var loader = new THREE.GLTFLoader();
    // loading
    wx.showLoading({
        title: 'Loading Model...',
    });
    loader.load(modelUrl,
        function (gltf) {
            console.log('loadModel', 'success');
            var model = gltf.scene;
            // remove old model
            scene.remove(mainModel);
            // save new model
            mainModel = model;
            // add new model
            scene.add(model);
            wx.hideLoading();
        },
        null,
        function (error) {
            console.log('loadModel', error);
            wx.hideLoading();
            wx.showToast({
                title: 'Loading model failed.',
                icon: 'none',
                duration: 3000,
            });
        });

    wx.hideLoading();
}

function animate() {
    requestId = canvas.requestAnimationFrame(animate);

    // manual mode
    if (lon !== last_lon ||
        lat !== last_lat) {

        last_lon = lon;
        last_lat = lat;

        deviceOrientationControl.modelRotationControl(mainModel, lon, lat, gradient, THREE);

    }

    // auto mode
    if (last_device.alpha !== device.alpha ||
        last_device.beta !== device.beta ||
        last_device.gamma !== device.gamma) {

        last_device.alpha = device.alpha;
        last_device.beta = device.beta;
        last_device.gamma = device.gamma;

        if (isDeviceMotion) {
            deviceOrientationControl.deviceControl(camera, device, THREE);
        }
    }


    // render for Perspective Camera
    renderer.render(scene, camera);
}

function stopAnimate() {
    if (canvas && requestId) {
        canvas.cancelAnimationFrame(requestId);
    }
}

function onTouchstart(event) {
    var touch = event.touches[0];
    touchX = touch.x;
    touchY = touch.y;
}

function onTouchmove(event) {
    var touch = event.touches[0];
    var moveX = touch.x - touchX;
    var moveY = touch.y - touchY;
    lon += moveX;
    lat += moveY;
    touchX = touch.x;
    touchY = touch.y;
    gradient = Math.abs(moveX / moveY);

}

function startDeviceMotion() {
    isDeviceMotion = true;
    wx.onDeviceMotionChange(function (_device) {
        device = _device;
    });
    wx.startDeviceMotionListening({
        interval: deviceMotionInterval,
        success: function () {
            console.log('startDeviceMotionListening', 'success');
        },
        fail: function (error) {
            console.log('startDeviceMotionListening', error);
        }
    });
}

function stopDeviceMotion() {
    isDeviceMotion = false;
    wx.offDeviceMotionChange();
    wx.stopDeviceMotionListening({
        success: function () {
            console.log('stopDeviceMotionListening', 'success');
        },
        fail: function (error) {
            console.log('stopDeviceMotionListening', error);
        }
    });
}

module.exports = {
    initThree,
    onTouchstart,
    onTouchmove,
    startDeviceMotion,
    stopDeviceMotion,
    stopAnimate,
    updateModel,
}
const { createScopedThreejs } = require('threejs-miniprogram');
const deviceOrientationControl = require('../../utils/DeviceOrientationControl.js');
const deviceMotionInterval = 'ui';
var camera, scene, renderer;
var canvas;
var touchX, touchY, device = {};
var lon, lat, gradient;
var THREE;
var seletedModel, requestId;
var isDeviceMotion = false;
var isAndroid = false;
var last_lon, last_lat, last_device = {};
var cameraFrame = {};
var cameraRTT, sceneRTT, planeTexture;

function initThree(canvasId, callback) {
    wx.createSelectorQuery()
        .select('#' + canvasId)
        .node()
        .exec((res) => {
            canvas = res[0].node;
            THREE = createScopedThreejs(canvas);

            if (typeof callback === 'function') {
                callback(THREE);
            }
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
    scene.add(new THREE.AmbientLight(0xffffff));

    if (!isAndroid) {
        // init Orthographic Camera
        initBackroundScene();
    }
    // init render
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    console.log('canvas size', canvas.width, canvas.height);
    renderer.setSize(canvas.width, canvas.height);
    if (!isAndroid) {
        renderer.autoClear = false;
    }
    animate();

}

function initBackroundScene() {
    cameraRTT = new THREE.OrthographicCamera(canvas.width / -2, canvas.width / 2, canvas.height / 2, canvas.height / -2, -100, 0);
    cameraRTT.position.z = 0;

    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1).normalize();

    sceneRTT = new THREE.Scene();
    sceneRTT.add(light);

    var planeBufferGeometry = new THREE.PlaneGeometry(canvas.width, canvas.height);
    var planeMaterial = new THREE.MeshBasicMaterial();
    planeTexture = new THREE.DataTexture();
    planeMaterial.map = planeTexture;
    var plane = new THREE.Mesh(planeBufferGeometry, planeMaterial);
    // fixed a flip vertical direction problem
    plane.scale.x = -1;
    plane.rotation.z = THREE.Math.degToRad(180);

    sceneRTT.add(plane);
}

function addToScene(_model) {
    seletedModel = _model;
    scene.add(_model);
}

function animate() {
    requestId = canvas.requestAnimationFrame(animate);

    if (lon !== last_lon ||
        lat !== last_lat) {

        last_lon = lon;
        last_lat = lat;

        deviceOrientationControl.modelRotationControl(seletedModel, lon, lat, gradient, THREE);
    }

    if (last_device.alpha !== device.alpha ||
        last_device.beta !== device.beta ||
        last_device.gamma !== device.gamma) {

        last_device.alpha = device.alpha;
        last_device.beta = device.beta;
        last_device.gamma = device.gamma;

        if (isDeviceMotion) {
            deviceOrientationControl.deviceControl(camera, device, THREE, isAndroid);
        }
    }

    if (!isAndroid) {
        // render for Orthographic Camera
        if (cameraFrame) {
            planeTexture.image = cameraFrame;
            planeTexture.needsUpdate = true;
            renderer.render(sceneRTT, cameraRTT);
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

function startDeviceMotion(_isAndroid) {
    isDeviceMotion = true;
    isAndroid = _isAndroid;
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

function setCameraFrame(_cameraFrame) {
    cameraFrame = _cameraFrame;
}

module.exports = {
    initThree,
    initScene,
    addToScene,
    onTouchstart,
    onTouchmove,
    startDeviceMotion,
    stopDeviceMotion,
    stopAnimate,
    setCameraFrame
}
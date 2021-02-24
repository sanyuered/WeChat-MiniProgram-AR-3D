const { createScopedThreejs } = require('threejs-miniprogram');
const deviceOrientationControl = require('../../utils/DeviceOrientationControl.js');
const deviceMotionInterval = 'ui';
var camera, scene, renderer;
var canvas;
var touchX, touchY, device = {};
var lon, lat, gradient;
var THREE;
var requestId, mainModel;
var isDeviceMotion = false;
var last_lon, last_lat, last_device = {};

function initThree(canvasId, imageUrl) {
    wx.createSelectorQuery()
        .select('#' + canvasId)
        .node()
        .exec((res) => {
            canvas = res[0].node;
            THREE = createScopedThreejs(canvas);

            initScene();
            loadPanorama(imageUrl);
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
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff));
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

function loadPanorama(imageUrl) {
    // sphere geometry
    var geometry = new THREE.SphereGeometry(500, 64, 32);
    // back side
    geometry.scale(-1, 1, 1);
    // loading
    wx.showLoading({
        title: 'Loading...',
    });
    var texture1 = new THREE.TextureLoader().load(imageUrl);
    var material1 = new THREE.MeshBasicMaterial({ map: texture1 });
    var model = new THREE.Mesh(geometry, material1);
    // the rotation of the model 
    model.rotation.set(0, THREE.Math.degToRad(-90), 0);
    // add the object to the scene
    mainModel = model;
    scene.add(model);
    wx.hideLoading();
}

function updatePanorama(imageUrl, deg) {
    // loading
    wx.showLoading({
        title: 'Loading...',
    });
    var texture1 = new THREE.TextureLoader().load(imageUrl);
    mainModel.material.map = texture1;
    // the rotation of the model 
    mainModel.rotation.set(0, THREE.Math.degToRad(deg), 0);
    wx.hideLoading();
}

function animate() {
    requestId = canvas.requestAnimationFrame(animate);

    // manual mode
    if (lon !== last_lon ||
        lat !== last_lat) {
        last_lon = lon;
        last_lat = lat;

        deviceOrientationControl.camaraRotationControl(camera, lon, lat, THREE);
        
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

    renderer.render(scene, camera);
}

function stopAnimate() {
    if (canvas && requestId) {
        canvas.cancelAnimationFrame(requestId);
    }
}

function onTouchstart(event) {
    var touch = event.touches[0];
    if (!touch) {
        return;
    }
    touchX = touch.x;
    touchY = touch.y;
}

function onTouchmove(event) {
    var touch = event.touches[0];
    if (!touch) {
        return;
    }
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
    updatePanorama,
}
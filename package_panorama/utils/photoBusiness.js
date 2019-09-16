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
    scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff));
    // init render
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setSize(canvas.width, canvas.height);

    animate();
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

        deviceOrientationControl.camaraRotationControl(camera, lon, lat, THREE);
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

module.exports = {
    initThree,
    initScene,
    addToScene,
    onTouchstart,
    onTouchmove,
    startDeviceMotion,
    stopDeviceMotion,
    stopAnimate,
}
const modelBusiness = require('../../utils/photoBusiness.js')
const canvasId = 'canvas1';
// A panorama image size must be the N power of 2.
const imageUrl = '../../utils/sample.jpg';
var isDeviceMotion = false;
var isAndroid = false;

Page({
  data: {
  },
  onLoad() {
    var _that = this;
    // set cameraStyle of camera by system platform
    const res = wx.getSystemInfoSync();
    console.log(res.system);
    if (res.system.indexOf('Android') !== -1) {
      isAndroid = true;
    }
    modelBusiness.initThree(canvasId,
      function (THREE) {
        modelBusiness.initScene();
        _that.loadPanorama(THREE);
      });
    modelBusiness.startDeviceMotion(isAndroid);
    isDeviceMotion = true;
  },
  onUnload() {
    isDeviceMotion = false;
    modelBusiness.stopAnimate();
    modelBusiness.stopDeviceMotion();
  },
  bindtouchstart_callback(event) {
    modelBusiness.onTouchstart(event);
  },
  bindtouchmove_callback(event) {
    modelBusiness.onTouchmove(event);
  },
  loadPanorama(THREE) {
    var geometry = new THREE.SphereGeometry(64, 64, 64);
    geometry.scale(1, 1, -1);
    wx.showLoading({
      title: 'Loading...',
    });
    var texture1 = new THREE.TextureLoader().load(imageUrl);
    wx.hideLoading();
    var material1 = new THREE.MeshBasicMaterial({ map: texture1 });
    var model = new THREE.Mesh(geometry, material1);
    // according to the model size
    model.rotation.set(0, THREE.Math.degToRad(90), 0);
    modelBusiness.addToScene(model);
  },
  toggleDeviceMotion() {
    if (isDeviceMotion) {
      modelBusiness.stopDeviceMotion();
    } else {
      modelBusiness.startDeviceMotion(isAndroid);
    }
    isDeviceMotion = !isDeviceMotion;
  }
});

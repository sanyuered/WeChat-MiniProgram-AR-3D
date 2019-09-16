const modelBusiness = require('../../utils/cameraBusiness.js')
const { GLTF_Loader } = require('../../../utils/GLTFLoader.js');
const canvasId = 'canvas1';
// set your site url of a gltf model
const modelUrl = 'https://sanyuered.github.io/gltf/robot.glb';
//const modelUrl = 'http://127.0.0.1/robot.glb';
var isDeviceMotion = false;
var isAndroid = false;
// camera listener
var listener = null;

Page({
  data: {
    devicePosition: 'back',
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
        modelBusiness.initScene(false);
        _that.loadModel(THREE);
      });
    modelBusiness.startDeviceMotion(isAndroid);
    isDeviceMotion = true;
    _that.startTacking();
  },
  onUnload() {
    isDeviceMotion = false;
    modelBusiness.stopAnimate();
    modelBusiness.stopDeviceMotion();
    this.stopTacking();
    console.log('onUnload', 'listener is stop');
  },
  bindtouchstart_callback(event) {
    modelBusiness.onTouchstart(event);
  },
  bindtouchmove_callback(event) {
    modelBusiness.onTouchmove(event);
  },
  loadModel(THREE) {
    const GLTFLoader = GLTF_Loader(THREE);
    var loader = new GLTFLoader();
    wx.showLoading({
      title: 'Loading Model...',
    });
    loader.load(modelUrl,
      function (gltf) {
        console.log('loadModel', 'success');
        wx.hideLoading();
        var model = gltf.scene;
        modelBusiness.addToScene(model);
      },
      null,
      function () {
        console.log('loadModel', 'error');
        wx.hideLoading();
        wx.showToast({
          title: 'Loading model failed.',
          icon: 'none',
          duration: 3000,
        });
      });
  },
  toggleDeviceMotion() {
    if (isDeviceMotion) {
      modelBusiness.stopDeviceMotion();
    } else {
      modelBusiness.startDeviceMotion(isAndroid);
    }
    isDeviceMotion = !isDeviceMotion;
  },
  startTacking() {
    var _that = this;
    const context = wx.createCameraContext();

    if (!context.onCameraFrame) {
      var message = 'Does not support the new api "Camera.onCameraFrame".';
      console.log(message);
      wx.showToast({
        title: message,
        icon: 'none'
      });
      return;
    }

    // real-time
    listener = context.onCameraFrame(async function (res) {
      console.log('onCameraFrame:', res.width, res.height);
      const cameraFrame = {
        data: new Uint8Array(res.data),
        width: res.width,
        height: res.height,
      };
      modelBusiness.setCameraFrame(cameraFrame);
    });
    // start
    listener.start();
    console.log('startTacking', 'listener is start');
  },
  stopTacking() {
    if (listener) {
      listener.stop();
    }
  },
  changeDirection() {
    var status = this.data.devicePosition;
    if (status === 'back') {
      status = 'front';
    } else {
      status = 'back';
    }
    this.setData({
      devicePosition: status,
    });
  }
});

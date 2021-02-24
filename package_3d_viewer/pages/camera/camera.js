const cameraBusiness = require('../../utils/cameraBusiness.js')
const canvasId = 'canvas1';
// a gltf model url
const modelUrl = 'https://sanyuered.github.io/gltf/robot.glb';
// localhost url
// const modelUrl = 'http://127.0.0.1/models/robot.glb';
var isDeviceMotion = false;

Page({
  data: {
    devicePosition: 'back',
  },
  onLoad() {
    cameraBusiness.initThree(canvasId, modelUrl);
  },
  onUnload() {
    cameraBusiness.stopAnimate();
    cameraBusiness.stopDeviceMotion();
  },
  onError_callback(){
    wx.showToast({
      title: 'The camera does not open.',
    });
  },
  bindtouchstart_callback(event) {
    cameraBusiness.onTouchstart(event);
  },
  bindtouchmove_callback(event) {
    cameraBusiness.onTouchmove(event);
  },
  toggleDeviceMotion() {
    if (isDeviceMotion) {
      cameraBusiness.stopDeviceMotion();
    } else {
      cameraBusiness.startDeviceMotion();
    }
    isDeviceMotion = !isDeviceMotion;
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
  },
  scanQRCode(){
    wx.scanCode({
      success (res) {
        console.log('scanCode',res);
        // the url of panorama image
        var modelUrl = res.result;
        cameraBusiness.updateModel(modelUrl);
      }
    });
  }
});

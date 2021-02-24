const photoBusiness = require('../../utils/photoBusiness.js')
// canvas id
const canvasId = 'canvas1';
// A panorama image size should be 2048 x 1024.
const imageUrl = '../../utils/sample.jpg';
// if device motion
var isDeviceMotion = false;

Page({
  data: {
  },
  onLoad() {
    // entry
    photoBusiness.initThree(canvasId,imageUrl);
  },
  onUnload() {
    photoBusiness.stopAnimate();
    photoBusiness.stopDeviceMotion();
  },
  bindtouchstart_callback(event) {
    photoBusiness.onTouchstart(event);
  },
  bindtouchmove_callback(event) {
    photoBusiness.onTouchmove(event);
  },

  toggleDeviceMotion() {
    if (isDeviceMotion) {
      photoBusiness.stopDeviceMotion();
    } else {
      photoBusiness.startDeviceMotion();
    }
    isDeviceMotion = !isDeviceMotion;
  },
  scanQRCode(){
    wx.scanCode({
      success (res) {
        console.log('scanCode',res);
        // the url of panorama image
        var imageUrl = res.result;
        // the rotation of Y
        var deg = -90;
        photoBusiness.updatePanorama(imageUrl,deg);
      }
    });
  }
});

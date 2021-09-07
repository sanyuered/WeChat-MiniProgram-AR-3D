const photoBusiness = require('../../utils/photoBusiness.js')
// canvas id
const canvasId = 'canvas1';
// A panorama image size should be 2048 x 1024.
const imageUrl = '../../utils/sample.jpg';
// if device motion
var isDeviceMotion = false;
var isIOS = false;

Page({
  data: {
  },
  onLoad() {
    const system = wx.getSystemInfoSync().system;
    // if iOS
    if (system.indexOf('iOS') !== -1) {
      isIOS = true;
    }
    setTimeout(function () {
      photoBusiness.initThree(canvasId, imageUrl, isIOS);
    }, 150);
  },
  onUnload() {
    photoBusiness.stopAnimate();
    photoBusiness.stopDeviceMotion();
  },
  bindtouchstart_callback(event) {
    // stop the Device Motion
    if (isDeviceMotion) {
      photoBusiness.stopDeviceMotion();
    }

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
  scanQRCode() {
    wx.scanCode({
      success(res) {
        console.log('scanCode', res);
        // the url of panorama image
        var imageUrl = res.result;
        // the rotation of Y
        var deg = -90;
        photoBusiness.updatePanorama(imageUrl, deg);
      }
    });
  }
});

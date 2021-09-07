const imageBusiness = require('../../utils/imageBusiness.js')

Page({
    data: {
        devicePosition: 'back',
        notice: '',
        patternImageUrl: null,
        videoUrl: null,
        videoTransform: '',
        isButtonDisabled: false,
        isVideoVisible: false,
        animationData: null,
        // 东方明珠
        latitude: 31.239853,
        longitude: 121.499740,
        // 100m
        scale: 15,
        markers: [],
        inputAddressValue:"",
        formatted_address:"",
    },
    onReady() {
    },
    onLoad() {
        var _that = this;
        const ossUrl = "https://m.sanyue.red/wechat";
        this.setData({
            videoUrl: ossUrl + '/imgs/5_mask.png',
        });
        imageBusiness.startCompass(function (direction) {
            var transform = 'transform:rotateZ(' + -direction + 'deg)';
            _that.setData({
                videoTransform: transform,
            });
        });
    },
    onUnload: function () {
        imageBusiness.stopCompass();
    },
    inputAddress_confirm: function (e) {
        var _that = this;
        var inputValue = e.detail.value;
        if (!inputValue || inputValue.length < 5) {
          wx.showToast({
            title: '请输入5个以上汉字。',
            icon: 'none',
            duration: 1500,
          });
          return;
        }
        imageBusiness.loadAddress(inputValue, function (markers,
          formatted_address,
          latitude,
          longitude) {
          _that.setData({
            markers: markers,
            latitude: latitude,
            longitude: longitude,
            // 手工输入地址时，不替换为长地址。
            // inputAddressValue:formatted_address,
            formatted_address:formatted_address,
          });
        });
    
      },
      miniMap_tap(e) {
        var _that = this;
         // e.detail.latitude + "," + e.detail.longitude,
        console.log("miniMap_tap", e.detail);
        imageBusiness.loadMarker(
          e.detail.latitude,
          e.detail.longitude,
          function (markers,
            formatted_address,
            latitude,
            longitude) {
            _that.setData({
              markers: markers,
              latitude: latitude,
              longitude: longitude,
              inputAddressValue:formatted_address,
              formatted_address:formatted_address,
            });
          });
      },
    showPermission() {
        wx.showModal({
            title: '请打开摄像头权限',
            content: '用于检测摄像头画面中的照片。点击"确定"去设置。点击"取消"返回。',
            success(res) {
                if (res.confirm) {
                    wx.openSetting({
                        success(res) {
                            console.log('showPermission', res.authSetting);
                        }
                    });
                } else if (res.cancel) {
                    wx.navigateBack();
                }
            }
        });
    },
    camera_error(e) {
        console.log('camera_error', e.detail);
        this.showPermission();
    }
});

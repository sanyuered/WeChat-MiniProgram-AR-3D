/* eslint-disable semi */
var lastRotation = 0;

function startCompass(callback) {

    wx.onCompassChange(function (device) {
        // console.log('onCompassChange', device.direction)
        // device.direction为角度
        const direction = device.direction;
        const diff = Math.abs(lastRotation - direction);
        // 如果旋转了15度
        if (diff > 15) {
            lastRotation = direction;
            if (callback) {
                callback(direction);
            }
        }

    });
    wx.startCompass({
        success: function () {
            console.log('startCompass', 'success');
        },
        fail: function (error) {
            console.log('startCompass', error);
        }
    });
}

function stopCompass() {
    wx.offCompassChange();
    wx.stopCompass({
        success: function () {
            console.log('stopCompass', 'success');
        },
        fail: function (error) {
            console.log('stopCompass', error);
        }
    });
}

// 根据地址获取经纬度
function loadAddress(address, callback) {
    console.log('loadAddress', address)
    // 地图服务商的地址
    // const dataUrl = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${你的地图key}`;
    // 临时的个人地址（近期可用）
    const dataUrl = `https://www.sanyue.red/amap_geo?address=${encodeURIComponent(address)}`;
    wx.request({
        url: dataUrl,
        success: function (result) {
            console.log('loadAddress', result);
            if (result.statusCode === 200) {
                if (result.data.status === "1") {
                    const items = result.data;
                    const geocode = items.geocodes[0];
                    if (!geocode) {
                        wx.showToast({
                            title: '根据输入地址，找不到结果。',
                            icon: 'none',
                            duration: 1500,
                        });
                        return
                    }

                    const geo = geocode.location.split(",");
                    const longitude = geo[0];
                    const latitude = geo[1];
                    loadMarker(latitude, longitude, callback)

                } else {
                    // http错误
                    console.log(result.data);
                }
            }
        },
        fail: function (error) {
            //_that.tipsFlag = "抱歉，无法连接服务器。";
            //  _that.tipsFlag = error.errMsg;
            console.log(error.errMsg);
        },
        complete: function () {
            // 通知数据更新
            // _that.$apply();

        }
    });

}

// 根据经纬度获取地址和周围建筑
// 输入参数:latitude纬度、longitude经度
function loadMarker(latitude, longitude, callback) {
    console.log('loadMarker', latitude, longitude)
    // 地图服务商的地址
    // const dataUrl = `https://restapi.amap.com/v3/geocode/regeo?location=${longitude},${latitude}&key=${你的地图key}&extensions=all&poitype=${encodeURIComponent("药房")}`;
    // 临时的个人地址（近期可用）
    const dataUrl = `https://www.sanyue.red/amap_regeo?location=${longitude},${latitude}&poitype=${encodeURIComponent("药房")}`;
    wx.request({
        url: dataUrl,
        success: function (result) {
            console.log('loadMarker', result);
            if (result.statusCode === 200) {
                if (result.data.status === "1") {
                    const items = result.data;
                    const aoiArray = items.regeocode.aois;
                    var markers = [];

                    aoiArray.forEach(function (item) {
                        const geo = item.location.split(",");
                        const longitude = geo[0];
                        const latitude = geo[1];
                        markers.push({
                            id: item.id,
                            latitude: latitude,
                            longitude: longitude,
                            title: item.name,
                        })
                    });
                    const formattedAddress = items.regeocode.formatted_address;
                    if (callback) {
                        callback(markers, 
                            formattedAddress,
                            latitude, 
                            longitude)
                    }

                } else {
                    // http错误
                    console.log(result.data);
                }
            }
        },
        fail: function (error) {
            //_that.tipsFlag = "抱歉，无法连接服务器。";
            //  _that.tipsFlag = error.errMsg;
            console.log(error.errMsg);
        },
        complete: function () {
            // 通知数据更新
            // _that.$apply();
        }
    });

}

export {
    startCompass,
    stopCompass,
    loadMarker,
    loadAddress,
}
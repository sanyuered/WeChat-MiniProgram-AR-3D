const alphaOffset = 0;
// 90:landscape, 0: portrait
const screenOrientation = 0;
var phi = 0, theta = 0;

// for package_3d_viewer
function modelRotationControl(model, lon, lat, gradient, THREE) {
    if (!model) {
        return;
    }

    // round y-axis
    if (gradient > 1) {
        model.rotation.y = lon * 0.01;
    }
    // round x-axis
    else {
        model.rotation.x = lat * 0.01;
    }
}

// for package_panorama
function camaraRotationControl(camera, lon, lat, THREE) {
    if (!camera) {
        return;
    }
    // calculate angle
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.Math.degToRad(90 - lat);
    theta = THREE.Math.degToRad(lon);
    var target = new THREE.Vector3();
    target.x = Math.sin(phi) * Math.cos(theta);
    target.y = Math.cos(phi);
    target.z = Math.sin(phi) * Math.sin(theta);

    // set rotation of model 
    camera.lookAt(target);
}

// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
function setObjectQuaternion(THREE) {
    var zee = new THREE.Vector3(0, 0, 1);
    var euler = new THREE.Euler();
    var q0 = new THREE.Quaternion();
    var q1 = new THREE.Quaternion(- Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

    return function (quaternion, alpha, beta, gamma, orient) {
        euler.set(beta, alpha, -gamma, 'YXZ'); // 'ZXY' for the device, but 'YXZ' for us
        quaternion.setFromEuler(euler); // orient the device
        quaternion.multiply(q1); // camera looks out the back of the device, not the top
        quaternion.multiply(q0.setFromAxisAngle(zee, - orient)); // adjust for screen orientation
    };
};

function deviceControl(model, device, THREE, isAndroid) {
    if (!model || !device) {
        return;
    }

    var alpha = device.alpha ? THREE.Math.degToRad(device.alpha) + alphaOffset : 0; // Z
    var beta = device.beta ? THREE.Math.degToRad(device.beta) : 0; // X
    var gamma = device.gamma ? THREE.Math.degToRad(device.gamma) : 0; // Y
    var orient = screenOrientation ? THREE.Math.degToRad(screenOrientation) : 0; // O

    if (isAndroid) {
        beta = -beta;
        alpha = -alpha;
        gamma = -gamma;
    }

    setObjectQuaternion(THREE)(model.quaternion, alpha, beta, gamma, orient);
}

module.exports = { deviceControl, camaraRotationControl, modelRotationControl };
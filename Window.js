//położenie kamery
let factor_x = 0;
let factor_y = 0;
let factor_z = 0;
//kąt w radianach
let axis_x = 0;
let axis_y = 0;
let axis_z = 0;
//odgległość kamery od ekranu
let zoom = 1;
let focalDistance = 25;
let cameraHigh;
let cameraWidth;

window.onload = () => {
    document.getElementById('myCanvas').addEventListener("keydown", handleChangeCameraParamClick);
    document.getElementById('myCanvas').addEventListener('wheel', updateZoomAndFocal);
    document.getElementById('myCanvas').addEventListener('mousemove', updateAngels);
};

document.onreadystatechange = () => {
    document.getElementById("camera-param-x").innerText = "" + factor_x;
    document.getElementById("camera-param-y").innerText = "" + factor_y;
    document.getElementById("camera-param-z").innerText = "" + factor_z;
    document.getElementById("camera-param-axis-x").innerText = "" + axis_x;
    document.getElementById("camera-param-axis-y").innerText = "" + axis_y;
    document.getElementById("camera-param-axis-z").innerText = "" + axis_z;
    document.getElementById("camera-param-zoom").innerText = "" + zoom;
    document.getElementById("camera-param-focal").innerText = "" + focalDistance;
    updateCanvasSize();
    renderCameraWindow();
};

window.onresize = () => {
    updateCanvasSize();
    renderCameraWindow(OPERATION.MAP);
};

setNewCameraParam = (value, discriminator) => {
    let operation;
    switch (discriminator) {
        case 'x':
            factor_x = value * 1;
            document.getElementById("camera-param-x").innerText = "" + factor_x;
            operation = OPERATION.SWIPE;
            break;
        case 'y':
            factor_y = value * 1;
            document.getElementById("camera-param-y").innerText = "" + factor_y;
            operation = OPERATION.SWIPE;
            break;
        case 'z':
            factor_z = value * 1;
            document.getElementById("camera-param-z").innerText = "" + factor_z;
            operation = OPERATION.SWIPE;
            break;
        case 'axis-x':
            axis_x = (value * 1) % 91;
            document.getElementById("camera-param-axis-x").innerText = "" + axis_x;
            operation = OPERATION.SPUN;
            break;
        case 'axis-y':
            axis_y = (value * 1) % 360;
            document.getElementById("camera-param-axis-y").innerText = "" + axis_y;
            operation = OPERATION.SPUN;
            break;
        case 'axis-z':
            axis_z = (value * 1) % 360;
            document.getElementById("camera-param-axis-z").innerText = "" + axis_z;
            operation = OPERATION.SPUN;
            break;
        case 'zoom':
            zoom = value * 1;
            document.getElementById("camera-param-zoom").innerText = "" + zoom;
            operation = OPERATION.MAP;
            break;
        case 'focal':
            focalDistance = value * 1;
            document.getElementById("camera-param-focal").innerText = "" + focalDistance;
            operation = OPERATION.MAP;
            break;
    }
    renderCameraWindow(operation);
};

handleChangeCameraParamClick = (e) => {
    switch (e.key) {
        case 'd':
            moveLeftAndRight(1);
            break;
        case 'a':
            moveLeftAndRight(-1);
            break;
        case 'w':
            moveForwardAndBack(1);
            break;
        case 's':
            moveForwardAndBack(-1);
            break;
    }
    document.getElementById("camera-param-x").innerText = "" + factor_x;
    document.getElementById("camera-param-y").innerText = "" + factor_y;
    document.getElementById("camera-param-z").innerText = "" + factor_z;
    renderCameraWindow();
};

updateCanvasSize = () => {
    let canvas = document.getElementById("myCanvas");
    cameraWidth = canvas.width = canvas.clientWidth - 2 * canvas.style.borderWidth;
    cameraHigh = canvas.height = canvas.clientHeight - 2 * canvas.style.borderWidth;
};
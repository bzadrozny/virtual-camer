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
    renderCameraWindow('map');
};

setNewCameraParam = (value, discriminator) => {
    let operation = 'swipe';
    switch (discriminator) {
        case 'x':
            factor_x = value * 1;
            document.getElementById("camera-param-x").innerText = "" + factor_x;
            break;
        case 'y':
            factor_y = value * 1;
            document.getElementById("camera-param-y").innerText = "" + factor_y;
            break;
        case 'z':
            factor_z = value * 1;
            document.getElementById("camera-param-z").innerText = "" + factor_z;
            break;
        case 'axis-x':
            axis_x = (value * 1) % 91;
            document.getElementById("camera-param-axis-x").innerText = "" + axis_x;
            operation = 'spun';
            break;
        case 'axis-y':
            axis_y = (value * 1) % 360;
            document.getElementById("camera-param-axis-y").innerText = "" + axis_y;
            operation = 'spun';
            break;
        case 'axis-z':
            axis_z = (value * 1) % 360;
            document.getElementById("camera-param-axis-z").innerText = "" + axis_z;
            operation = 'spun';
            break;
        case 'zoom':
            zoom = value * 1;
            document.getElementById("camera-param-zoom").innerText = "" + zoom;
            operation = 'map';
            break;
        case 'focal':
            focalDistance = value * 1;
            document.getElementById("camera-param-focal").innerText = "" + focalDistance;
            operation = 'map';
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


renderCameraWindow = (beginningOperation = 'swipe') => {
    if (beginningOperation === "swipe") {
        swipePoints();
        spunPoints();
        mapPoints();
    } else if (beginningOperation === "spun") {
        spunPoints();
        mapPoints();
    } else if (beginningOperation === "map") {
        mapPoints();
    }
    printScreen();
};

printScreen = () => {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cameraWidth, cameraHigh);
    mappedPoints_2d.sort((p1, p2) => p1.d < p2.d ? 1 : p1.d === p2.d ? 0 : -1);
    mappedPoints_2d.forEach(p => {
        let {x, y, z, d, c} = p;
        if (z < 0) return;
        ctx.beginPath();
        ctx.arc(
            x + cameraWidth / 2,
            cameraHigh / 2 - y,
            d < 100 ? 2 : d < 300 ? d / 50 : 6,
            0, 2 * Math.PI, true
        );
        ctx.fillStyle = getColorFromDistance(d, c);
        ctx.filter = `blur(${d < 1000 ? d / 125 : 8}px)`;
        ctx.fill();
    });
};

getColorFromDistance = (distance, color) => {
    let opacity = distance === 0 ?
        1 : distance > 1000 ?
            0.125 : 125 / distance;
    color = color === undefined ? 0 : color;
    return `rgba(${color},${color},${color},${opacity})`;
};
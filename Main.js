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
    renderCameraWindow();
};

setNewCameraParam = (value, discriminator) => {
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
            break;
        case 'axis-y':
            axis_y = (value * 1) % 360;
            document.getElementById("camera-param-axis-y").innerText = "" + axis_y;
            break;
        case 'axis-z':
            axis_z = (value * 1) % 360;
            document.getElementById("camera-param-axis-z").innerText = "" + axis_z;
            break;
        case 'zoom':
            zoom = value * 1;
            document.getElementById("camera-param-zoom").innerText = "" + zoom;
            break;
        case 'focal':
            focalDistance = value * 1;
            document.getElementById("camera-param-focal").innerText = "" + focalDistance;
            break;
    }
    renderCameraWindow();
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

updateZoomAndFocal = (e) => {
    if (e.shiftKey && !e.altKey) {
        let oldZoom = zoom;
        zoom = Math.abs(zoom -= e.deltaY / 100);
        document.getElementById("camera-param-zoom").innerText = "" + zoom;
        let conversion = zoom / oldZoom;
        mappedPoints2d = mappedPoints2d.map(point => {
            let {x, y} = point;
            if (focalDistance !== 0) {
                point.x = x * conversion;
                point.y = y * conversion;
            }
            return point;
        });
        printScreen();
    } else if (e.shiftKey && e.altKey) {
        let oldFocal = focalDistance;
        focalDistance = Math.abs(focalDistance -= e.deltaY / 100);
        document.getElementById("camera-param-focal").innerText = "" + focalDistance;
        mappedPoints2d = mappedPoints2d.map(point => {
            let {x, y, z} = point;
            if (focalDistance !== 0) {
                let conversion = ((z + oldFocal) / oldFocal) * (focalDistance / (z + focalDistance));
                point.x = x * conversion;
                point.y = y * conversion;
            }
            return point;
        });
        printScreen();
    }
};

updateAngels = (e) => {
    if (e.buttons !== 1) return;
    let angle_z = axis_z * Math.PI / 180;
    let sin_z = Math.sin(angle_z);
    let cos_z = Math.cos(angle_z);
    axis_x += (e.movementY * cos_z + e.movementX * sin_z) / 4;
    axis_y += (e.movementX * cos_z + e.movementY * sin_z) / 4;
    console.log('0: ' + axis_x);
    if (axis_x < -90) {
        console.log('1: ' + axis_x);
        axis_z = (axis_z + 180);
        axis_x = -180 - axis_x;
    } else if (axis_x > 90) {
        console.log('2: ' + axis_x);
        axis_z = (axis_z + 180);
        axis_x = 180 - axis_x;
    }
    axis_x = axis_x % 360;
    axis_y = axis_y % 360;
    axis_z = axis_z % 360;
    document.getElementById("camera-param-axis-x").innerText = "" + axis_x;
    document.getElementById("camera-param-axis-y").innerText = "" + axis_y;
    document.getElementById("camera-param-axis-z").innerText = "" + axis_z;
    renderCameraWindow();
};

moveForwardAndBack = (d) => {
    let move_z;
    let move_x;
    let move_y;
    if (axis_y % 90) {
        let sign = (-270 < axis_y && axis_y < -90) || (90 < axis_y && axis_y < 270) ? -1 : 1;
        let tan_y = Math.tan(axis_y * Math.PI / 180);
        let tan_x = Math.tan(axis_x * Math.PI / 180);
        move_z = sign * d / Math.sqrt((tan_y * tan_y) + (tan_x * tan_x) + 1);
        move_x = move_z * tan_y;
        move_y = move_z * tan_x;
    } else if (axis_y % 180) {
        let sign_x = axis_y === -90 || axis_y === 270 ? -1 : 1;
        let angel_x = axis_x * Math.PI / 180;
        move_x = sign_x * d * Math.cos(angel_x);
        move_y = d * Math.sin(angel_x);
        move_z = 0;
    } else {
        let sign_z = axis_y === 180 || axis_y === -180 ? -1 : 1;
        let angel_x = axis_x * Math.PI / 180;
        move_x = 0;
        move_y = d * Math.sin(angel_x);
        move_z = sign_z * d * Math.cos(angel_x);
    }
    factor_z = parseFloat((factor_z + move_z).toFixed(3));
    factor_x = parseFloat((factor_x + move_x).toFixed(3));
    factor_y = parseFloat((factor_y - move_y).toFixed(3));
};

moveLeftAndRight = (d) => {
    let move_z;
    let move_x;
    let move_y;
    if (axis_y % 90) {
        let sign = (-270 < axis_y && axis_y < -90) || (90 < axis_y && axis_y < 270) ? -1 : 1;
        let tan_y = Math.tan(axis_y / 180 * Math.PI);
        let tan_x = Math.tan(axis_x / 180 * Math.PI);
        move_x = sign * d / Math.sqrt((tan_y * tan_y) + (tan_x * tan_x) + 1);
        move_z = -move_x * tan_y;
        move_y = -move_x * tan_x;
    } else if (axis_y % 180) {
        let sign_x = axis_y === -90 || axis_y === 270 ? 1 : -1;
        let angel_x = axis_x * Math.PI / 180;
        move_x = 0;
        move_y = -d * Math.sin(angel_x);
        move_z = sign_x * d * Math.cos(angel_x);
    } else {
        let sign_z = axis_y === 180 || axis_y === -180 ? -1 : 1;
        let angel_x = axis_x * Math.PI / 180;
        move_x = sign_z * d * Math.cos(angel_x);
        move_y = -d * Math.sin(angel_x);
        move_z = 0;
    }
    factor_z = parseFloat((factor_z + move_z).toFixed(3));
    factor_x = parseFloat((factor_x + move_x).toFixed(3));
    factor_y = parseFloat((factor_y + move_y).toFixed(3));
};

renderCameraWindow = () => {
    let swipedPoints3d = points_3d.map(point => {
        let {x, y, z} = point;
        return {x: x - factor_x, y: y - factor_y, z: z - factor_z};
    });
    let angle_x = axis_x * Math.PI / 180;
    let angle_y = axis_y * Math.PI / 180;
    let angle_z = axis_z * Math.PI / 180;
    let sin_x = Math.sin(angle_x);
    let cos_x = Math.cos(angle_x);
    let sin_y = Math.sin(angle_y);
    let cos_y = Math.cos(angle_y);
    let sin_z = Math.sin(angle_z);
    let cos_z = Math.cos(angle_z);
    let spunPoints3d = swipedPoints3d.map(point => {
        let {x, y, z} = point;
        let spinx_z = z * cos_x - y * sin_x;
        let spinx_y = z * sin_x + y * cos_x;
        z = spinx_z;
        y = spinx_y;
        spinx_z = z * cos_y + x * sin_y;
        x = (-z) * sin_y + x * cos_y;
        spinx_y = y * cos_z - x * sin_z;
        let spinx_x = y * sin_z + x * cos_z;
        return {x: spinx_x, y: spinx_y, z: spinx_z};
    });
    mappedPoints2d = spunPoints3d.map(point => {
        let {x, y, z} = point;
        if (focalDistance !== 0) {
            x = x * zoom * focalDistance / (z + focalDistance);
            y = y * zoom * focalDistance / (z + focalDistance);
        }
        return {x, y, z, d: Math.sqrt(x * x + y * y + z * z)};
    });
    printScreen();
};

printScreen = () => {
    let canvas = document.getElementById("myCanvas");
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, cameraWidth, cameraHigh);
    mappedPoints2d.sort((p1, p2) => p1.d < p2.d ? 1 : p1.d === p2.d ? 0 : -1);
    mappedPoints2d.forEach(p => {
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
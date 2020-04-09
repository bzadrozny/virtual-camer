updateZoomAndFocal = (e) => {
    if (e.shiftKey && !e.altKey) {
        let oldZoom = zoom;
        zoom = Math.abs(zoom -= e.deltaY / 100);
        document.getElementById("camera-param-zoom").innerText = "" + zoom;
        let conversion = zoom / oldZoom;
        mappedPoints_2d = mappedPoints_2d.map(point => {
            let {x, y} = point;
            if (focalDistance !== 0) {
                point.x = x * conversion;
                point.y = y * conversion;
            }
            return point;
        });
        printObjects();
    } else if (e.shiftKey && e.altKey) {
        let oldFocal = focalDistance;
        focalDistance = Math.abs(focalDistance -= e.deltaY / 100);
        document.getElementById("camera-param-focal").innerText = "" + focalDistance;
        mappedPoints_2d = mappedPoints_2d.map(point => {
            let {x, y, z} = point;
            if (focalDistance !== 0) {
                let conversion = ((z + oldFocal) / oldFocal) * (focalDistance / (z + focalDistance));
                point.x = x * conversion;
                point.y = y * conversion;
            }
            return point;
        });
        printObjects();
    }
};

updateAngels = (e) => {
    if (e.buttons !== 1) return;
    let angle_z = axis_z * Math.PI / 180;
    let sin_z = Math.sin(angle_z);
    let cos_z = Math.cos(angle_z);
    axis_x += (e.movementY * cos_z + e.movementX * sin_z) / 4;
    axis_y += (e.movementX * cos_z + e.movementY * sin_z) / 4;
    if (axis_x < -90) {
        axis_z = (axis_z + 180);
        axis_x = -180 - axis_x;
    } else if (axis_x > 90) {
        axis_z = (axis_z + 180);
        axis_x = 180 - axis_x;
    }
    axis_x = axis_x % 360;
    axis_y = axis_y % 360;
    axis_z = axis_z % 360;
    document.getElementById("camera-param-axis-x").innerText = "" + axis_x;
    document.getElementById("camera-param-axis-y").innerText = "" + axis_y;
    document.getElementById("camera-param-axis-z").innerText = "" + axis_z;
    renderCameraWindow(OPERATION.SPUN);
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
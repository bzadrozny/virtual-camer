let points_3d = [

    //top_left_line
    {
        type: OBJECT_TYPE.LINE,
        points: [
            {type: OBJECT_TYPE.POINT, x: -50.0, y: 200.0, z: 50.0, c: {r: 20, g: 70, b: 220}},
            {type: OBJECT_TYPE.POINT, x: -150.0, y: 200.0, z: 50.0, c: {r: 180, g: 120, b: 120}},
            {type: OBJECT_TYPE.POINT, x: -150.0, y: 300.0, z: 50.0, c: {r: 20, g: 70, b: 220}},
            {type: OBJECT_TYPE.POINT, x: -50.0, y: 300.0, z: 50.0, c: {r: 180, g: 120, b: 120}},
            {type: OBJECT_TYPE.POINT, x: -50.0, y: 200.0, z: 50.0, c: {r: 20, g: 70, b: 220}},
        ]
    },

    //top_right_figure
    {
        type: OBJECT_TYPE.FIGURE,
        c: {r: 100, g: 210, b: 195},
        points: [
            {type: OBJECT_TYPE.POINT, x: 50.0, y: 200.0, z: 50.0, c: {r: 20, g: 70, b: 220}},
            {type: OBJECT_TYPE.POINT, x: 150.0, y: 200.0, z: 50.0, c: {r: 180, g: 120, b: 120}},
            {type: OBJECT_TYPE.POINT, x: 150.0, y: 300.0, z: 50.0, c: {r: 20, g: 70, b: 220}},
            {type: OBJECT_TYPE.POINT, x: 50.0, y: 300.0, z: 50.0, c: {r: 180, g: 120, b: 120}},
        ]
    },
];

let swipedPoints_3d = [];

let spunPoints_3d = [];

let mappedPoints_2d = [];

function swipePoints() {
    swipedPoints_3d = swipe(points_3d);
}

function swipe(points) {
    return points.map(point => {
        if (point.type === OBJECT_TYPE.POINT) {
            let {x, y, z, ...params} = point;
            return {x: x - factor_x, y: y - factor_y, z: z - factor_z, ...params};
        } else {
            let {points, ...params} = point;
            return {points: swipe(points), ...params};
        }
    });
}

function spinPoints() {
    angle_x = axis_x * Math.PI / 180;
    angle_y = axis_y * Math.PI / 180;
    angle_z = axis_z * Math.PI / 180;
    sin_x = Math.sin(angle_x);
    cos_x = Math.cos(angle_x);
    sin_y = Math.sin(angle_y);
    cos_y = Math.cos(angle_y);
    sin_z = Math.sin(angle_z);
    cos_z = Math.cos(angle_z);
    spunPoints_3d = spin(swipedPoints_3d);
}

let angle_x, angle_y, angle_z, sin_x, cos_x, sin_y, cos_y, sin_z, cos_z;

function spin(points) {
    let spinx_x, spinx_y, spinx_z;
    return points.map(point => {
        if (point.type === OBJECT_TYPE.POINT) {
            let {x, y, z, ...params} = point;
            spinx_z = z * cos_x - y * sin_x;
            spinx_y = z * sin_x + y * cos_x;
            z = spinx_z;
            y = spinx_y;
            spinx_z = z * cos_y + x * sin_y;
            spinx_x = (-z) * sin_y + x * cos_y;
            x = spinx_x;
            spinx_y = y * cos_z - x * sin_z;
            spinx_x = y * sin_z + x * cos_z;
            return {x: spinx_x, y: spinx_y, z: spinx_z, ...params};
        } else {
            let {points, ...params} = point;
            return {points: spin(points), ...params};
        }
    });
}

function resizePoints() {
    zoomTimesFocal = zoom * focalDistance;
    mappedPoints_2d = resize(spunPoints_3d);
}

let zoomTimesFocal;

function resize(points) {
    return points.map(point => {
        if (point.type === OBJECT_TYPE.POINT) {
            let {x, y, z, ...params} = point;
            let fullDistance = z + focalDistance;
            if (fullDistance !== 0) {
                x = x * zoomTimesFocal / fullDistance;
                y = y * zoomTimesFocal / fullDistance;
            } else {
                x = x * zoomTimesFocal;
                y = y * zoomTimesFocal;
            }
            let d = Math.sqrt((x * x + y * y) + z * z);
            return {x, y, z, d, ...params};
        } else {
            let {points, ...params} = point;
            let resized = resize(points);
            let d = Math.sqrt(resized.reduce((a, v) => a + v.d, 0));
            return {points: resized, d: d, ...params};
        }
    });
}

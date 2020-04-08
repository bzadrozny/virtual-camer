//punkty mapowane przez kamerę
let points_3d = [
    {x: 0.0, y: 0.0, z: 0.0},
    {x: 0.0, y: 10.0, z: 100.0},
    {x: 100.0, y: 10.0, z: 100.0},
    {x: 200.0, y: 10.0, z: 100.0},
    {x: 300.0, y: 10.0, z: 100.0},
    {x: 400.0, y: 10.0, z: 100.0},
    {x: 500.0, y: 10.0, z: 100.0},
    {x: 600.0, y: 10.0, z: 100.0},
    {x: 700.0, y: 10.0, z: 100.0},
    {x: 800.0, y: 10.0, z: 100.0},
    {x: 900.0, y: 10.0, z: 100.0},
    {x: 1000.0, y: 10.0, z: 100.0},
    {x: -100.0, y: 10.0, z: 100.0},
    {x: -200.0, y: 10.0, z: 100.0},
    {x: -300.0, y: 10.0, z: 100.0},
    {x: -400.0, y: 10.0, z: 100.0},
    {x: -500.0, y: 10.0, z: 100.0},
    {x: -600.0, y: 10.0, z: 100.0},
    {x: -700.0, y: 10.0, z: 100.0},
    {x: -800.0, y: 10.0, z: 100.0},
    {x: -900.0, y: 10.0, z: 100.0},
    {x: -1000.0, y: 10.0, z: 100.0},
];

let swipedPoints_3d = [];

let spunPoints_3d = [];

let mappedPoints_2d = [];

function swipePoints() {
    swipedPoints_3d = points_3d.map(point => {
        let {x, y, z} = point;
        return {x: x - factor_x, y: y - factor_y, z: z - factor_z};
    });
}
function spunPoints() {
    let angle_x = axis_x * Math.PI / 180;
    let angle_y = axis_y * Math.PI / 180;
    let angle_z = axis_z * Math.PI / 180;
    let sin_x = Math.sin(angle_x);
    let cos_x = Math.cos(angle_x);
    let sin_y = Math.sin(angle_y);
    let cos_y = Math.cos(angle_y);
    let sin_z = Math.sin(angle_z);
    let cos_z = Math.cos(angle_z);
    spunPoints_3d = swipedPoints_3d.map(point => {
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
}

function mapPoints() {
    let zoomTimesFocal = zoom * focalDistance;
    mappedPoints_2d = spunPoints_3d.map(point => {
        let {x, y, z} = point;
        if (focalDistance !== 0) {
            x = x * zoomTimesFocal / (z + focalDistance);
            y = y * zoomTimesFocal / (z + focalDistance);
        }
        return {x, y, z, d: Math.sqrt(x * x + y * y + z * z)};
    });
}

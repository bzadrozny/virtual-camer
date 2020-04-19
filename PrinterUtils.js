getPointColor = (distance, color) => {
    let opacity = distance === 0 ?
        1 : distance > 1000 ?
            0.125 : 1 - distance / 8000;
    color = color === undefined ?
        {r: 0, g: 0, b: 0} : color;
    return `rgba(${color.r},${color.g},${color.b},${opacity})`;
};

getPointBlur = (distance) => {
    let blur = distance < 150 ?
        0 : distance < 1150 ?
            (distance - 150) / 125 : 8;
    return `blur(${blur}px)`;
};

getLinearGradient = (x1, y1, d1, c1, x2, y2, d2, c2) => {
    let gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0.0, getPointColor(d1, c1));
    gradient.addColorStop(1.0, getPointColor(d2, c2));
    return gradient;
};

cutLineByScreen = (point_1, point_2) => {
    let {x: x1, y: y1, z: z1, d: d1, c: c1} = point_1.z > point_2.z ? point_1 : point_2;
    let {x: x2, y: y2, z: z2, d: d2, c: c2} = point_1.z > point_2.z ? point_2 : point_1;
    if (z2 < 0) {
        let factor = z1 / (z1 - z2);
        let delta_x = factor * Math.abs(x1 - x2);
        let delta_y = factor * Math.abs(y1 - y2);
        if (Math.abs(z2) > focalDistance) {
            x2 = x2 > x1 ? x1 - delta_x : x1 + delta_x;
            y2 = y2 > y1 ? y1 - delta_y : y1 + delta_y;
        } else {
            x2 = x2 < x1 ? x1 - delta_x : x1 + delta_x;
            y2 = y2 < y1 ? y1 - delta_y : y1 + delta_y;
        }
        d2 = 0;
    }
    return {x1, y1, d1, c1, x2, y2, d2, c2};
};

prepareLinePoints = (previousPoint, point) => {
    let {x1, y1, x2, y2, ...params} = cutLineByScreen(previousPoint, point);
    return {
        x1: x1 + cameraWidth / 2,
        y1: cameraHigh / 2 - y1,
        x2: x2 + cameraWidth / 2,
        y2: cameraHigh / 2 - y2,
        ...params
    };
};
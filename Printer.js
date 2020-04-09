let ctx;

printObjects = () => {
    ctx = document.getElementById('myCanvas').getContext("2d");
    ctx.clearRect(0, 0, cameraWidth, cameraHigh);
    mappedPoints_2d.sort((p1, p2) => p1.d < p2.d ? 1 : p1.d === p2.d ? 0 : -1);
    mappedPoints_2d.forEach(object => {
        if (object.type === OBJECT_TYPE.POINT) printPoint(object);
        else if (object.type === OBJECT_TYPE.LINE) printLine(object);
        else if (object.type === OBJECT_TYPE.FIGURE) printFigure(object);
    });
};

getPointColor = (distance, color) => {
    let opacity = distance === 0 ?
        1 : distance > 500 ?
            0.125 : 62.5 / distance;
    color = color === undefined ? {r: 0, g: 0, b: 0} : color;
    return `rgba(${color.r},${color.g},${color.b},${opacity})`;
};

getPointBlur = (distance) => {
    return `blur(${distance < 500 ? distance / 125 : 8}px)`;
};

getLinearGradient = (x1, y1, d1, c1, x2, y2, d2, c2) => {
    let gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    gradient.addColorStop(0.0, getPointColor(d1, c1));
    gradient.addColorStop(1.0, getPointColor(d2, c2));
    return gradient;
}

printPoint = (point) => {
    let {x, y, z, d, c} = point;
    if (z < 0) return;
    ctx.fillStyle = getPointColor(d, c);
    ctx.filter = getPointBlur(d);
    ctx.beginPath();
    ctx.arc(
        x + cameraWidth / 2,
        cameraHigh / 2 - y,
        d < 100 ? 2 : d < 300 ? d / 50 : 6,
        0, 2 * Math.PI, true
    );
    ctx.fill();
};

function cutLineByScreen(previousPoint, point) {
    let {x: x1, y: y1, z: z1, d: d1, c: c1} = previousPoint.z > point.z ? previousPoint : point;
    let {x: x2, y: y2, z: z2, d: d2, c: c2} = previousPoint.z > point.z ? point : previousPoint;
    if (z2 < 0) {
        let factor = z1 / (z1 - z2);
        let delta_x = factor * Math.abs(x1 - x2);
        let delta_y = factor * Math.abs(y1 - y2);
        x2 = x2 > x1 ? x1 + delta_x : x1 - delta_x;
        y2 = y2 > y1 ? y1 + delta_y : y1 - delta_y;
        d2 = Math.sqrt(x2 * x2 + y2 * y2);
    }
    return {x1, y1, d1, c1, x2, y2, d2, c2};
}

function printLine(line) {
    let previousPoint;
    line.points.forEach(point => {
        if (previousPoint === undefined || (point.z < 0 && previousPoint.z < 0)) {
            previousPoint = point;
            return;
        }
        let {x1, y1, d1, c1, x2, y2, d2, c2} = cutLineByScreen(previousPoint, point);
        ctx.strokeStyle = getLinearGradient(x1, y1, d1, c1, x2, y2, d2, c2);
        ctx.filter = getPointBlur(d1);
        ctx.beginPath();
        ctx.moveTo(
            x1 + cameraWidth / 2,
            cameraHigh / 2 - y1
        );
        ctx.lineTo(
            x2 + cameraWidth / 2,
            cameraHigh / 2 - y2
        );
        ctx.stroke();
        previousPoint = point;
    });
}

function printFigure(figure) {

}


let ctx;

printObjects = () => {
    ctx = document.getElementById('myCanvas').getContext("2d");
    ctx.clearRect(0, 0, cameraWidth, cameraHigh);
    mappedPoints_2d.sort((p1, p2) => p1.d < p2.d ? 1 : p1.d === p2.d ? 0 : -1);
    mappedPoints_2d.forEach(object => {
        if (object.type === OBJECT_TYPE.POINT) printPoint(object);
        else if (object.type === OBJECT_TYPE.LINE) printLine(object);
    });
};

printPoint = (point) => {
    let {x, y, z, d, c} = point;
    if (z < 0) return;
    ctx.beginPath();
    ctx.arc(
        x + cameraWidth / 2,
        cameraHigh / 2 - y,
        d < 100 ? 2 : d < 300 ? d / 50 : 6,
        0, 2 * Math.PI, true
    );
    ctx.fillStyle = pointColor(d, c);
    ctx.filter = pointBlur(d);
    ctx.fill();
};

pointColor = (distance, color) => {
    let opacity = distance === 0 ?
        1 : distance > 1000 ?
            0.125 : 125 / distance;
    color = color === undefined ? 0 : color;
    return `rgba(${color},${color},${color},${opacity})`;
};

pointBlur = (distance) => {
    return `blur(${distance < 1000 ? distance / 125 : 8}px)`;
};

function printLine(line) {
    let previousPoint;
    line.points.forEach(point => {
        if (previousPoint === undefined || (point.z < 0 && previousPoint.z < 0)) {
            previousPoint = point;
            return;
        }
        let {x: x1, y: y1, z: z1} = previousPoint.z > point.z ? previousPoint : point;
        let {x: x2, y: y2, z: z2} = previousPoint.z > point.z ? point : previousPoint;
        previousPoint = point;
        if (z2 < 0) {
            console.log('linia ucieta:');
            console.log(`original x1 -> x2: ${x1} -> ${x2} \ny1 -> y2: ${y1} -> ${y2}`);
            let factor = z1 / (z1 - z2);
            let delta_x = factor * Math.abs(x1 - x2);
            let delta_y = factor * Math.abs(y1 - y2);
            console.log(`delta_x: ${delta_x}, delta_y: ${delta_y}`);
            x2 = x2 > x1 ? x1 + delta_x : x1 - delta_x;
            y2 = y2 > y1 ? y1 + delta_y : y1 - delta_y;
            console.log(`x1 -> x2: ${x1} -> ${x2} \ny1 -> y2: ${y1} -> ${y2}`)
        }
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
    });
}
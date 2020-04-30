let ctx;

printObjects = () => {
    ctx = document.getElementById('myCanvas').getContext("2d");
    ctx.clearRect(0, 0, cameraWidth, cameraHigh);
    mappedPoints_2d.sort((p1, p2) => {
        return p1.z !== p2.z ?
            (p1.z < p2.z ? 1 : p1.z === p2.z ? 0 : -1) :
            (p1.d < p2.d ? 1 : p1.d === p2.d ? 0 : -1);
    });
    mappedPoints_2d.forEach(object => {
        if (object.type === OBJECT_TYPE.POINT) printPoint(object);
        else if (object.type === OBJECT_TYPE.LINE) printLine(object);
        else if (object.type === OBJECT_TYPE.FIGURE) printFigure(object);
    });
};

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
    ctx.closePath();
};

printLine = (line) => {
    line.points.reduce((previousPoint, point) => {
        if (previousPoint === 0 || (point.z < 0 && previousPoint.z < 0)) {
            return point;
        }
        let {x1, y1, d1, c1, x2, y2, d2, c2} = prepareLinePoints(previousPoint, point);
        ctx.strokeStyle = getLinearGradient(x1, y1, d1, c1, x2, y2, d2, c2);
        ctx.filter = getPointBlur(d1);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.closePath();
        return point;
    }, 0);
};

printFigure = (figure) => {
    ctx.beginPath();
    let points_amount = figure.points.length;
    figure.points
        .map((point, idx) => {
            //TODO: cutting edges
            let next_idx = points_amount === idx + 1 ? 0 : idx + 1;
            if (point.z > 0 || figure.points[next_idx].z > 0) {
                let {x1, y1, d1, c1, x2, y2, d2, c2} = prepareLinePoints(point, figure.points[next_idx]);
                return point.z > figure.points[next_idx].z ?
                    {x: x1, y: y1, d: d1, c: c1} :
                    {x: x2, y: y2, d: d2, c: c2};
            }
        })
        .filter(point => point !== undefined)
        .forEach((point, idx) => {
            if (idx === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
    //TODO: gradient from points
    ctx.fillStyle = getPointColor(figure.d, figure.c);
    ctx.fill();
};


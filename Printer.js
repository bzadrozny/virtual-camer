let ctx;

printObjects = () => {
    cleanScreen();
    mappedPoints_2d.sort((p1, p2) => {
            let commonExtrema = getCommonExtrema(p1, p2);
            return commonExtrema !== 0 ?
                compareCoveredFigures(p1, p2, commonExtrema) :
                p1.d < p2.d ? 1 : p1.d === p2.d ? 0 : -1
        }
    );
    mappedPoints_2d.forEach(object => {
        if (object.type === OBJECT_TYPE.POINT) printPoint(object);
        else if (object.type === OBJECT_TYPE.LINE) printLine(object);
        else if (object.type === OBJECT_TYPE.FIGURE) printFigure(object);
    });
};

cleanScreen = () => {
    ctx = document.getElementById('myCanvas').getContext("2d");
    ctx.clearRect(0, 0, cameraWidth, cameraHigh);
};

getCommonExtrema = (figure1, figure2) => {
    let {t: t1, r: r1, b: b1, l: l1} = getFiguresExtrema(figure1);
    let {t: t2, r: r2, b: b2, l: l2} = getFiguresExtrema(figure2);
    if (t2 < b1 || b2 > t1 || l2 > r1 || r2 < l1) return 0;
    let t = t1 < t2 ? t1 : t2,
        r = r1 < r2 ? r1 : r2,
        b = b1 > b2 ? b1 : b2,
        l = l1 > l2 ? l1 : l2;
    return {t, r, b, l}
};

getFiguresExtrema = (figure) => {
    let l = 99999, r = -99999, t = -99999, b = 99999;
    for (let i = 0; i < figure.points.length; i++) {
        if (l > figure.points[i].x) l = figure.points[i].x;
        if (r < figure.points[i].x) r = figure.points[i].x;
        if (t < figure.points[i].y) t = figure.points[i].y;
        if (b > figure.points[i].y) b = figure.points[i].y;
    }
    return {t, r, b, l}
};

compareCoveredFigures = (figure1, figure2, commonExtrema) => {
    for (let y = commonExtrema.b; y <= commonExtrema.t; y++) {
        for (let x = commonExtrema.l; x <= commonExtrema.r; x++) {
            if (isPointInFigure({x, y}, figure1.points) && isPointInFigure({x, y}, figure2.points)) {
                let z1 = getZOfPointInFigure(x, y, figure1.points);
                let z2 = getZOfPointInFigure(x, y, figure2.points);
                console.log(figure1, z1, figure2, z2)
                console.log(x, y);
                return z1 < z2 ? 1 : z1 === z2 ? 0 : -1;
            }
        }
    }
    return figure1.d < figure2.d ? 1 : figure1.d === figure2.d ? 0 : -1;
};

isPointInFigure = (point, points) => {
    let j = 3;
    let result = false;
    for (let i = 0; i < 3; i++) {
        let difY = (points[i].y > point.y) ^ (points[j].y > point.y);
        let inX = (point.x < (points[i].x + (points[j].x - points[i].x) * (point.y - points[i].y) / (points[j].y - points[i].y)));
        if (difY && inX) result = !result;
        j = i;
    }
    return result;
};

getZOfPointInFigure = (x, y, points) => {
    let w = points[0].x * points[1].y * points[2].z + points[1].x * points[2].y * points[0].z + points[2].x * points[0].y * points[1].z
        - points[0].z * points[1].y * points[2].x - points[1].z * points[2].y * points[0].x - points[2].z * points[0].y * points[1].x;
    let a = (points[1].y * points[2].z + points[2].y * points[0].z + points[0].y * points[1].z
        - points[0].z * points[1].y - points[1].z * points[2].y - points[2].z * points[0].y) / w;
    let b = (points[0].x * points[2].z + points[1].x * points[0].z + points[2].x * points[1].z -
        points[0].z * points[2].x - points[1].z * points[0].x - points[2].z * points[1].x) / w;
    let c = (points[0].x * points[1].y + points[1].x * points[2].y + points[2].x * points[0].y -
        points[1].y * points[2].x - points[2].y * points[0].x - points[0].y * points[1].x) / w;
    return -(a * x + b * y - 1) / c;
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
    let figure_points = prepareFigurePoints(figure.points);
    ctx.beginPath();
    figure_points.forEach((point, idx) => {
        if (idx === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.fillStyle = getPointColor(figure.d, figure.c);
    ctx.fill();
};


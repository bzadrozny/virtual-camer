let ctx;

printObjects = () => {
    cleanScreen();
    mappedPoints_2d.sort((p1, p2) => {
            let commonExtrema = getCommonExtrema(p1, p2);
            return commonExtrema !== 0 ?
                sortCoveredFigures(p1, p2, commonExtrema) :
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

sortCoveredFigures = (figure1, figure2, commonExtrema) => {
    for (let i = 0; i < figure1.points.length; i++) {
        if (isPointInSquare(figure1.points[i], commonExtrema) && isPointInFigure(figure1.points[i], figure2.points)) {
            let figure2_z = getZOfPointInFigure(figure1.points[i].x, figure1.points[i].y, figure2.points);
            return figure1.points[i].z < figure2_z ? 1 : figure1.points[i].z === figure2_z ? 0 : -1;
        }
    }
    for (let i = 0; i < figure2.points.length; i++) {
        if (isPointInSquare(figure2.points[i], commonExtrema) && isPointInFigure(figure2.points[i], figure1.points)) {
            let figure1_z = getZOfPointInFigure(figure2.points[i].x, figure2.points[i].y, figure1.points);
            return figure2.points[i].z < figure1_z ? 1 : figure2.points[i].z === figure1_z ? 0 : -1;
        }
    }
    return figure1.d < figure2.d ? 1 : figure1.d === figure2.d ? 0 : -1;
};

isPointInSquare = (point, square) => {
    return square.l <= point.x && point.x <= square.r && square.b <= point.y && point.y <= square.t;
};

isPointInFigure = (point, points) => {
    return true;
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


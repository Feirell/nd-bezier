const namespace = 'http://www.w3.org/2000/svg';
const createSVGElement = document.createElementNS.bind(document, namespace);

function SimpleSVG(svgContainer) {
    this.svgContainer = svgContainer;
}

SimpleSVG.prototype.addToContainer = function addToContainer(item) {
    this.svgContainer.appendChild(item);
}

SimpleSVG.prototype.createCircleAt = function createCircleAt(x, y, className) {
    const circle = createSVGElement('circle');

    circle.cx.baseVal.value = x;
    circle.cy.baseVal.value = y;
    circle.r.baseVal.value = 2.5;

    circle.className.baseVal = className;

    this.addToContainer(circle);
    return circle;
}

SimpleSVG.prototype.createPolyline = function createPolyline(className, ...points) {
    if (points[0] instanceof Array)
        points = points[0];

    const polyline = createSVGElement('polyline');

    for (let point of points) {
        const svgPoint = this.svgContainer.createSVGPoint();
        svgPoint.x = point.x;
        svgPoint.y = point.y;

        polyline.points.appendItem(svgPoint);
    }

    polyline.className.baseVal = className;

    this.addToContainer(polyline);
    return polyline;
}

SimpleSVG.prototype.createLine = function createLine(className, a, b) {
    const line = createSVGElement('line');

    line.x1.baseVal.value = a.x;
    line.y1.baseVal.value = a.y;

    line.x2.baseVal.value = b.x;
    line.y2.baseVal.value = b.y;

    line.className.baseVal = className;

    this.addToContainer(line);
    return line;
}

export {
    SimpleSVG
}
function trackTransforms(ctx) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function () { return xform; };

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function () {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
    };

    var restore = ctx.restore;
    ctx.restore = function () {
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function (sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };

    var rotate = ctx.rotate;
    ctx.rotate = function (radians) {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };

    var translate = ctx.translate;
    ctx.translate = function (dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };

    var setTransform = ctx.setTransform;
    ctx.setTransform = function (a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };

    var pt = svg.createSVGPoint();
    ctx.transformedPoint = function (x, y) {
        pt.x = x; pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }
}

window.onload = function () {
    var canvas = document.getElementById('mapCanvas');
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = 'maantiede/maantiede_media/maailmankartta_min.jpg';

    var markerImages = {};
    var points = [
        { x: 0.1, y: 0.15, link: 'valtiot/jaakka/inhi.html', image: 'hylje_makaa.jpg', width: 50, height: 50 },
        { x: 0.7852, y: 0.64, link: 'valtiot/luotola/luotola.html', image: 'valtiot/luotola/luotola_media/luotola_lippu.png', width: 80, height: 55 },
        { x: 0.907, y: 0.74, link: 'valtiot/herwood/herwood.html', image: 'valtiot/herwood/herwood_media/herwood_lippu.png', width: 82, height: 55},
        { x: 0.945, y: 0.575, link: 'valtiot/kaldoaivi/kaldoaivi.html', image: 'valtiot/kaldoaivi/kaldoaivi_media/kaldoaivi_lippu.png', width: 83, height: 60},
        { x: 0.106, y: 0.718, link: 'valtiot/helmeran/helmeran.html', image: 'valtiot/helmeran/helmeran_media/helmeran_lippu.png', width: 85, height: 55},
        { x: 0.036, y: 0.467, link: 'valtiot/hermes/hermes.html', image: 'valtiot/hermes/hermes_media/hermes_lippu.png', width: 85, height: 55},
        { x: 0.925, y: 0.462, link: 'valtiot/parkea/parkea.html', image: 'valtiot/parkea/pareka_media/parkea_lippu.png', width: 80, height: 60},
        { x: 0.850, y: 0.48, link: 'valtiot/sermania/sermania.html', image: 'valtiot/sermania/sermania_media/semania_keisarikunta_lippu.png', width: 85, height: 55},
        { x: 0.507, y: 0.545, link: 'valtiot/sarjas/sarjas.html', image: 'valtiot/sarjas/sarjas_media/sarjaksen_unioni_lippu.png', width: 55, height: 55},
        { x: 0.071, y: 0.36, link: 'valtiot/jaakka/jaakka.html', image: 'valtiot/jaakka/jaakka_media/jääkkä_lippu.png', width: 82, height: 55},




    ];
    
    var hoveredPoint = null;

    function drawPoints() {
        ctx.save();
        var currentTransform = ctx.getTransform();
        points.forEach(function (point) {
            var markerImg = markerImages[point.image];
            if (markerImg) {
                var scaledX = point.x * canvas.width;
                var scaledY = point.y * canvas.height;
                var width = point.width / currentTransform.a; // adjust width based on zoom level
                var height = point.height / currentTransform.a; // adjust height based on zoom level

                if (hoveredPoint === point) {
                    width *= 1.2;
                    height *= 1.2;
                }

                ctx.drawImage(markerImg, scaledX - width / 2, scaledY - height / 2, width, height);
            }
        });
        ctx.restore();
    }

    img.onload = function () {
        canvas.width = window.innerWidth;
        canvas.height = img.height * (canvas.width / img.width);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        trackTransforms(ctx);

        points.forEach(function (point) {
            var markerImg = new Image();
            markerImg.src = point.image;
            markerImg.onload = function () {
                markerImages[point.image] = markerImg;
                // Call drawPoints whenever a marker image is loaded
                drawPoints();
            };
        });
    };

    function redraw() {
        var p1 = ctx.transformedPoint(0, 0);
        var p2 = ctx.transformedPoint(canvas.width, canvas.height);
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawPoints();
    }

    var lastX, lastY, dragStart, dragged;

    canvas.addEventListener('mousedown', function (evt) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        dragStart = ctx.transformedPoint(lastX, lastY);
        dragged = false;
    }, false);

    canvas.addEventListener('mousemove', function (evt) {
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        var pt = ctx.transformedPoint(lastX, lastY);

        var found = false;
        points.forEach(function (point) {
            var scaledX = point.x * canvas.width;
            var scaledY = point.y * canvas.height;
            var currentTransform = ctx.getTransform();
            var width = point.width / currentTransform.a;
            var height = point.height / currentTransform.a;
            if (pt.x >= scaledX - width / 2 && pt.x <= scaledX + width / 2 &&
                pt.y >= scaledY - height / 2 && pt.y <= scaledY + height / 2) {
                hoveredPoint = point;
                found = true;
            }
        });

        if (!found) {
            hoveredPoint = null;
        }

        if (!dragStart) {
            redraw();
        } else {
            dragged = true;
            var pt = ctx.transformedPoint(lastX, lastY);
            var dx = pt.x - dragStart.x, dy = pt.y - dragStart.y;
            if (canTranslate(dx, dy)) {
                ctx.translate(dx, dy);
                redraw();
            }
        }
    }, false);

    canvas.addEventListener('mouseup', function (evt) {
        dragStart = null;
        if (!dragged) zoom(evt.shiftKey ? -1 : 1);
    }, false);

    canvas.addEventListener('click', function (evt) {
        lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
        lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
        var pt = ctx.transformedPoint(lastX, lastY);
        points.forEach(function (point) {
            var scaledX = point.x * canvas.width;
            var scaledY = point.y * canvas.height;
            var currentTransform = ctx.getTransform();
            var width = point.width / currentTransform.a;
            var height = point.height / currentTransform.a;
            if (pt.x >= scaledX - width / 2 && pt.x <= scaledX + width / 2 &&
                pt.y >= scaledY - height / 2 && pt.y <= scaledY + height / 2) {
                window.open(point.link, '_blank');
            }
        });
    }, false);

    var scaleFactor = 1.1;

    var zoom = function (clicks) {
        var pt = ctx.transformedPoint(lastX, lastY); // use last mouse position
        ctx.translate(pt.x, pt.y);
        var factor = Math.pow(scaleFactor, clicks);
        var futureScale = ctx.getTransform().a * factor;
        if (futureScale < 1) {
            factor = 1 / ctx.getTransform().a;
        }
        ctx.scale(factor, factor);
        ctx.translate(-pt.x, -pt.y);
        redraw();
        checkBounds();
    };

    var handleScroll = function (evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
        return evt.preventDefault() && false;
    };

    canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    canvas.addEventListener('mousewheel', handleScroll, false);

    function canTranslate(dx, dy) {
        var transform = ctx.getTransform();
        var xMin = transform.e + dx;
        var yMin = transform.f + dy;
        var xMax = xMin + canvas.width * transform.a;
        var yMax = yMin + canvas.height * transform.d;

        var xWithinBounds = (xMin <= 0 && xMax >= canvas.width) || (xMin > 0 && dx < 0) || (xMax < canvas.width && dx > 0);
        var yWithinBounds = (yMin <= 0 && yMax >= canvas.height) || (yMin > 0 && dy < 0) || (yMax < canvas.height && dy > 0);

        return xWithinBounds && yWithinBounds;
    }

    function checkBounds() {
        var transform = ctx.getTransform();
        var xMin = transform.e;
        var yMin = transform.f;
        var xMax = transform.e + canvas.width * transform.a;
        var yMax = transform.f + canvas.height * transform.d;

        var dx = 0, dy = 0;

        if (xMin > 0) {
            dx = -xMin;
        } else if (xMax < canvas.width) {
            dx = canvas.width - xMax;
        }

        if (yMin > 0) {
            dy = -yMin;
        } else if (yMax < canvas.height) {
            dy = canvas.height - yMax;
        }

        ctx.translate(dx, dy);
        redraw();
    }
};

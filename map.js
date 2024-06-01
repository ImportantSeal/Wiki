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
    img.src = '/media_muu/aadramin.jpg';

    img.onload = function () {
        canvas.width = window.innerWidth;
        canvas.height = img.height * (canvas.width / img.width);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        trackTransforms(ctx);
        redraw();
    };

    function redraw() {
        var p1 = ctx.transformedPoint(0, 0);
        var p2 = ctx.transformedPoint(canvas.width, canvas.height);
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawPoints();
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    var lastX = canvas.width / 2, lastY = canvas.height / 2;
    var dragStart, dragged;
    // Initialize points directly in the script
    var points = [
        { x: 975, y: 420 },
        { x: 200, y: 250 },
        { x: 300, y: 350 }
    ];

    function drawPoints() {
        ctx.save();
        points.forEach(function (point) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI, true);
            ctx.fillStyle = 'red';
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.stroke();
        });
        ctx.restore();
    }

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
        dragged = true;
        if (dragStart) {
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

    var scaleFactor = 1.1;

    var zoom = function (clicks) {
        var pt = ctx.transformedPoint(lastX, lastY);
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

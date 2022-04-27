const Key = {

    _pressed: {},
    _released: {},

    ESCAPE: 27,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,
    ONE: 49,
    TWO: 50,
    THREE: 51,
    FOUR: 52,
    COMMA: 188,
    PERIOD: 190,
    ENTER: 13,
    a: 65,
    b: 66,
    c: 67,
    w: 87,
    s: 83,
    d: 68,
    z: 90,
    x: 88,
    f: 70,
    p: 80,
    r: 82,
    i: 73,
    j: 74,
    k: 75,
    l: 76,
    m: 77,
    o: 79,
    t: 84,

    isDown(keyCode) {
        return this._pressed[keyCode];
    },

    justReleased(keyCode) {
        return this._released[keyCode];
    },

    onKeydown(event) {
        if (audio && !audio.initialized) audio.init(loadSounds);
        this._pressed[event.keyCode] = true;
    },

    onKeyup(event) {
        this._released[event.keyCode] = true;
        delete this._pressed[event.keyCode];
    },

    update() {
        this._released = {};
    }
};

getMousePosition = (event) =>  {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    mouse = {
      x: ( (event.clientX - rect.left) * scaleX),   // scale mouse coordinates after they have
      y: ( (event.clientY - rect.top) * scaleY),     // been adjusted to be relative to element
      pressed: event.buttons,
      type: event.type
    }
   // console.log(mouse);   
  }

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}
function intLerp(v0, v1, t) {
    return Math.round(v0*(1-t)+v1*t);
}

function inView(x,y, pad=10){
    let screenX = x - view.x,
        screenY = y - view.y,
        padding=pad;
        return (screenX > -padding &&
               screenX < (view.width + padding) &&
               screenY > -padding &&
               screenY < (view.height+padding))
}

function rectCollision(rect1, rect2) {
    return (
        rect1.left < rect2.right &&
        rect2.left < rect1.right &&
        rect1.top < rect2.bottom &&
        rect2.top < rect1.bottom
      );
}

function rectVsCircle(rect, circle) {
    // assumes rect is axis aligned
    // circle can only collide along its cardinal radii or with a corner of the rect
    if (circle.center.y >= rect.top && circle.center.y <= rect.bottom) {
        //vertically aligned, need to check horizontal
        if ((circle.center.x - circle.radius < rect.right) &&
            (circle.center.x + circle.radius > rect.left)) {
            return true;
        } else {
            return false;
        }
    } else if (circle.center.x >= rect.left && circle.center.x <= rect.right) {
        //horizontally aligned, need to check vertical
        if ((circle.center.y + circle.radius > rect.top) &&
            (circle.center.y - circle.radius < rect.bottom)) {
            return true;
        } else {
            return false
        }
    } else {
        //check for corner collisions
        const squaredRadius = circle.radius * circle.radius;
        if (circle.center.x < rect.left) {
            if (circle.center.y < rect.top) {
                // check rect's top left corner
                const deltaXSquared = (rect.left - circle.center.x) * (rect.left - circle.center.x);
                const deltaYSquared = (rect.top - circle.center.y) * (rect.top - circle.center.y);
                return (deltaXSquared + deltaYSquared <= squaredRadius)
            } else if (circle.center.y > rect.bottom) {
                // check rect's bottom left corner
                const deltaXSquared = (rect.left - circle.center.x) * (rect.left - circle.center.x);
                const deltaYSquared = (rect.bottom - circle.center.y) * (rect.bottom - circle.center.y);
                return (deltaXSquared + deltaYSquared <= squaredRadius)
            }
        } else if (circle.center.x > rect.right) {
            if (circle.center.y < rect.top) {
                // check rect's top right corner
                const deltaXSquared = (rect.right - circle.center.x) * (rect.right - circle.center.x);
                const deltaYSquared = (rect.top - circle.center.y) * (rect.top - circle.center.y);
                return (deltaXSquared + deltaYSquared <= squaredRadius)
            } else if (circle.center.y > rect.bottom) {
                // check rect's bottom right corner
                const deltaXSquared = (rect.right - circle.center.x) * (rect.right - circle.center.x);
                const deltaYSquared = (rect.bottom - circle.center.y) * (rect.bottom - circle.center.y);
                return (deltaXSquared + deltaYSquared <= squaredRadius)
            }
        }
    }
}

function pointInRect(x, y, rect){
    return  x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
}

function randomInt(max, min=0) {
    return Math.round(Math.random() * (max-min)) + min;
}

function randomRange(max, min=0) {
    return (Math.random() * (max-min)) + min;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function clampRoll(value, min, max) {
    let r = max-min;
    if (value > max) {
        return min + ((value-max) % r);
    }
    if (value < min) {
        return max - ((min-value) % r);
    }
    return value;
}

function map(value, istart, istop, ostart, ostop) {
    return ostart + (ostop - ostart) * ((value - istart) / (istop - istart));
}

function checkLine(pointA, pointB, checkfunction){

    let x0 = pointA.x,
        y0 = pointA.y,
        x1 = pointB.x,
        y1 = pointB.y,
        tmp = 0;
    swapXY = Math.abs(y1 - y0) < Math.abs(x1 - x0);
    if (swapXY) {
        tmp = x0; x0 = y0; y0 = tmp;
        tmp = x1; x1 = y1; y1 = tmp;
    }
    if (x0 > x1) {
        tmp = x0; x0 = x1; x1 = tmp;
        tmp = y0; y0 = y1; y1 = tmp;
    }
    let deltaX = x1 - x0,
        deltaY = Math.floor(Math.abs(y1 - y0)),
        error = Math.floor(-deltaX / 2),
        y = y0,
        yStep = y0 < y1 ? 1 : -1;

    if(swapXY){
        for (let x = x0; x <= x1; x++) {
            if (!checkfunction(y, x)) {
                return false;
            }
            error = error + deltaY;
            if (error > 0) {
                y = y + yStep;
                error += deltaX;
            }
        }
    }
    else{
        for (let x = x0; x <= x1; x++) {
            if (!checkfunction(x, y)) {
                return false;
            }
            error = error + deltaY;
            if (error > 0) {
                y = y + yStep;
                error += deltaX;
            }
        }
    }
    return true;
}

function getAABBDistanceBetween(e1, e2){
    let dx = 0, dy = 0
    if (e1.x < e2.x)
    {
        dx = e2.left - (e1.right);
    }
    else if (e1.left > e2.left)
    {
        dx = e1.left - (e2.right);
    }

    if (e1.top < e2.top)
    {
        dy = e2.top - (e1.bototm);
    }
    else if (e1.top > e2.top)
    {
        dy = e1.top - (e2.bottom);
    }

    return ({dx:dx, dy:dy});
}

function getAABBOverlap(e1, e2){
    //console.log(e1, e2);
    /*
    let dx = 0, dy = 0
    if (e1.left < e2.left)
    {
        dx = (e1.right) - e2.left;
    }
    else if (e1.left > e2.left)
    {
        dx =(e2.right) - e1.left;
    }
    if (e1.top < e2.top)
    {
        dy = (e1.bottom) - e2.top;
    }
    else if (e1.top > e2.top)
    {
        dy = (e2.bottom) - e1.top;
    }
    return ({dx:dx, dy:dy});
    */

    // bounding box of collision
    let minx = Math.max(e1.left, e2.left);
    let maxx = Math.min(e1.right, e2.right);
    let miny = Math.max(e1.top, e2.top);
    let maxy = Math.min(e1.bottom, e2.bottom);
    let width = maxx-minx;
    let height = maxy-miny;
    return ({dx:width, dy: height});
    
}
function collisionResponse(entity1, entity){
    //entity1 is moving, entity is static

    let aabbDistance = getAABBOverlap(entity1.collider, entity.collider);


   

    xTimeToCollide = entity1.xVelocity != 0 ? Math.abs(aabbDistance.dx / entity1.xVelocity) : 0;
    yTimeToCollide = entity1.yVelocity != 0 ? Math.abs(aabbDistance.dy / entity1.yVelocity) : 0;

    let shortestTime = 0;

    if(entity1.xVelocity != 0 && entity1.yVelocity == 0){
        shortestTime = xTimeToCollide;
        entity1.x -= entity1.xVelocity * shortestTime;
    }
    else if(entity1.yVelocity != 0 && entity1.xVelocity == 0){
        shortestTime = yTimeToCollide;
        entity1.y -= entity1.yVelocity * shortestTime;
    }
    else{
        shortestTime = Math.min( Math.abs(xTimeToCollide), Math.abs(yTimeToCollide));
        entity1.x -= entity1.xVelocity * shortestTime;
        entity1.y -= entity1.yVelocity * shortestTime;
    }
    // return entity1;

}


function wallCheck(x,y){
    return world.getTileAtPosition(x,y) === 0;          
}

function distanceBetweenPoints(pointA, pointB){
    let dx = pointA.x - pointB.x,
        dy = pointA.y - pointB.y;
    return Math.sqrt(dx*dx + dy*dy);
}






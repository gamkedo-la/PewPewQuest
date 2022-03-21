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
      pressed: event.buttons
    }
    //console.log(mouse);   
  }

function lerp(v0, v1, t) {
    return v0*(1-t)+v1*t
}
function intLerp(v0, v1, t) {
    return Math.round(v0*(1-t)+v1*t);
}

function inView(x,y){
    //this isn't working for some reason, entities offscreen are updating
    let screenX = x - view.x,
        screenY = y - view.y,
        padding = 200;
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

function pointInRect(x, y, rect){
    return  x >= rect.left &&
            x <= rect.right &&
            y >= rect.top &&
            y <= rect.bottom
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}





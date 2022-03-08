var player = {
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    width: 11,
    height: 24,
    speed: 0,
    xVelocity: 0,
    yVelocity: 0,
    xAcceleration: 0,
    yAcceleration: 0,
    maxSpeed: 40,
    maxAcceleration: 70,
    friction: 0.7,

    draw: function () {
        fillRect(Math.round(this.x-view.x), Math.round(this.y-view.y), this.width, this.height);
    },

    update: function () {

        this.x += this.xVelocity * 1/FRAMES_PER_SECOND;
        this.y += this.yVelocity * 1/FRAMES_PER_SECOND;
        
        this.xVelocity *= this.friction;
        this.yVelocity *= this.friction;

        if (Key.isDown(Key.LEFT)) {
            this.xVelocity -= this.maxAcceleration;
        }
        if (Key.isDown(Key.RIGHT)) {
            this.xVelocity += this.maxAcceleration;
        }
        if (Key.isDown(Key.UP)) {
            this.yVelocity -= this.maxAcceleration;
        }
        if (Key.isDown(Key.DOWN)) {
            this.yVelocity += this.maxAcceleration;
        }

        if(this.x - view.x < 0) {
            view.x -= canvas.width;
        }
        if(this.x - view.x > canvas.width - this.width) {
            view.x += canvas.width;
        }
        if(this.y - view.y < 0) {
            view.y -= canvas.height;
        }
        if(this.y - view.y > canvas.height - this.height) {
            view.y += canvas.height;
        }


        this.previousX = this.x;
        this.previousY = this.y;
    },

    placeAtTile: function (x, y) {
        this.x = x * world.tileSize;
        this.y = y * world.tileSize;
    }

}

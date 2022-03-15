var player = {
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    width: 9,
    height: 9,
    speed: 0,
    xVelocity: 0,
    yVelocity: 0,
    xAcceleration: 0,
    yAcceleration: 0,
    maxSpeed: 150,
    maxAcceleration: 90,
    friction: 0.7,
    xFacing: 0,
    yFacing: 0,

    collider: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        leftFeeler: { x: 0, y: 0 },
        rightFeeler: { x: 0, y: 0 },
        topFeeler: { x: 0, y: 0 },
        bottomFeeler: { x: 0, y: 0 }
    },

    draw: function () {
        fillRect(Math.round(this.x-view.x-this.width/2), Math.round(this.y-view.y-this.height/2), this.width, this.height, "yellow");
    },

    update: function () {
        this.updateCollider(this.x, this.y);
        //apply x movement
        this.x += this.xVelocity * 1/FRAMES_PER_SECOND;
        this.xVelocity = clamp(this.xVelocity, -this.maxSpeed, this.maxSpeed);
        this.xVelocity *= this.friction;
        //apply y movement
        this.y += this.yVelocity * 1/FRAMES_PER_SECOND;
        this.yVelocity =  clamp(this.yVelocity, -this.maxSpeed, this.maxSpeed);
        this.yVelocity *= this.friction;

        //update rect:
        this.updateCollider(this.x, this.y);
        
        if (Key.isDown(Key.LEFT)) {
            this.xVelocity -= this.maxAcceleration;
            this.xFacing = -1;
        }
        else if (Key.isDown(Key.RIGHT)) {
            this.xVelocity += this.maxAcceleration;
            this.xFacing = 1;
        }
        else {this.xFacing = 0}
        if (Key.isDown(Key.UP)) {
            this.yVelocity -= this.maxAcceleration;
            this.yFacing = -1;
        }
        else if (Key.isDown(Key.DOWN)) {
            this.yVelocity += this.maxAcceleration;
            this.yFacing = 1;
        } else {this.yFacing = 0}
       

        if (Key.justReleased(Key.z)) { this.fireBullet(); }

        if(this.collider.right - view.x < 0) {
            view.targetX -= canvas.width;
        }
        if(this.collider.left - view.x > canvas.width - this.width) {
            view.targetX += canvas.width;
        }
        if(this.collider.bottom - view.y < 0) {
            view.targetY -= canvas.height;
        }
        if(this.collider.top - view.y > canvas.height - this.height) {
            view.targetY += canvas.height;
            //this.y += 2;
        }

        //check for x collisions
        if(this.tileCollisionCheck(world, 0)){
            this.x = this.previousX;
            this.xVelocity = 0;
            this.updateCollider(this.x, this.y);
        }

        //check for y collisions
        if(this.tileCollisionCheck(world, 0)){
            this.y = this.previousY;
            this.yVelocity = 0;
            this.updateCollider(this.x, this.y);
        }

        this.previousX = this.x;
        this.previousY = this.y;
    },

    placeAtTile: function (x, y) {
        this.x = x * world.tileSize;
        this.y = y * world.tileSize;
        this.previousX = this.x;
        this.previousY = this.y;
        return 
    },

    updateCollider(x, y) {

        this.collider.top = this.y - this.height / 2;
        this.collider.bottom = this.y + this.height / 2;
        this.collider.left = this.x - this.width / 2;
        this.collider.right = this.x + this.width / 2;

        this.collider.leftFeeler.x = this.collider.left;
        this.collider.leftFeeler.y = this.y;
        this.collider.rightFeeler.x = this.collider.right;
        this.collider.rightFeeler.y = this.y;
        this.collider.topFeeler.x = this.x;
        this.collider.topFeeler.y = this.collider.top;
        this.collider.bottomFeeler.x = this.x;
        this.collider.bottomFeeler.y = this.collider.bottom;
        
    },

    tileCollisionCheck: function(world, tileCheck){
        
        let leftTile =      Math.floor(this.collider.left / world.tileSize),
            rightTile =     Math.floor(this.collider.right / world.tileSize),
            topTile =       Math.floor(this.collider.top / world.tileSize),
            bottomTile =    Math.floor(this.collider.bottom / world.tileSize)

        for(let i = leftTile; i <=rightTile; i++){
            for(let j = topTile; j<= bottomTile; j++){
                let tile = world.getTileAtPosition(i, j)

                if(typeof tileCheck === "function"){
                   return tileCheck(tile);
                }
                else if(tile > tileCheck){
                    //console.log(tile);
                    return true;
                }
            }
        }
    },

    tilesThatCollide: function(tile){
        return tile >= 0;
    },

    fireBullet: function(){
        let bullet = new Bullet(this.x, this.y, this.xFacing * 8, this.yFacing * 8);
        world.entities.push(bullet);
    }

    

}

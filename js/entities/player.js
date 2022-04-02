var player = {
    x: 0,
    y: 0,
    previousX: 0,
    previousY: 0,
    width: 6,
    height: 6,
    speed: 0,
    xVelocity: 0,
    yVelocity: 0,
    xAcceleration: 0,
    yAcceleration: 0,
    maxSpeed: 600,
    maxAcceleration: 200,
    friction: 0.5,
    xFacing: 0,
    yFacing: 0,
    keyVelocityCap: 0.7,
    shootTarget: {
        x: 0,
        y: 0
    },
    //items: inventory.items,

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
        fillRect(Math.round(this.x-view.x-this.width/2), Math.round(this.y-view.y-this.height/2), this.width, this.height, COLORS.goldenFizz);
        for(let i = 1; i <= inventory.items.keys; i++){
            let radius = 20;
            let angle = Math.PI*2/inventory.items.keys*i;
            let x = -3 + Math.sin(angle+ticker/30)*radius;
            let y = -1 + Math.cos(angle+ticker/30)*radius;

           // strokePolygon(this.x-view.x+x, this.y-view.y+y, 2, 3, ticker/20, COLORS.white);
           canvasContext.drawImage(img['orbit-key'], Math.floor(this.x-view.x+x), Math.floor(this.y-view.y+y));
            
        }
      
    },

    update: function () {
        this.updateCollider(this.x, this.y);
        if(gp){this.shootTarget.x = lerp(this.shootTarget.x, gp.axes[2], 0.1)};
        if(gp){this.shootTarget.y = lerp(this.shootTarget.y, gp.axes[3], 0.1)}
        

        //update rect:
        this.updateCollider(this.x, this.y);
        //handle keyboard ARROWS input------------------------------
        if (Key.isDown(Key.LEFT)) {
            this.xVelocity -= this.maxAcceleration;
            this.yFacing = 0;
            this.xFacing = -1;
            this.xVelocity *= this.keyVelocityCap;
        }
        else if (Key.isDown(Key.RIGHT)) {
            this.xVelocity += this.maxAcceleration;
            this.yFacing = 0;
            this.xFacing = 1;
            this.xVelocity *= this.keyVelocityCap;
        }
        if (Key.isDown(Key.UP)) {
            this.yVelocity -= this.maxAcceleration;
            this.xFacing = 0;
            this.yFacing = -1;
            this.yVelocity *= this.keyVelocityCap;
        }
        else if (Key.isDown(Key.DOWN)) {
            this.yVelocity += this.maxAcceleration;
            this.xFacing = 0;
            this.yFacing = 1;
            this.yVelocity *= this.keyVelocityCap;
        }
        
        //------------------------------------- 
        // analog values are in the range -1..0..1
        let gamepadx = gamepad.xAxis();
        let gamepady = gamepad.yAxis();
        // console.log("gamepad: "+gamepadx+","+gamepady);
        
        if (gamepadx<-0.1) { // L
            this.xVelocity = this.maxAcceleration * gamepadx;
            this.yFacing = 0;
            this.xFacing = -1;
        }
        else if (gamepadx>0.1) { // R
            this.xVelocity = this.maxAcceleration * gamepadx;
            this.yFacing = 0;
            this.xFacing = 1;
        }
        if (gamepady<-0.1) { // U
            this.yVelocity = this.maxAcceleration * gamepady;
            this.xFacing = 0;
            this.yFacing = -1;
        }
        else if (gamepady>0.1) { // D
            this.yVelocity = this.maxAcceleration * gamepady;
            this.xFacing = 0;
            this.yFacing = 1;
        }
        //------------------------------------- // same as above but for wasd
        if (Key.isDown(Key.a)) {
            this.xVelocity -= this.maxAcceleration;
            this.yFacing = 0;
            this.xFacing = -1;
            this.xVelocity *= this.keyVelocityCap;
        }
        else if (Key.isDown(Key.d)) {
            this.xVelocity += this.maxAcceleration;
            this.yFacing = 0;
            this.xFacing = 1;
            this.xVelocity *= this.keyVelocityCap;
        }
        if (Key.isDown(Key.w)) {
            this.yVelocity -= this.maxAcceleration;
            this.xFacing = 0;
            this.yFacing = -1;
            this.yVelocity *= this.keyVelocityCap;
        }
        else if (Key.isDown(Key.s)) {
            this.yVelocity += this.maxAcceleration;
            this.xFacing = 0;
            this.yFacing = 1;
            this.yVelocity *= this.keyVelocityCap;
        }
       
        //bullet firing-----------------------------------------------------
        if (Key.justReleased(Key.z)) { this.fireBullet(); }
        if(mouse.pressed){ this.mouseFireBullet(); mouse.pressed=0 } 
       
        if(gp){this.gamepadFireBullet()}

        //other actions-----------------------------------------------------

        if (Key.justReleased(Key.x)){
            inventory.selection++;
            inventory.selection = inventory.selection % inventory.itemList.length;
        }


        //are we out of bounds? Scroll one screen in that direction
        if(this.collider.right - view.x < 0) {
            view.targetX -= view.width;
        }
        if(this.collider.left - view.x > view.width - this.width) {
            view.targetX += view.width;
        }
        if(this.collider.bottom - view.y < 0) {
            view.targetY -= view.height;
        }
        if(this.collider.top - view.y > view.height - this.height) {
            view.targetY += view.height;
        }

        //apply x movement
        this.x += this.xVelocity * 1/FRAMES_PER_SECOND;
        this.xVelocity = clamp(this.xVelocity, -this.maxSpeed, this.maxSpeed);
        this.xVelocity *= this.friction;

         //check for x collisions
         this.updateCollider(this.x, this.y);
         if(this.tileCollisionCheck(world, 0) && !world.noCollide){
            this.x = this.previousX;
            this.xVelocity = 0;
            this.updateCollider(this.x, this.y);
        }

        //apply y movement
        this.y += this.yVelocity * 1/FRAMES_PER_SECOND;
        this.yVelocity =  clamp(this.yVelocity, -this.maxSpeed, this.maxSpeed);
        this.yVelocity *= this.friction * 1/FRAMES_PER_SECOND;

       
        //check for y collisions
        this.updateCollider(this.x, this.y);
        if(this.tileCollisionCheck(world, 0) && !world.noCollide){
            this.y = this.previousY;
            this.yVelocity = 0;
            this.updateCollider(this.x, this.y);
        }

        this.previousX = this.x;
        this.previousY = this.y;
    },

    placeAtTile(x, y) {
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
                    return true;
                }
            }
        }
    },

    tilesThatCollide: function(tile){
        return tile >= 0;
    },

    fireBullet: function(){
        audio.playSound(loader.sounds.pewpew2, 0, 0.2)
        let bullet = new Bullet(this.x, this.y, this.xFacing * 8, this.yFacing * 8);
        world.bullets.push(bullet);
    },

    gamepadFireBullet: function(){
        let bulletXVelocity = this.shootTarget.x * 8,
            bulletYVelocity = this.shootTarget.y * 8;
        if(Math.abs(bulletXVelocity) > 0.1 || Math.abs(bulletYVelocity) > 0.1){
            if(ticker%2==0){
                audio.playSound(loader.sounds.pewpew2, 0, 0.2)
                let bullet = new Bullet(this.x, this.y, bulletXVelocity, bulletYVelocity);
                world.bullets.push(bullet);
            }
        }
    },

    mouseFireBullet: function(){
        let worldMouseY = mouse.y + view.y;
        let worldMouseX = mouse.x + view.x;
        let bulletXDistance = worldMouseX - this.x;
        let bulletYDistance = worldMouseY - this.y;
        let bulletAngle = Math.atan2(bulletYDistance, bulletXDistance);
        let bulletDistance = Math.sqrt(bulletXDistance * bulletXDistance + bulletYDistance * bulletYDistance);
        let bulletXVelocity = Math.cos(bulletAngle) * 8 * map(bulletDistance, 0, view.width/2, 0.1, 1);
        let bulletYVelocity = Math.sin(bulletAngle) * 8 * map(bulletDistance, 0, view.height/2, 0.1, 1);
        if(ticker%3==0){
            audio.playSound(loader.sounds.pewpew2, 0, 0.2)
            let bullet = new Bullet(this.x, this.y, bulletXVelocity, bulletYVelocity);

            world.bullets.push(bullet);
        }
    },

    collisionResponse: function(entity){

        this.xVelocity = -this.xVelocity * 5;
        this.yVelocity = -this.yVelocity * 5;

    }
                

    

}

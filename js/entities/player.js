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
    maxSpeed: 400,
    maxAcceleration: 100,
    friction: .85,
    xFacing: 0,
    yFacing: 0,
    keyVelocityCap: .5,
    captured: false,
    capturer: {},
    hasSabre: false,
    swinging: false,
    swingAngle: 0,
    swingStart: 0,
    swingEnd: 0,
    swingTimer: 0,
    swingTimerMax: 7,
    swingDelay: 0,
    swingDelayMax: 7,
    swing: 0,
    swingSwap: false,
    steps: -1,
    health: 350,
    startHealth: 350,
    maxHealth: 500,
    hurtCooldown: 0,
    hurtCooldownMax: 25,

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

        if(!this.captured) {
            if(this.hurtCooldown > 0) {
                if(ticker%4 == 0) {
                    fillRect(Math.round(this.x-view.x), Math.round(this.y-view.y), this.width, this.height, COLORS.goldenFizz);
                }
            } else {
                fillRect(Math.round(this.x-view.x), Math.round(this.y-view.y), this.width, this.height, COLORS.goldenFizz);
            }
                for(let i = 1; i <= inventory.items.keys; i++){
                let radius = 20;
                let angle = Math.PI*2/inventory.items.keys*i;
                let x = -3 + Math.sin(angle+ticker/30)*radius;
                let y = -1 + Math.cos(angle+ticker/30)*radius;

            strokePolygon(this.x-view.x+x, this.y-view.y+y, 2, 3, ticker/20, COLORS.white);
            canvasContext.drawImage(img['orbit-key'], Math.floor(this.x-view.x+x), Math.floor(this.y-view.y+y));
                
            }
            if(this.swinging && this.swingTimer){
                let cx = Math.round(this.x-view.x + 3);
                let cy = Math.round(this.y-view.y + 3);
                // the blade
                let s1x = cx + Math.cos(this.swing)*5;
                let s1y = cy + Math.sin(this.swing)*5;
                let s2x = cx + Math.cos(this.swing)*20;
                let s2y = cy + Math.sin(this.swing)*20;
                canvasContext.beginPath();
                canvasContext.moveTo(s1x,s1y);
                canvasContext.lineTo(s2x,s2y);
                canvasContext.strokeStyle = COLORS.viking;
                canvasContext.lineWidth = 2;
                canvasContext.setLineDash([4,1]);
                canvasContext.stroke();
                canvasContext.setLineDash([]);
                canvasContext.strokeStyle = COLORS.loulou;
                canvasContext.lineWidth = 1;
                canvasContext.strokeRect(cx - Math.cos(this.swing)*5 - 1,cy - Math.sin(this.swing)*5 - 1, 2, 2);

                /*
                pixelLine(this.x-view.x + 3, this.y-view.y + 3,
                    this.x + 3 -view.x + Math.cos(this.swing*0.8) * 20,
                    this.y+ 3 -view.y + Math.sin(this.swing*0.8) * 20,
                    "rgba(0,0,255,1)");
                    */
                //pixelLine(this.x-view.x, this.y-view.y, 100, 100);
            }
        }
        
      
    },

    update: function () {
        
        //console.log(player.x, player.y, player.xVelocity, player.yVelocity);
        this.hurtCooldown--;
        
        if (this.swinging) {
            this.swing = lerp(this.swingEnd, this.swingStart, this.swingTimer/this.swingTimerMax);
            if (this.swingTimer > 0) {
                this.swingTimer--;
            } else if (this.swingDelay > 0) {
                if (this.swingBullets) {
                    for (const bullet of this.swingBullets) bullet.die();
                    this.swingBullets = null;
                }
                this.swingDelay--;
            } else {
                this.swinging = false;
            }
        }


        if(this.captured){
            this.x = this.capturer.x;
            this.y = this.capturer.y;

            this.updateCollider(this.x, this.y);

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
        }else{
            this.updateCollider(this.x, this.y);
            if(this.hasSabre){

            }
            else{
                this.shootTarget.x = lerp(this.shootTarget.x, gamepad.rightStick_xAxis(), 0.3);
                this.shootTarget.y = lerp(this.shootTarget.y, gamepad.rightStick_yAxis(), 0.3);
            }

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
            let gamepadx = gamepad.leftStick_xAxis();
            let gamepady = gamepad.leftStick_yAxis();
            // console.log("gamepad: "+gamepadx+","+gamepady);
            
            if (gamepadx<-0.05) { // L
                this.xVelocity = this.maxAcceleration * gamepadx;
                this.yFacing = 0;
                this.xFacing = -1;
            }
            else if (gamepadx>0.05) { // R
                this.xVelocity = this.maxAcceleration * gamepadx;
                this.yFacing = 0;
                this.xFacing = 1;
            }
            if (gamepady<-0.05) { // U
                this.yVelocity = this.maxAcceleration * gamepady;
                this.xFacing = 0;
                this.yFacing = -1;
            }
            else if (gamepady>0.05) { // D
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
            if(this.hasSabre){
                if (Key.justReleased(Key.z)) {
                    this.mouseSwingSabre();
                }
                if(mouse.pressed){ this.mouseSwingSabre() }
                if(gamepad.rightTrigger()){this.gamePadSwingSabre() }
                 
            }else{
                if (Key.justReleased(Key.z)) { this.fireBullet(); }
                if(mouse.pressed){ this.mouseFireBullet(); }
                if(gamepad.rightTrigger() ){this.gamepadFireBullet(); }
            }

            //bullet collisions-----------------------------------------------------
            world.enemyBullets.forEach(bullet => {
                if(rectCollision(this.collider, bullet.collider)) {
                    //this.saved = true;
                    //this.bump = 5;
                    // -- for now... just splode the bullet
                    player.hurt(bullet.damage);
                    bullet.hit();
                    bullet.die();
                }
            });

        
           

            //other actions-----------------------------------------------------

            // slow motion effect test
            // FIXME: remove and trigger during a cinematic moment
            if (Key.justReleased(Key.o)) {
                startSlowMotion(5000); // five second of slowmo
            }

            if (Key.justReleased(Key.x) || gamepad.rightShoulder()) {
                inventory.selection++;
                inventory.selection = inventory.selection % inventory.itemList.length;
            }

            if (Key.justReleased(Key.l)) {
                this.hasSabre = !this.hasSabre;
            }

            //if our velocity is zero and we're colliding with a wall, allow the teleport button to be pressed
            if (this.xVelocity == 0 && this.yVelocity == 0 && this.tileCollisionCheck(world, 0)) {
                if (Key.justReleased(Key.t) || gamePad.buttonY()) {
                    this.teleport();
                }
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
            this.yVelocity *= this.friction;
        
            //check for y collisions
            this.updateCollider(this.x, this.y);
            if(this.tileCollisionCheck(world, 0) && !world.noCollide){
                this.y = this.previousY;
                this.yVelocity = 0;
                this.updateCollider(this.x, this.y);
            }
            let footstep = Math.sqrt( Math.pow( Math.abs(this.xVelocity * 1/FRAMES_PER_SECOND), 2 ) +
                                     Math.pow( Math.abs(this.yVelocity * 1/FRAMES_PER_SECOND), 2 ) );

            this.steps += footstep;
            //console.log(footstep)
            if(footstep < 0.1){
                this.steps = -1;
            }
            //console.log(this.steps);
           
            if(this.steps > 30){
                this.steps = -1;
                audio.playSound(loader.sounds.playerFootstep03, 0, 0.6)
            }
            this.previousX = this.x;
            this.previousY = this.y;

            // swing updates -----------------------------------------------------
            if (this.swinging && this.swingTimer) {
                let cx = this.x+3;
                let cy = this.y+3;

                // particles along the blade
                let s1x = cx + Math.cos(this.swing)*5;
                let s1y = cy + Math.sin(this.swing)*5;
                let s2x = cx + Math.cos(this.swing)*20;
                let s2y = cy + Math.sin(this.swing)*20;

                // particle angle
                let pangle = this.swing + Math.PI*.5;
                let pm = (this.swingSwap) ? 1 : -1;
                for (let i=0; i<5; i++) {
                    let pcolor = (Math.random() < .75) ? COLORS.deepKoamaru : COLORS.dell;
                    // pick point along blade
                    let k = Math.random();
                    let px = s1x + (s2x-s1x)*k;
                    let py = s1y + (s2y-s1y)*k;
                    let particle = new Particle(
                        px, py,
                        pm*Math.cos(pangle)*1,
                        pm*Math.sin(pangle)*1,
                        {color: pcolor, life: Math.random() * 10}
                    );
                    particle.dbg = true;
                    world.entities.push(particle);
                }

                // update swing bullet
                if (this.swingBullets) {
                    for (let i=0; i<=5; i++) {
                        let k = i*.2;
                        let bx = s1x + (s2x-s1x)*k;
                        let by = s1y + (s2y-s1y)*k;
                        this.swingBullets[i].x = bx;
                        this.swingBullets[i].y = by;
                    }
                }

            }

        }
    },

    placeAtTile(x, y) {
        this.x = x * world.tileSize;
        this.y = y * world.tileSize;
        this.previousX = this.x;
        this.previousY = this.y;
        return 
    },

    updateCollider(x, y) {

        this.collider.top = this.y
        this.collider.bottom = this.y + this.height
        this.collider.left = this.x
        this.collider.right = this.x + this.width

        this.collider.leftFeeler.x = this.collider.left;
        this.collider.leftFeeler.y = this.y;
        this.collider.rightFeeler.x = this.collider.right;
        this.collider.rightFeeler.y = this.y;
        this.collider.topFeeler.x = this.x;
        this.collider.topFeeler.y = this.collider.top;
        this.collider.bottomFeeler.x = this.x;
        this.collider.bottomFeeler.y = this.collider.bottom;
        
    },

    tileCollisionCheck(world, tileCheck){
        
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

    tilesThatCollide(tile){
        return tile >= 0;
    },

    fireBullet(){
        audio.playSound(loader.sounds.pewpew2, 0, 0.1)
        let bullet = new Bullet(this.x + 3, this.y + 3, this.xFacing * 8, this.yFacing * 8);
        world.bullets.push(bullet);
        bullet = new Bullet(this.x + 3, this.y + 3, this.xFacing * 8, this.yFacing * 8);
        world.bullets.push(bullet);
    },

    gamepadFireBullet(){
        let bulletXVelocity = this.shootTarget.x * 8,
            bulletYVelocity = this.shootTarget.y * 8;
        if(Math.abs(bulletXVelocity) > 0.2 || Math.abs(bulletYVelocity) > 0.2){
            if(ticker%2==0){
                audio.playSound(loader.sounds.pewpew2, 0, 0.1)
                let bullet = new Bullet(this.x + 3, this.y + 3, bulletXVelocity, bulletYVelocity);
                world.bullets.push(bullet);
                bullet = new Bullet(this.x + 3, this.y + 3, bulletXVelocity, bulletYVelocity);
                world.bullets.push(bullet);
            }
        }
    },

    mouseFireBullet(){
        let worldMouseY = mouse.y + view.y;
        let worldMouseX = mouse.x + view.x;
        let bulletXDistance = worldMouseX - this.x + 3;
        let bulletYDistance = worldMouseY - this.y + 3;
        let bulletAngle = Math.atan2(bulletYDistance, bulletXDistance);
        let bulletDistance = Math.sqrt(bulletXDistance * bulletXDistance + bulletYDistance * bulletYDistance);
        let bulletXVelocity = Math.cos(bulletAngle) * 8 * map(bulletDistance, 0, view.width/2, 0.1, 1);
        let bulletYVelocity = Math.sin(bulletAngle) * 8 * map(bulletDistance, 0, view.height/2, 0.1, 1);
        if(ticker%3==0){
            audio.playSound(loader.sounds.pewpew2, 0, 0.2)
            let bullet = new Bullet(this.x + 3, this.y + 3, bulletXVelocity, bulletYVelocity);
            world.bullets.push(bullet);
            bullet = new Bullet(this.x + 3, this.y + 3, bulletXVelocity, bulletYVelocity);
            world.bullets.push(bullet);
        }
    },

    teleport(){
        //blow some particles before we go at player position
        let splode = new Splode(this.x, this.y, 40, COLORS.goldenFizz);
        for(let i = 0; i < 20; i++) {
            let particle = new Particle(this.x + Math.random()*this.width, this.y-5, Math.random()*2 - 1, Math.random() * 2 - 1,
             {color: COLORS.elfGreen, life: 30});
            world.entities.push(particle);
        }
        world.entities.push(splode);

        //this needs to be replaced with call to function that finds nearest walkable tile
        this.x = world.safeSpots[0].x * world.tileSize;
        this.y = world.safeSpots[0].y * world.tileSize;
        
        this.previousX = this.x;
        this.previousY = this.y;
        for(let i = 0; i < 20; i++){
            let particle = new Particle(this.x + Math.random()*this.width, this.y-5, Math.random()*2 - 1, Math.random() * 2 - 1,
            {color: COLORS.elfGreen, life: 30});
           world.entities.push(particle);
        }
    },

    hurt(damage){
        if(this.hurtCooldown <= 0){
            this.hurtCooldown = this.hurtCooldownMax;
            audio.playSound(loader.sounds.playerHurt01, 0, 0.5)
            this.health -= damage;
        }
        if(this.health <= 0){
            this.health = 0;
            gameState = GAMESTATE_GAME_OVER;
        }
    },

    swingSabre(angle=0){
        if (this.swinging) return;
        this.swinging = true;
        this.swingTimer = this.swingTimerMax;
        this.swingDelay = this.swingDelayMax;

        this.swingAngle = angle;
        if (this.swingSwap) {
            this.swingStart = this.swingAngle + Math.PI*.5;
            this.swingEnd = this.swingAngle - Math.PI*.5;
        } else {
            this.swingStart = this.swingAngle - Math.PI*.5;
            this.swingEnd = this.swingAngle + Math.PI*.5;
        }
        this.swing = this.swingStart;
        this.swingSwap = !this.swingSwap;

        let cx = this.x + 3;
        let cy = this.y + 3;
        let s1x = cx + Math.cos(this.swing)*5;
        let s1y = cy + Math.sin(this.swing)*5;
        let s2x = cx + Math.cos(this.swing)*20;
        let s2y = cy + Math.sin(this.swing)*20;
        this.swingBullets = [];
        for (let i=0; i<=5; i++) {
            let k = i*.2;
            let bx = s1x + (s2x-s1x)*k;
            let by = s1y + (s2y-s1y)*k;
            let bullet = new Bullet( bx, by, 0, 0, COLORS.transparent, 5, 5, 90);
            this.swingBullets.push(bullet);
            bullet.allowStatic = true;
            //bullet.dbgCollider = true;
            bullet.indestructable = true;
            bullet.damage = 1;
            bullet.killsTerrain = false;
            world.bullets.push(bullet);
        }

        /*
        let bullet = new Bullet(
            this.x +Math.cos(this.swingAngle) * 15,
            this.y +Math.sin(this.swingAngle) * 15,
             //0, 0, COLORS.transparent,
             0, 0, 'blue',
            20, 20, 90);
        //bullet.dbgCollider = true;
        world.bullets.push(bullet);
        bullet = new Bullet(
            this.x +Math.cos(this.swingAngle-Math.PI/4) * 15,
            this.y +Math.sin(this.swingAngle-Math.PI/4) * 15,
             //0, 0, COLORS.transparent,
             0, 0, 'blue',
            20, 20, 45);
        //bullet.dbgCollider = true;
        world.bullets.push(bullet);
        bullet = new Bullet(
            this.x +Math.cos(this.swingAngle+Math.PI/4) * 15,
            this.y +Math.sin(this.swingAngle+Math.PI/4) * 15,
             //0, 0, COLORS.transparent,
             0, 0, 'blue',
            20, 20, 45);
        //bullet.dbgCollider = true;
        world.bullets.push(bullet);
        */

    },

    mouseSwingSabre(){
        //console.log(`mouseSwingSabre`);
        let worldMouseY = mouse.y + view.y;
        let worldMouseX = mouse.x + view.x;
        let bulletXDistance = worldMouseX - (this.x+3);
        let bulletYDistance = worldMouseY - (this.y+3);
        let angle = Math.atan2(bulletYDistance, bulletXDistance);
        this.swingSabre(angle);

    },

    gamePadSwingSabre(){
        this.swinging = true;
       
        // let worldMouseY = mouse.y + view.y;
        // let worldMouseX = mouse.x + view.x;
        // let bulletXDistance = worldMouseX - this.x;
        // let bulletYDistance = worldMouseY - this.y;
        let angle = Math.atan2(gamepad.rightStick_yAxis(), gamepad.rightStick_xAxis());
        this.swingSabre(angle);
        /*
        this.swingTimer = this.swingTimerMax;
        let bullet = new Bullet(
            this.x +Math.cos(this.swingAngle) * 15,
            this.y +Math.sin(this.swingAngle) * 15,
             0, 0, COLORS.transparent,
            20, 20, 90);
        world.bullets.push(bullet);
        bullet = new Bullet(
            this.x +Math.cos(this.swingAngle-Math.PI/4) * 15,
            this.y +Math.sin(this.swingAngle-Math.PI/4) * 15,
             0, 0, COLORS.transparent,
            20, 20, 45);
        world.bullets.push(bullet);
        bullet = new Bullet(
            this.x +Math.cos(this.swingAngle+Math.PI/4) * 15,
            this.y +Math.sin(this.swingAngle+Math.PI/4) * 15,
             0, 0, COLORS.transparent,
            20, 20, 45);
        world.bullets.push(bullet);
        */

    }



}

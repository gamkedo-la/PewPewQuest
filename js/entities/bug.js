class Bug {
    constructor(tileX, tileY, northTile, southTile, eastTile, westTile) {
        this.tileX = tileX
        this.tileY = tileY
        this.x = tileX * 8;
        this.y = tileY * 8;
        this.northTile = northTile;
        this.southTile = southTile;
        this.eastTile = eastTile;
        this.westTile = westTile;
        this.neighbors = [ northTile, southTile, eastTile, westTile ];
        this.height = 10;
        this.width = 10;
        this.bump = 0;
        this.health = 100;
        this.moveInterval = 5;

        this.collider = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.width,
        }

        this.target = {
            x: this.x,
            y: this.y
        }
        this.previous = {
            x: this.x,
            y: this.y
        }

        this.spritesheet = spritesheet({
            image: img['bug'],
            frameWidth: 16,
            frameHeight: 16,
            frameMargin: 0,
            animations: {

                east: {
                    frames: '0..3',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                },

                west: {
                    frames: '4..7',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                },

                south: {
                    frames: '8..11',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                },

                north: {
                    frames: '12..15',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                },

                southeast: {
                    frames: '16..19',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                },

                southwest: {
                    frames: '20..23',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                },

                northwest: {
                    frames: '24..27',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                },

                northeast: {
                    frames: '28..31',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                },
            }
        })

        this.currentAnimation = this.spritesheet.animations['east'];
        this.directions = ['west', 'northwest', 'north', 'northeast', 'east', 'southeast', 'south', 'southwest'];

    }

    draw() {
        this.currentAnimation.render({
            x: Math.floor(this.x-view.x+this.bump),
            y: Math.floor(this.y-view.y),
            width: 16,
            height: 16
        })    
        if(this.health < 100) {
            fillRect(this.x - view.x, this.y - view.y - 5, this.health/10, 2, COLORS.tahitiGold);
        }
    }

    update() {
        let angle = this.findDirectionTowardsPlayer();
        let moveAmount = 8;
        let moveSpeed = 0.1;
        this.moveInterval = 2;
        
        this.currentAnimation = this.spritesheet.animations[ this.directions[this.findDirection() ] ];
        this.currentAnimation.update();
        if(ticker%this.moveInterval == 0){
            let startTarget = {x: this.target.x, y: this.target.y};
            this.target.x = this.x + (Math.random() * 2 - 1) * 4;
            this.target.y = this.y + (Math.random() * 2 - 1) * 4;
            this.target.x += Math.cos(angle) * moveAmount;
            this.target.y += Math.sin(angle) * moveAmount;
            let i = 1000;

            while(i > 0 && this.checkWorldCollision(this.target.x, this.target.y) ) {
                i--
                this.target.x = startTarget.x;
                this.target.y = startTarget.y;
                this.target.x += (Math.random() * 2 - 1) * 4;
                this.target.y += (Math.random() * 2 - 1) * 4;

            }

            if(this.checkWorldCollision(this.target.x, this.target.y) ) {
                let randomTurnDirection = Math.random() > 0.5 ? 1 : -1;
                this.target.x = startTarget.x;
                this.target.y = startTarget.y;
                this.target.x += (Math.random() * 2 - 1) * 4;
                this.target.y += (Math.random() * 2 - 1) * 4;
                this.target.x  += Math.cos(Math.PI/2) * moveAmount * randomTurnDirection;
                this.target.y  += Math.sin(Math.PI/2) * moveAmount  * randomTurnDirection;

                //this looks bad but it's simple and it works. we've already chosen which direction to turn
                //with randomTurnDirection, now we just keep spinning until we find a spot that's not blocked
                if(this.checkWorldCollision(this.target.x, this.target.y)){
                    this.target.x = startTarget.x;
                    this.target.y = startTarget.y;
                    this.target.x  += Math.cos(Math.PI/2) * moveAmount * randomTurnDirection;
                    this.target.y  += Math.sin(Math.PI/2) * moveAmount * randomTurnDirection;
                    if(this.checkWorldCollision(this.target.x, this.target.y)){
                        this.target.x = startTarget.x;
                        this.target.y = startTarget.y;
                        this.target.x  += Math.cos(Math.PI/2) * moveAmount * randomTurnDirection;
                        this.target.y  += Math.sin(Math.PI/2) * moveAmount  * randomTurnDirection;
                        if(this.checkWorldCollision(this.target.x, this.target.y)){
                            this.target.x = startTarget.x;
                            this.target.y = startTarget.y;
                            this.target.x  += Math.cos(Math.PI/2) * moveAmount * randomTurnDirection;
                            this.target.y  += Math.sin(Math.PI/2) * moveAmount * randomTurnDirection;
                        }
                    }
                }
            }
        }
 
        this.updateCollider();
        if(this.health < 0) {
            this.die();
        }
        this.bump = lerp(this.bump, 0, 0.1);
        this.x = intLerp(this.x, this.target.x, moveSpeed);
        this.y = intLerp(this.y, this.target.y, moveSpeed);

        if(this.checkWorldCollision(this.x, this.y) ) {
            this.x = this.previous.x;
            this.y = this.previous.y;
        }

        if(this.bump < 0.01) { this.bump = 0;}
        
        if(rectCollision(this.collider, player.collider)) {
           if(player.hurtCooldown <= 0) {
                collisionResponse(player, this);
           } 
           player.hurt(10);
           
        }

        world.bullets.forEach(bullet => {
            if(rectCollision(this.collider, bullet.collider)) {
                audio.playSound(loader.sounds[`enemyHurt0${Math.floor(Math.random()*8)}`],
                map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.4, 1+Math.random()*0.2, false);
                this.health -= 10;
                bullet.die();
                this.bump = 5;
            }
        })

        this.previous.x = this.x;
        this.previous.y = this.y;
        
    }

    die() {
        inventory.score+=100;
        audio.playSound(loader.sounds[`bigSplode0${Math.floor(Math.random()*8)}`],
        map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.7, 1+Math.random()*0.2, false);
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.goldenFizz));
        world.entities.splice(world.entities.indexOf(this), 1);

        for(let i = 0; i < 40; i++) {
            let angle = (Math.PI*2/40) * i;
            world.entities.push(new Particle(this.x + this.width/2, this.y + this.width/2, Math.cos(angle)*2, Math.sin(angle)*2, {color: COLORS.goldenFizz, life: Math.random()*20+10, dropChance: 0.05}));
            world.bullets.push(new Bullet(this.x, this.y, Math.cos(angle)*4*Math.random(), Math.sin(angle)*2*Math.random(), COLORS.dirtyRed));
        }

        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.dirtyRed));
    }

    updateCollider() {
        this.collider.x = this.x + 3;
        this.collider.y = this.y + 3;
        this.collider.width = this.width;
        this.collider.height = this.height;
        this.collider.left = this.x + 3;
        this.collider.right = this.x + 3 + this.width;
        this.collider.top = this.y + 3;
        this.collider.bottom = this.y + 3 + this.height;
    }

    checkWorldCollision(X, Y) {
        X = Math.floor(X);
        Y = Math.floor(Y);
        return (
            world.getTileAtPixel(X, Y) != 0 ||
            world.getTileAtPixel(X, Y+this.height) != 0 ||
            world.getTileAtPixel(X+this.width, Y) != 0 ||
            world.getTileAtPixel(X+this.width, Y+this.height) != 0
        )
    }

    findDirection() {
        let xDir = this.target.x - this.x;
        let yDir = this.target.y - this.y;
        let angle = Math.atan2(yDir, xDir);
        // slice of the unit circle that each direction occupies
        let cardinalUnit = (2*Math.PI) / this.directions.length;
        // to map values of -PI to PI to the direction index, first add PI (to give values in the range of 0 to 2*PI), then
        // divide by the "cardinalUnit" or size of each directional slice of the unit circle.  Rounding this will give values
        // in the range from 0 to # of directions + 1.  Mod this by the # of directions to handle the special case of the "west"
        // direction which occurs at the beginning of the range (-PI) and end of the range (PI) of values.
        let dir_i = Math.round((angle + Math.PI) / cardinalUnit) % this.directions.length;
        return dir_i;
    }

    findDirectionTowardsPlayer() {
        let px  = player.x;
        let py = player.y;
        let xDir = px - this.x;
        let yDir = py - this.y;
        let angle = Math.atan2(yDir, xDir);
        return angle;
    }
}
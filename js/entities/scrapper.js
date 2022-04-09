class Scrapper {
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
        this.height = 15;
        this.width = 15;
        this.bump = 0;
        this.health = 100;
        //this.moveInterval = 5;
        this.moveSpeed = 0.2;
        this.moveInterval = 100;

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
            image: img['scrapper'],
            frameWidth: 24,
            frameHeight: 24,
            frameMargin: 0,
            animations: {

                idle_north: {
                    frames: '0..3',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                grab_north: {
                    frames: '4..9',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry_north: {
                    frames: '10..13',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                sleep_north: {
                    frames: '14',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                idle_west: {
                    frames: '15..18',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                grab_west: {
                    frames: '19..24',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry_west: {
                    frames: '25..28',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                sleep_west: {
                    frames: '29',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                idle_south: {
                    frames: '30..33',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                grab_south: {
                    frames: '34..39',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry_south: {
                    frames: '40..43',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                sleep_south: {
                    frames: '44',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                idle_east: {
                    frames: '45..48',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                grab_east: {
                    frames: '49..54',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry_east: {
                    frames: '55..58',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                sleep_east: {
                    frames: '59',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

            }
        })

        this.currentAnimation = this.spritesheet.animations['idle_east'];

        // order here is based on calculation in findDirection
        this.directions = ['west', 'north', 'east', 'south'];
        this.state = 'idle';

    }

    draw() {
        this.currentAnimation.render({
            x: Math.floor(this.x-view.x+this.bump),
            y: Math.floor(this.y-view.y),
            width: 24,
            height: 24
        })
    
        if(this.health < 100) {
            fillRect(this.x - view.x, this.y - view.y - 5, this.health/10, 2, COLORS.tahitiGold);
        }
    }

    update() {
        
        let anim_tag = `${this.state}_${this.directions[this.findDirection()]}`;
        //console.log(`dir: ${this.findDirection()} anim_tag: ${anim_tag}`);
        this.currentAnimation = this.spritesheet.animations[ anim_tag ];
        this.currentAnimation.update();
        if(ticker%this.moveInterval == 0){
            this.target.x = this.x + (Math.random() * 2 - 1) * 15;
            this.target.y = this.y + (Math.random() * 2 - 1) * 15;
            this.targetX += Math.cos(this.findDirectionTowardsPlayer()) * 32;
            this.targetY += Math.sin(this.findDirectionTowardsPlayer()) * 32;

            while(this.checkWorldCollision(this.target.x, this.target.y) ) {
                this.target.x = this.x + (Math.random() * 2 - 1) * 15;
                this.target.y = this.y + (Math.random() * 2 - 1) * 15;
                this.targetX += Math.cos(this.findDirectionTowardsPlayer()) * 32;
                this.targetY += Math.sin(this.findDirectionTowardsPlayer()) * 32;

            }
        }

       
        
        this.updateCollider();
        if(this.health < 0) {
            this.die();
        }
        this.bump = lerp(this.bump, 0, 0.1);
        this.x = intLerp(this.x, this.target.x, 0.1);
        this.y = intLerp(this.y, this.target.y, 0.1);

        if(this.checkWorldCollision(this.x, this.y) ) {
            this.x = this.previous.x;
            this.y = this.previous.y;
        }

        if(this.bump < 0.01) { this.bump = 0;}
        
        if(rectCollision(this.collider, player.collider)) {
            //signal.dispatch('keysChanged', {amount: 1})
            //inventory.items.keys -= 1;
           collisionResponse(player, this);
           
        }

        //todo, need a line vs. rect method for bullets vs evertything

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

        world.worldEntities.splice(world.entities.indexOf(this), 1);

        for(let i = 0; i < 40; i++) {
            let angle = (Math.PI*2/40) * i;
            world.entities.push(new Particle(this.x + this.width/2, this.y + this.width/2, Math.cos(angle)*2, Math.sin(angle)*2, {color: COLORS.goldenFizz, life: Math.random()*20+10}));
            world.bullets.push(new Bullet(this.x, this.y, Math.cos(angle)*4*Math.random(), Math.sin(angle)*2*Math.random(), COLORS.dirtyRed));
        }
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.dirtyRed));
    }

    updateCollider() {
        this.collider.x = this.x;
        this.collider.y = this.y;
        this.collider.width = this.width;
        this.collider.height = this.height;
        this.collider.left = this.x;
        this.collider.right = this.x + this.width;
        this.collider.top = this.y;
        this.collider.bottom = this.y + this.height;
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
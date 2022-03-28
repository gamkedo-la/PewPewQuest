class Enemy {
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
        //
        //this.keysNeeded = this.keyQuantities.filter(element => this.neighbors.includes(element) );
        //this.direction = this.neighbors.indexOf(this.keysNeeded[0]);
        //this.keysRequiredToUnlock = 1 + this.keyQuantities.indexOf(this.keysNeeded[0]);
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

        this.directions = ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east'];

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
        
        this.currentAnimation = this.spritesheet.animations[ this.directions[this.findDirection() ] ];
        this.currentAnimation.update();
        if(ticker%this.moveInterval == 0){
            this.target.x = this.x + (Math.random() * 2 - 1) * 15;
            this.target.y = this.y + (Math.random() * 2 - 1) * 15;
            while(this.checkWorldCollision(this.target.x, this.target.y) ) {
                this.target.x = this.x + (Math.random() * 2 - 1) * 15;
                this.target.y = this.y + (Math.random() * 2 - 1) * 15;
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
            player.collisionResponse();
           
        }

        //todo, need a line vs. rect method for bullets vs evertything

        world.bullets.forEach(bullet => {
            if(rectCollision(this.collider, bullet.collider)) {
                this.health -= 30;
                bullet.die();
                this.bump = 5;
            }
        })

        this.previous.x = this.x;
        this.previous.y = this.y;
        
    }

    die() {
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.goldenFizz));
        world.entities.splice(world.entities.indexOf(this), 1);
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
        let cardinalUnit = Math.PI/4;
        let cardinalAngle = Math.round(angle/cardinalUnit) * cardinalUnit;
       // console.log(Math.round(cardinalAngle/cardinalUnit))
        return clamp( Math.round(cardinalAngle/cardinalUnit), 0, 7);
    }
}
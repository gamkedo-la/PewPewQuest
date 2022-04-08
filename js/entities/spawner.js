class Spawner {
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
        this.height = 16;
        this.width = 16;
        this.bump = 0;
        this.health = 100;
        this.moveInterval = 5;
        this.spawnInterval = 100;

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

        this.spritesheet = spritesheet({
            image: img['spawner'],
            frameWidth: 16,
            frameHeight: 16,
            frameMargin: 0,
            animations: {

                idle: {
                    frames: '0..1',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                spawn: {
                    frames: '2..7',
                    frameRate: 10,
                    loop: false,
                    noInterrupt: true
                }
            }
        })

        this.target = {
            x: this.x,
            y: this.y
        }
        this.spawnTarget = {
            x: this.x,
            y: this.y
        }
        this.previous = {
            x: this.x,
            y: this.y
        }

        this.currentAnimation = this.spritesheet.animations['idle'];
        this.spawning = false;

    }

    draw() {

        fillRect(Math.floor(this.x-view.x+this.bump),
        Math.floor(this.y-view.y), this.width, this.height, COLORS.tahitiGold);

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
        this.currentAnimation.update();
        if (this.spawning) {
            if (this.currentAnimation.done) {
                this.spawning = false;
                this.spawnTarget.x = this.x +  (Math.random() * 2 - 1) * 15;
                this.spawnTarget.y = this.y + (Math.random() * 2 - 1) * 15;
                let bug = new Bug(this.spawnTarget.x/8, this.spawnTarget.y/8);
                world.entities.push(bug);
                this.currentAnimation = this.spritesheet.animations['idle'];
            }
        }
        if(ticker%this.spawnInterval == 0){
            this.spawning = true;
            this.currentAnimation = this.spritesheet.animations['spawn'];
            this.currentAnimation.reset();
        }
        
        this.updateCollider();
        if(this.health < 0) {
            this.die();
        }
        this.bump = lerp(this.bump, 0, 0.1);

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
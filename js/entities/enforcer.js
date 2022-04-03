class Enforcer {
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
        this.height = 32;
        this.width = 32;

        this.armorWidth = 8;
        this.armorHeight = 8;

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

        this.spritesheet = spritesheet({
            image: img['enforcer'],
            frameWidth: 16,
            frameHeight: 16,
            frameMargin: 0,
            animations: {

                idle: {
                    frames: '0..5',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry: {
                    frames: '6..11',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                }
            }
        })

        this.armorPoints = [];

        this.target = {
            x: this.x,
            y: this.y
        }

        this.previous = {
            x: this.x,
            y: this.y
        }

        this.currentAnimation = this.spritesheet.animations['idle'];

        this.states = {
            PLAYER_CAPTURED: 1,
            WANDER: 3,
            CHASE: 4,
            EVADE: 5
        }
    }

    draw() {
        //fillRect(this.x - view.x, this.y - view.y, this.width, this.height, COLORS.dirtyRed);

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
        this.updateCollider();

        //if all armor points are gone, die
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
            this.state = PLAYER_CAPTURED;
        }

        world.bullets.forEach(bullet => {
            //update for four colliders
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
        let cardinalUnit = Math.PI/4;
        let cardinalAngle = Math.round(angle/cardinalUnit) * cardinalUnit;
       // console.log(Math.round(cardinalAngle/cardinalUnit))
        return clamp( Math.round(cardinalAngle/cardinalUnit), 0, 7);
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
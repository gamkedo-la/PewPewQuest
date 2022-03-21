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
        this.keyQuantities = [ONE, TWO, THREE, FOUR, FIVE];
        this.neighbors = [ northTile, southTile, eastTile, westTile ];
        //
        this.keysNeeded = this.keyQuantities.filter(element => this.neighbors.includes(element) );
        this.direction = this.neighbors.indexOf(this.keysNeeded[0]);
        this.keysRequiredToUnlock = 1 + this.keyQuantities.indexOf(this.keysNeeded[0]);
        this.height = 0;
        this.width = 0;
        this.keysDrawTarget = this.keysRequiredToUnlock;
        this.bump = 0;

        this.collider = {
            x: this.x,
            y: this.y,
            width: 8,
            height: 8,
            left: this.x,
            right: this.x + 8,
            top: this.y,
            bottom: this.y + 8,


        }

    }

    draw() {
        fillRect(this.x - view.x, this.y - view.y, this.width, this.height, COLORS.dirtyRed);
    }

    update() {
        this.keysDrawTarget = lerp(this.keysDrawTarget, this.keysRequiredToUnlock, 0.5);
        this.bump = lerp(this.bump, 0, 0.15);
        if(this.bump < 0.01) { this.bump = 0;}
        
        if(rectCollision(this.collider, player.collider)) {
           
        }

        //todo, need a line vs. rect method for bullets vs evertything

        world.bullets.forEach(bullet => {
            if(rectCollision(this.collider, bullet.collider)) {
                bullet.die();
                this.bump = 20;
            }
        })

        
        
    }

    removeBarrier() {
        signal.dispatch("removeBarrier", {item: this});
    }

    updateCollider() {
        this.collider.x = this.x;
        this.collider.y = this.y;
        this.collider.width = 8*this.width;
        this.collider.height = 8*this.height;
        this.collider.left = this.x;
        this.collider.right = this.x + 8*this.width;
        this.collider.top = this.y;
        this.collider.bottom = this.y + 8*this.height;
    }


}
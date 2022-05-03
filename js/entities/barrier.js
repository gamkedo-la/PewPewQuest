class Barrier {
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

        this.xVelocity = 0;
        this.yVelocity = 0;
        this.orientation = 0

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

        switch(this.direction) {
            case NORTH:
                world.setTileAtPosition(this.tileX, this.tileY, 0);
                world.setTileAtPosition(this.tileX, this.tileY-1, 0);
                for(let i = 0; i < view.heightInTiles; i++) {
                    if(world.getTileAtPosition(this.tileX, this.tileY-i) == 0) {
                        if(i > 0){ this.y -= 8;  } //don't offset if we're on the first tile
                        this.height++;
                    }
                    else { break }
                 }
                break;
            case SOUTH:
                world.setTileAtPosition(this.tileX, this.tileY, 0);
                world.setTileAtPosition(this.tileX, this.tileY+1, 0);
                for(let i = 0; i < view.heightInTiles; i++) {
                   if(world.getTileAtPosition(this.tileX, this.tileY+i) == 0) {
                       this.height++;
                   }
                   else { break }
                }
                break;
            case EAST:
                world.setTileAtPosition(this.tileX, this.tileY, 0);
                world.setTileAtPosition(this.tileX+1, this.tileY, 0);
                for(let i = 0; i < view.widthInTiles; i++) {
                    if(world.getTileAtPosition(this.tileX+i, this.tileY) == 0) {
                        this.width++;
                    }
                    else { break }
                 }
                break;
            case WEST:
                world.setTileAtPosition(this.tileX, this.tileY, 0);
                world.setTileAtPosition(this.tileX-1, this.tileY, 0);
                for(let i = 0; i < view.widthInTiles; i++) {
                    if(world.getTileAtPosition(this.tileX-i, this.tileY) == 0) {
                        if(i > 0){ this.x -= 8; } //don't offset if we're on the first tile
                        this.width++;
                    }
                    else { break }
                 }
                break; 
        }
        if(this.width == 0) {
            this.width = 1;
        }
        if(this.height == 0) {
            this.height = 1;
        }
       this.updateCollider();
    }

    draw() {
        fillRect(this.x - view.x, this.y - view.y, 8*this.width, 8*this.height,
            ticker%5 == 0 ? COLORS.dirtyRed : ( this.bump < 1 ? COLORS.tahitiGold : COLORS.white ) );
        //strokeRect(this.x - view.x, this.y - view.y, 8*this.width, 8*this.height, "yellow");

        for(let i = 1; i < this.keysRequiredToUnlock + this.bump; i++) {
            if(this.collider.width > this.collider.height) {
                let spacing = Math.floor(this.collider.width/(this.keysDrawTarget + this.bump));
                fillRect(this.x - view.x + i*spacing, this.y-1 - view.y, 2, 10, `black`);
            } else {
                let spacing = Math.floor(this.collider.height/(this.keysDrawTarget + this.bump));
                fillRect(this.x-1 - view.x, this.y - view.y + i*spacing, 10, 2, `black`);
            }
        }
    }

    update() {
        this.keysDrawTarget = lerp(this.keysDrawTarget, this.keysRequiredToUnlock, 0.5);
        this.bump = lerp(this.bump, 0, 0.15);
        if(this.bump < 0.01) { this.bump = 0;}
        
        if(rectCollision(this.collider, player.collider)) {
            if(inventory.items.keys >= this.keysRequiredToUnlock) {
                inventory.items.keys -= this.keysRequiredToUnlock;
                signal.dispatch("keysChanged", {amount: this.keysRequiredToUnlock});
                this.removeBarrier();
            }
            else {
                audio.playSound(loader.sounds.barrierHit, 0, 0.4)
                signal.dispatch("keysChanged", {amount: inventory.items.keys});
                this.keysRequiredToUnlock -= inventory.items.keys;
                inventory.items.keys = 0;
                
                    collisionResponse(player, this);
                    player.xVelocity = -player.xVelocity;
                    player.yVelocity = -player.yVelocity;
                
                this.bump = 20;
                
                for(let i = 0; i < 10; i++) {
                    if(this.direction == EAST || this.direction == WEST) {
                        let angle = Math.random() > 0.5 ? Math.PI/2 : -Math.PI/2;
                        world.bullets.push(new Bullet(this.x + Math.random()*this.width*8, this.y+Math.random()*this.height*8, Math.cos(angle), Math.sin(angle), COLORS.dirtyRed, 3, 3, 20));
                    }else {
                        let angle = Math.random() < 0.5 ? 0 : Math.PI;
                        world.bullets.push(new Bullet(this.x + Math.random()*this.width*8, this.y+Math.random()*this.height*8, Math.cos(angle), Math.sin(angle), COLORS.dirtyRed, 3, 3, 20));
                    }
                }
            }

        }


        // world.bullets.forEach(bullet => {
        //     if(rectCollision(this.collider, bullet.collider)) {
        //         bullet.die();
        //         //bullet.collisionResponse(this);
        //         this.bump = 20;
        //     }
        // })

        
        
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
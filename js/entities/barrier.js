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
        this.keyQuantities = [ ONE_KEY, TWO_KEY, THREE_KEY, FOUR_KEY, FIVE_KEY ];
        this.neighbors = [ northTile, southTile, eastTile, westTile ];
        this.keysNeeded = this.keyQuantities.filter(element => this.neighbors.includes(element) );
        this.direction = this.neighbors.indexOf(this.keysNeeded[0]);
        this.keysRequiredToUnlock = 1 + this.keyQuantities.indexOf(this.keysNeeded[0]);
        this.height = 0;
        this.width = 0;
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
       this.updateCcollider();
    }

    draw() {
        fillRect(this.x - view.x, this.y - view.y, 8*this.width, 8*this.height, `hsl(${Math.random()*360}, 100%, 40%)`);
        strokeRect(this.x - view.x, this.y - view.y, 8*this.width, 8*this.height, "yellow");

        for(let i = 0; i < this.keysRequiredToUnlock; i++) {
            if(this.collider.width > this.collider.height) {
                let spacing = this.collider.width/this.keysRequiredToUnlock;
                fillRect(this.x - view.x + i*spacing, this.y-1 - view.y, 2, 10, `white`);
            } else {
                let spacing = this.collider.height/this.keysRequiredToUnlock;
                fillRect(this.x-1 - view.x, this.y - view.y + i*spacing, 10, 2, `white`);
            }
        }
    }

    update() {
        if(rectCollision(this.collider, player.collider)) {
            if(inventory.items.keys >= this.keysRequiredToUnlock) {
                inventory.items.keys -= this.keysRequiredToUnlock;
                this.removeBarrier();
            }
            else {
                this.keysRequiredToUnlock -= inventory.items.keys;
                inventory.items.keys = 0;
                player.collisionResponse(this);
            }

        }
        
    }

    removeBarrier() {
        signal.dispatch("removeBarrier", {item: this});
    }

    updateCcollider() {
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
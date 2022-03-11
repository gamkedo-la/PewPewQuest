class Bullet {
    constructor(x,y, xVelocity, yVelocity) {
        this.x = x;
        this.y = y;
        this.xVelocity = xVelocity;
        this.yVelocity = yVelocity;
        this.speed = 0;
        this.prevX = this.x;
        this.prevY = this.y;
        this.life = 100;

    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;
        this.x += this.xVelocity;
        this.y += this.yVelocity;
        this.life--
        if(world.data[ world.pixelToTileIndex(this.x, this.y) ] > 0){
            this.hit();
        }
        if(!inView(this.x, this.y)){
            this.die();
        }
        if(this.life <= 0){
            this.hit();
        }
        if(Math.round(this.xVelocity) == 0 && Math.round(this.yVelocity) == 0){
            this.die();
        }
    }
    
    draw() {
        pixelLine(this.x-view.x, this.y-view.y, this.prevX-view.x, this.prevY-view.y,  '#8888FF');
    }

    hit() {
       //splode?
        let splode = new Splode(this.x, this.y, 10, 'yellow');
        world.entities.push(splode);
        this.die();
    }

    die() {
        world.entities.splice(world.entities.indexOf(this), 1);
    }
}
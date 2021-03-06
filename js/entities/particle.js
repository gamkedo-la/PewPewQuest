class Particle {
    constructor(x,y, xVelocity, yVelocity, options={}) {

        this.type = PARTICLE;
        this.xVelocity = xVelocity;
        this.yVelocity = yVelocity;
        this.color = options.color || '#8888FF';
        this.life = options.life || 10;
        this.drop = options.drop || 0;
        this.dropChance = options.dropChance || 0;
        this.x = x;
        this.y = y;
        this.prevX = this.x;
        this.prevY = this.y;
       
    }

    update() {
        this.prevX = this.x;
        this.prevY = this.y;
        if(!inView(this.x, this.y)){
            this.die();
        }
        this.x += this.xVelocity;
        this.y += this.yVelocity + (Math.random()*2-1);
        this.life--
      
        if(!inView(this.x, this.y)){
            this.die();
        }
        if(this.life <= 0){
            this.die();
        }
        if(Math.round(this.xVelocity) == 0 && Math.round(this.yVelocity) == 0){
            this.die();
        }
    }
    
    draw() {
        pixelLine(this.x-view.x, this.y-view.y, this.prevX-view.x, this.prevY-view.y, this.color);
    }

    die() {
        world.entities.splice(world.entities.indexOf(this), 1);
        if(this.dropChance > Math.random()){
            if(world.getTileAtPixel(this.x, this.y) == 0){
                world.entities.push(new Splode(this.x, this.y, 20, COLORS.atlantis));
                world.entities.push(new Treasure(this.x / 8, this.y / 8));
            }
        }
    }

}
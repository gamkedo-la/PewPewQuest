class Bullet {
    constructor(x,y, xVelocity, yVelocity) {
        this.type = BULLET
        this.x = x;
        this.y = y;
        this.height = 3;
        this.width = 3;
        this.xVelocity = xVelocity;
        this.yVelocity = yVelocity;
        this.speed = 0;
        this.prevX = this.x;
        this.prevY = this.y;
        this.gravity =  0.5;
        this.life = 100;
        this.collider = {
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2,
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
        }

    }

    update() {
        this.updateCollider();
        this.prevX = this.x;
        this.prevY = this.y;
        this.x += this.xVelocity;
        this.y += this.yVelocity + (Math.random()*2-1);
        //this.yVelocity += this.gravity;
        this.life--
      

        if(world.data[ world.pixelToTileIndex(this.x, this.y) ] > 0){
           
            this.hit();
            if(world.data[ world.pixelToTileIndex(this.x, this.y) ] == COLOR_VALHALLA) {
                world.data[ world.pixelToTileIndex(this.x, this.y) ] = 0;
                this.hit();
            }
        }
        if(!inView(this.x, this.y)){
            this.x = this.prevX;
            this.y = this.prevY;
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
       if(inView(this.x, this.y)){
        let splode = new Splode(this.x, this.y, 5, COLORS.veniceBlue);
        world.entities.push(splode);
      

       }
        this.die();
    }

    die() {
        //	this.playSound = function(buffer, pan = 0, vol = 1, rate = 1, loop = false) {
        //let splode = new Splode(this.x, this.y, 10, 'yellow');
        //world.entities.push(splode);

        audio.playSound(loader.sounds[`splode0${Math.floor(Math.random()*8)}`], map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.3, 1+Math.random()*0.2, false);
        world.bullets.splice(world.bullets.indexOf(this), 1);
    }

    updateCollider() {
        this.collider.top = this.y - this.height / 2;
        this.collider.bottom = this.y + this.height / 2;
        this.collider.left = this.x - this.width / 2;
        this.collider.right = this.x + this.width / 2;
    }
}
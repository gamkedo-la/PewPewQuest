class Bullet {
    constructor(x,y, xVelocity, yVelocity, color= '#8888FF', width = 3, height = 3, life = 100, enemy=false, damage=1) {
        this.type = BULLET
        this.enemy = enemy;
        this.color = color;
        this.damage = damage;
        this.x = x;
        this.y = y;
        this.height = width;
        this.width = height;
        this.xVelocity = xVelocity;
        this.yVelocity = yVelocity;
        this.speed = 0;
        this.prevX = this.x;
        this.prevY = this.y;
        this.gravity =  0.5;
        this.life = life;
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
        this.x += this.xVelocity + (Math.random()*1-0.5);;
        this.y += this.yVelocity + (Math.random()*1-0.5);
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
        pixelLine(this.x-view.x, this.y-view.y, this.prevX-view.x, this.prevY-view.y, this.color);
        //fillRect(this.collider.left-view.x, this.collider.top-view.y, this.collider.right - this.collider.left, this.collider.bottom - this.collider.top, 'rgba(255, 0,0,0.3)');

    }

    hit() {
       //splode?
       if(inView(this.x, this.y)){
        let splode = new Splode(this.x, this.y, 5, COLORS.veniceBlue);
        world.entities.push(splode);
        for(let i = 0; i < 10; i++) {
            let particle = new Particle(this.x, this.y, 
               ( -this.xVelocity * Math.random()*2-1) * .1, 
               ( -this.yVelocity * Math.random()*2-1) * .1, {color:COLORS.goldenFizz, life: 30});
            world.entities.push(particle);
        }
      

       }
        this.die();
    }

    die() {
        //	this.playSound = function(buffer, pan = 0, vol = 1, rate = 1, loop = false) {
        //let splode = new Splode(this.x, this.y, 10, 'yellow');
        //world.entities.push(splode);

        audio.playSound(loader.sounds[`splode0${Math.floor(Math.random()*8)}`], map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.1, 1+Math.random()*0.2, false);
        if (this.enemy) {
            world.enemyBullets.splice(world.bullets.indexOf(this), 1);
        } else {
            world.bullets.splice(world.bullets.indexOf(this), 1);
        }
    }

    updateCollider() {
        this.collider.top = this.y - this.height / 2;
        this.collider.bottom = this.y + this.height / 2;
        this.collider.left = this.x - this.width / 2;
        this.collider.right = this.x + this.width / 2;
    }
}
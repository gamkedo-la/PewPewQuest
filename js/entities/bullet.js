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
        this.angle = 0;
        this.angleRate = 0;
        this.radius = 1;
        this.particles = 0;
        this.particleColor = COLORS.mandy;
        this.maxParticleTicks = 0;
        this.particleTicks = 0;
        this.allowStatic = false;
        this.indestructable = false;
        this.killsTerrain = true;
        this.collider = {
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2,
            left: this.x - this.width / 2,
            right: this.x + this.width / 2,
        }

    }

    update() {
        if (this.angleRate) {
            this.angle += this.angleRate;
            this.angle = clampRoll(this.angle, 0, Math.PI*2);
        }
        this.updateCollider();
        this.prevX = this.x;
        this.prevY = this.y;
        this.x += this.xVelocity + (Math.random()*1-0.5);;
        this.y += this.yVelocity + (Math.random()*1-0.5);
        this.life--
      

        if(world.data[ world.pixelToTileIndex(this.x, this.y) ] > 0){
           
            this.hit();
            if(this.killsTerrain && world.data[ world.pixelToTileIndex(this.x, this.y) ] == COLOR_VALHALLA) {
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
            this.die();
        }
        if(!this.allowStatic && (Math.round(this.xVelocity) == 0 && Math.round(this.yVelocity) == 0)){
            this.die();
        }

        // particles
        if (this.particles) {
            if (this.particleTicks-- <= 0) {
                this.particleTicks = this.maxParticleTicks;
                let dx = this.x-this.prevX;
                let dy = this.y-this.prevY;
                let angle = Math.atan2(dy, dx);
                let x = this.x - Math.cos(angle)*this.radius;
                let y = this.y - Math.sin(angle)*this.radius;
                for(let i = 0; i < this.particles; i++) {
                    let particle = new Particle(
                        x + randomRange(-this.radius, this.radius),
                        y + randomRange(-this.radius, this.radius),
                        -Math.cos(angle)*this.radius/3, 
                        -Math.sin(angle)*this.radius/3, 
                        {color: this.particleColor, life: Math.random() * 10}
                    );
                    world.entities.push(particle);
                }
            }
        }
    }

    draw() {
        let x = this.x-view.x;
        let y = this.y-view.y;
        let px = this.prevX-view.x;
        let py = this.prevY-view.y;
        if (this.dbgCollider) {
            canvasContext.strokeStyle = 'red';
            canvasContext.strokeRect(x-this.width/2, y-this.height/2, this.width, this.height);
        }
        if (this.radius <= 1) {
            pixelLine(x, y, px, py, this.color);
        } else {
            let r = this.radius;
            strokePolygon(x,y,r,4, this.angle, this.color);
        }

    }

    hit() {
       if(inView(this.x, this.y)){
        let splode = new Splode(this.x, this.y, 5, COLORS.viking);
        world.entities.push(splode);
        for(let i = 0; i < 10; i++) {
            let particle = new Particle(this.x, this.y, 
               ( -this.xVelocity * Math.random()*2-1) * .1, 
               ( -this.yVelocity * Math.random()*2-1) * .1, {color:COLORS.goldenFizz, life: 30});
            world.entities.push(particle);
        }
      
       }
       if (!this.indestructable) {
            this.die();
       }
    }

    die() {
        //	this.playSound = function(buffer, pan = 0, vol = 1, rate = 1, loop = false) {
        //let splode = new Splode(this.x, this.y, 10, 'yellow');
        //world.entities.push(splode);

        audio.playSound(loader.sounds[`splode0${Math.floor(Math.random()*8)}`], map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.1, 1+Math.random()*0.2, false);
        if (this.enemy) {
            world.enemyBullets.splice(world.enemyBullets.indexOf(this), 1);
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
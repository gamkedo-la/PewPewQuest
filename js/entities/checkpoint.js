class Checkpoint {
    constructor(tileX, tileY, northTile, southTile, eastTile, westTile) {
        this.type = SAFE_SPOT;
        this.tileX = tileX
        this.tileY = tileY
        this.x = tileX * 8;
        this.y = tileY * 8;
        this.bump = 0;

        this.width = 26;
        this.height = 26;
        this.checked = false;
        this.spinTicks = 0;
        this.maxSpinTicks = 40;

        this.collider = {
            x: this.x+3,
            y: this.y+3,
            width: this.width-6,
            height: this.height-6,
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.width,
        };

        this.spritesheet = spritesheet({
            image: img['checkpoint_v1'],
            frameWidth: 26,
            frameHeight: 26,
            frameMargin: 0,
            animations: {

                unchecked: {
                    frames: '16..17',
                    frameRate: 5,
                    loop: true,
                    noInterrupt: true
                },

                spinning: {
                    frames: '0..7',
                    frameRate: 60,
                    loop: true,
                    noInterrupt: true
                },

                checked: {
                    frames: 18,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

            }
        });
        this.currentAnimation = this.spritesheet.animations['unchecked'];
        this.angle = 0;
        this.angleRate = .03;
        this.maxShotTicks = 20;
        this.shotTicks = 20;
        this.turretAngles = [Math.PI*.5, Math.PI*1.17, -Math.PI*.17];

    }

    fireBullet() {
        audio.playSound(loader.sounds.pewpew2, 0, 0.1)

        for (const tangle of this.turretAngles) {
            let targetAngle = this.angle + tangle;
            let tax = Math.cos(targetAngle);
            let tay = Math.sin(targetAngle);
            let fx = this.collider.left + this.width/2 + tax*12;
            let fy = this.collider.top + this.height/2 + tay*12;

            let bullet = new Bullet(fx, fy, tax, tay, COLORS.dirtyRed, 3, 3, 400);
            bullet.enemy = true;
            bullet.actor = this;
            bullet.radius = 2;
            bullet.angleRate = randomRange(-.3,.3);
            bullet.particles = 1;
            bullet.particleColor = COLORS.tahitiGold;
            bullet.maxParticleTicks = 3;
            world.enemyBullets.push(bullet);
        }
    }

    update() {
        this.updateCollider();
        this.currentAnimation.update();

        this.shotTicks--;
        if (this.shotTicks <= 0) {
            this.shotTicks = this.maxShotTicks;
            this.fireBullet();
        }

        this.angle += this.angleRate;
        this.angle = clampRoll(this.angle, 0, Math.PI*2);

        world.bullets.forEach(bullet => {
            if(rectCollision(this.collider, bullet.collider)) {
                this.currentAnimation = this.spritesheet.animations['spinning'];
                this.spinTicks = this.maxSpinTicks;
                //this.currentAnimation.reset();
                this.saved = true;
                this.bump = 5;
                bullet.hit();
                bullet.die();
            }
        });

        if (this.spinTicks > 0) {
            this.spinTicks--;
            if (this.spinTicks <= 0) {
                this.currentAnimation = this.spritesheet.animations['checked'];
            }
        }

    }
    
    draw() {
        let w = this.collider.right - this.collider.left;
        let h = this.collider.bottom - this.collider.top;
        let x = this.collider.left - view.x + w/2;
        let y = this.collider.top - view.y + h/2;

        canvasContext.save();
        canvasContext.translate(x,y);
        canvasContext.rotate(this.angle);

        this.currentAnimation.render({
            x: -w/2,
            y: -h/2,
            width: this.width,
            height: this.height
        });

        canvasContext.restore();

    }

    updateCollider() {
        this.collider.x = this.x+3;
        this.collider.y = this.y+3;
        this.collider.width = this.width-6;
        this.collider.height = this.height-6;
        this.collider.left = this.x;
        this.collider.right = this.x + this.width;
        this.collider.top = this.y;
        this.collider.bottom = this.y + this.height;
    }

}
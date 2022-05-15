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
        this.angleDecay = .01;
        this.maxHealth = this.health = 150;
        // -- range in which player needs to approach/attack from ... outside this range attacks do nothing
        this.dangerRange = 100;

        // -- determine power by adjacent counters
        let powers = [ONE, TWO, THREE, FOUR, FIVE];
        let neighbors = [ northTile, southTile, eastTile, westTile ];
        let whichPowers = powers.filter(element => neighbors.includes(element) );
        this.power = clamp(whichPowers.reduce((acc,element) => acc+powers.indexOf(element)+1, 0), 1, 5);
        //console.log(`--- power is: ${this.power}`);


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
                right: {
                    frames: [16,17],
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
                boom: {
                    frames: [10,16,18,17],
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
                delay: {
                    frames: [10,17],
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
                left: {
                    frames: [10,18],
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
            }
        });

        // variables managed by state
        this.cycle = ['left', 'delay', 'right', 'delay', 'boom', 'delay'];
        this.state; 
        this.stateIndex = 0;
        this.shooting = false; 
        this.cycleTicks = 0; 
        this.angleRate = 0;
        this.maxShotTicks = 0;
        this.shotColor = COLORS.dirtyRed;
        this.particleColor = COLORS.tahitiGold;
        this.currentAnimation = this.spritesheet.animations['left'];
        this.shotTicks = 0;
        this.advanceState();

        this.angle = 0;
        this.shotTick = 1;
        this.turretAngles = [Math.PI*.5, Math.PI*1.17, -Math.PI*.17];

        this.bullets = [];
        this.shieldTicks = 0;
        this.shieldOffset = 0;
    }

    fireBullet() {
        audio.playSound(loader.sounds.pewpew2, 0, 0.1)
        for (const tangle of this.turretAngles) {
            let targetAngle = this.angle + tangle;
            let tax = Math.cos(targetAngle);
            let tay = Math.sin(targetAngle);
            let fx = this.collider.left + this.width/2 + tax*12;
            let fy = this.collider.top + this.height/2 + tay*12;
            let bullet = new Bullet(fx, fy, tax, tay, this.shotColor, 3, 3, 400);
            bullet.damage = 50;
            bullet.enemy = true;
            bullet.actor = this;
            bullet.radius = 2;
            bullet.angleRate = randomRange(-.3,.3);
            bullet.particles = 1;
            bullet.particleColor = this.particleColor;
            bullet.maxParticleTicks = 3;
            world.enemyBullets.push(bullet);
            this.bullets.push(bullet);
        }
    }

    findPlayerRange() {
        let center = {x: this.x + this.width/2, y: this.y + this.height/2};
        return distanceBetweenPoints(center, player);
    }

    advanceState() {
        this.stateIndex = (this.stateIndex+1)%this.cycle.length;
        let nextState = this.cycle[this.stateIndex];
        switch (nextState) {
            case 'left':
                this.cycleTicks = 240;
                this.angleRate = -.12;
                this.shooting = true;
                this.maxShotTicks = weightedLerp(1,5, 30,10, this.power);
                this.shotColor = COLORS.tahitiGold;
                this.particleColor = COLORS.goldenFizz;
                break;
            case 'right':
                this.cycleTicks = 240;
                this.angleRate = .12;
                this.shooting = true;
                this.maxShotTicks = weightedLerp(1,5, 30,10, this.power);
                this.shotColor = COLORS.dirtyRed;
                this.particleColor = COLORS.valhalla;
                break;
            case 'delay':
                this.cycleTicks = 60;
                this.shooting = false;
                break;
            case 'boom':
                this.cycleTicks = Math.round(weightedLerp(1,5, 45,90, this.power));
                this.angleRate = 1;
                this.shooting = true;
                this.maxShotTicks = weightedLerp(1, 5, 4, 0, this.power);
                this.shotTicks = 0;
                break;
        }
        this.state = nextState;
        this.currentAnimation = this.spritesheet.animations[this.state];
    }

    update() {
        // -- range to playerd
        let maxr = 175;
        let minr = 50;
        this.playerRange = this.findPlayerRange();
        let distanceFactor = weightedLerp(maxr,minr,.4,1,clamp(this.playerRange, minr, maxr));
        let center = {x: this.x + this.width/2, y: this.y + this.height/2};

        // prune bullet list
        let old = this.bullets;
        this.bullets = this.bullets.filter((v) => world.enemyBullets.includes(v));

        // cycle
        if (this.state === 'delay' && this.angleRate) {
            if (this.angleRate > 0) {
                this.angleRate -= this.angleDecay;
            } else {
                this.angleRate += this.angleDecay;
            }
            if (Math.abs(this.angleRate) < this.angleDecay) this.angleRate = 0;
        } else {
            this.cycleTicks--;
            if (this.cycleTicks <= 0) {
                this.advanceState();
            }
        }

        this.updateCollider();
        this.currentAnimation.update();

        if (this.shooting) {
            let tock = this.shotTick*distanceFactor;
            this.shotTicks -= tock;
            if (this.shotTicks <= 0) {
                this.shotTicks = Math.max(0, this.maxShotTicks + this.shotTicks);
                this.fireBullet();
            }
            if (this.state === 'boom') {
                if (this.shotColor === COLORS.dirtyRed) {
                    this.shotColor = COLORS.tahitiGold;
                    this.particleColor = COLORS.goldenFizz;
                } else {
                    this.shotColor = COLORS.dirtyRed;
                    this.particleColor = COLORS.tahitiGold;
                }
            }
        }

        this.angle += this.angleRate*distanceFactor;
        this.angle = clampRoll(this.angle, 0, Math.PI*2);

        world.bullets.forEach(bullet => {
            // check for collisions against my bullets
            for (const mine of this.bullets) {
                if(rectCollision(mine.collider, bullet.collider)) {
                    bullet.hit();
                }
            }
            // if player is not within "danger range"
            if (this.playerRange >= this.dangerRange) {
                let brange = distanceBetweenPoints(center, bullet);
                if (brange < 25) {
                    bullet.hit();
                    this.shotTicks = 0;
                    this.flashTicks = 30;
                }
            } else {
                if(rectCollision(this.collider, bullet.collider)) {
                    bullet.hit();
                    this.shotTicks = 0;
                    this.health -= bullet.damage;
                }
            }
        });

        if(this.health < 0) {
            this.die();
        }

        if (this.flashTicks) this.flashTicks--;

        // shield offset
        if (this.shieldTicks-- <= 0) {
            this.shieldTicks = 5;
            this.shieldOffset++;
            if (this.shieldOffset >= 10) this.shieldOffset = 0;
        }

    }

    die() {
        inventory.score+=5000;
        audio.playSound(loader.sounds[`bigSplode0${Math.floor(Math.random()*8)}`],
            map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.7, 1+Math.random()*0.2, false);
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.goldenFizz));

        for(let i = 0; i < 20; i++) {
            let angle = (Math.PI*2/40) * i;
            world.entities.push(new Particle(this.x + this.width/2, this.y + this.width/2, Math.cos(angle)*2, Math.sin(angle)*2, {color: COLORS.goldenFizz, life: Math.random()*20+10}));
            world.bullets.push(new Bullet(this.x, this.y, Math.cos(angle)*4*Math.random(), Math.sin(angle)*2*Math.random(), COLORS.dirtyRed));
        }
        
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.dirtyRed));
        world.entities.splice(world.entities.indexOf(this), 1);
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
        // shield
        if (this.playerRange > this.dangerRange) {
            let shieldColor = COLORS.deepKoamaru;
            if (this.flashTicks && (ticker % 6)>=3) shieldColor = COLORS.cornflower;
            canvasContext.beginPath();
            canvasContext.setLineDash([5,5]);
            canvasContext.lineDashOffset = this.shieldOffset;
            canvasContext.arc(x, y, 20, 0, Math.PI*2);
            canvasContext.strokeStyle = shieldColor;
            canvasContext.stroke();
            canvasContext.beginPath();
            canvasContext.setLineDash([5,5]);
            canvasContext.lineDashOffset = -this.shieldOffset;
            canvasContext.arc(x, y, 18, 0, Math.PI*2);
            canvasContext.strokeStyle = shieldColor;
            canvasContext.stroke();
            canvasContext.setLineDash([]);
        }
        if(this.health < this.maxHealth) {
            fillRect(this.x - view.x, this.y - view.y - 5, this.health/5, 2, COLORS.tahitiGold);
        }
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
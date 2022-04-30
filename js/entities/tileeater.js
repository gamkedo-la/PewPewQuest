
/**
 * armor point centered at x,y
 */
class ArmorPoint {
    constructor(spec={}) {
        this.x = spec.x || 0;
        this.y = spec.y || 0;
        this.height = spec.height || 4;
        this.width = spec.width || 4;
        this.halfHeight = this.height/2;
        this.halfWidth = this.width/2;
        this.health = spec.health || 100;
        this.color = spec.color || COLORS.dirtyRed;
        this.bump = 0;
    }
    get left() {
        return this.x-this.halfWidth;
    }
    get right() {
        return this.x+this.halfWidth;
    }
    get top() {
        return this.y-this.halfHeight;
    }
    get bottom() {
        return this.y+this.halfHeight;
    }

    draw() {
        if (this.health > 0) {
            fillRect( Math.floor(this.left-view.x + (ticker%2==0?this.bump:-this.bump) ),
                    Math.floor(this.top-view.y),
                    this.width, this.height, this.color );
        }
    }
}

class Tileeater {
    constructor(tileX, tileY, northTile, southTile, eastTile, westTile) {
        this.type = TILE_EATER;
        this.tileX = tileX
        this.tileY = tileY
        this.x = tileX * 8;
        this.y = tileY * 8;
        this.northTile = northTile;
        this.southTile = southTile;
        this.eastTile = eastTile;
        this.westTile = westTile;
        this.neighbors = [ northTile, southTile, eastTile, westTile ];
        this.height = 68;
        this.width = 68;
        this.bump = 0;
        //this.moveInterval = 5;
        this.moveSpeed = 0.2;
        this.moveInterval = 100;

        this.firingRange = 100;
        this.collisionRange = 32;

        this.scrappers = [];

        this.r1angle = 0;
        this.r2angle = 0;
        this.r3angle = 0;
        this.r1rate = .02;
        this.r2rate = -.03;
        this.r3rate = .01;
        this.r1recalc = 0;
        this.r2recalc = 0;
        this.r3recalc = 0;

        this.r1alive = true;
        this.r2alive = true;
        this.r2health = 50;
        this.r2alive = true;
        this.r3health = 50;
        this.hurtTicks = 0;

        this.collider = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            left: this.x,
            right: this.x + this.width,
            top: this.y,
            bottom: this.y + this.width,
        }

        this.apAngles = [.42, 1.15, Math.PI-1.15, Math.PI-.42, -.42, -1.15, -Math.PI+1.15, -Math.PI+.42];
        this.apRadius = 31;
        this.armorPoints = this.apAngles.map(angle => 
            new ArmorPoint({
                x: this.x + this.width/2 + Math.cos(this.r1angle+angle)*this.apRadius, 
                y: this.y + this.height/2 + Math.sin(this.r1angle+angle)*this.apRadius,
            })
        );
        this.health = this.armorPoints.reduce((acc, armorPoint) => {acc += armorPoint.health; return acc}, 0);
        this.maxHealth = this.health;

        this.tilesEaten = [];

        this.target = {
            x: this.x,
            y: this.y
        }
        this.previous = {
            x: this.x,
            y: this.y
        }

        this.children = 2; //eventually will be defined by neighbor tile, logic same as doorkey

        for(let i=0; i<this.children; i++) {
            let scrapper = new Scrapper(tileX, tileY, this);
            //world.worldEntities.push(scrapper);
            this.scrappers[i] = scrapper;
        }

        this.r1sprites = spritesheet({
            image: img['tileeater_r1'],
            frameWidth: 68,
            frameHeight: 68,
            frameMargin: 0,
            animations: {
                idle: {
                    frames: 0,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
                hurt: {
                    frames: 10,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
            }
        })

        this.r2sprites = spritesheet({
            image: img['tileeater_r2'],
            frameWidth: 68,
            frameHeight: 68,
            frameMargin: 0,
            animations: {
                idle: {
                    frames: 0,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
                alarm: {
                    frames: '1..2',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
                firing: {
                    frames: '3..9',
                    frameRate: 8,
                    loop: true,
                    noInterrupt: true
                },
                hurt: {
                    frames: 10,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
            }
        })

        this.r3sprites = spritesheet({
            image: img['tileeater_r3'],
            frameWidth: 68,
            frameHeight: 68,
            frameMargin: 0,
            animations: {
                idle: {
                    frames: 0,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
                alarm: {
                    frames: '1..2',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
                hurt: {
                    frames: 10,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },
            }
        })

        this.r1anim = this.r1sprites.animations['idle'];
        this.r2anim = this.r2sprites.animations['idle'];
        this.r3anim = this.r3sprites.animations['idle'];

        let dockoff = 8;
        let scrapperOffset = {
            x: -12,
            y: -12,
        }
        // directions here come from the scrapper definition
        this.dockpoints = [
            {x: this.x+this.width/2+scrapperOffset.x, y:this.y+scrapperOffset.y+dockoff, state: 'dock_north', dir: 1, unloadAnim: 'unload_north'},
            {x: this.x+this.width/2+scrapperOffset.x, y:this.y+scrapperOffset.y+this.height-dockoff, state: 'dock_south', dir: 3, unloadAnim: 'unload_south'},
            {x: this.x+scrapperOffset.x+dockoff, y: this.y+this.height/2+scrapperOffset.y, state: 'dock_west', dir: 0, unloadAnim: 'unload_west'},
            {x: this.x+scrapperOffset.x+this.width-dockoff, y: this.y+this.height/2+scrapperOffset.y, state: 'dock_east', dir: 2, unloadAnim: 'unload_east'},
        ]

        // order here is based on calculation in findDirection
        //this.directions = ['west', 'north', 'east', 'south'];
        this.state = 'idle';

    }

    draw() {
        let w = this.collider.right - this.collider.left;
        let h = this.collider.bottom - this.collider.top;
        let x = this.collider.left - view.x + w/2;
        let y = this.collider.top - view.y + h/2;

        //tiles eaten
        for(let i=0; i<this.tilesEaten.length; i++) {
            let tile = this.tilesEaten[i];
            world.drawImageTileAt(x+view.x + Math.random()*16-12, y+view.y + Math.random()*16-12, tile);
        }


        // -- outer ring
        canvasContext.save();
        canvasContext.translate(x,y)
        if (this.r1alive) {
            canvasContext.rotate(this.r1angle);
            if (this.hurtTicks) {
                let anim = this.r1sprites.animations['hurt'];
                anim.render({
                    x: -w/2,
                    y: -h/2,
                    width: w,
                    height: h
                })
            } else {
                this.r1anim.render({
                    x: -w/2,
                    y: -h/2,
                    width: w,
                    height: h
                })
            }
            canvasContext.rotate(-this.r1angle);
        }
        // -- middle ring
        if (this.r2alive) {
            canvasContext.rotate(this.r2angle);
            if (!this.r1alive && this.hurtTicks) {
                let anim = this.r2sprites.animations['hurt'];
                anim.render({
                    x: -w/2,
                    y: -h/2,
                    width: w,
                    height: h
                })
            } else {
                this.r2anim.render({
                    x: -w/2,
                    y: -h/2,
                    width: w,
                    height: h
                })
            }
            canvasContext.rotate(-this.r2angle);
        }
        // -- inner ring
        canvasContext.rotate(this.r3angle);
        if (!this.r1alive && !this.r2alive && this.hurtTicks) {
            let anim = this.r3sprites.animations['hurt'];
            anim.render({
                x: -w/2,
                y: -h/2,
                width: w,
                height: h
            })
        } else {
            this.r3anim.render({
                x: -w/2,
                y: -h/2,
                width: w,
                height: h
            })
        }
        canvasContext.restore();

        // -- health bar
        if(this.health < this.maxHealth) {
            fillRect(this.x-5 - view.x, this.y - view.y - 8, this.health/20, 2, COLORS.tahitiGold);
        }


        // dbg
        // fillRect(this.x-view.x+this.width/2-2, this.y-view.y+this.height/2-2, 4, 4, "green");
        // fillRect(this.collider.left-view.x, this.collider.top-view.y, w, h, 'rgba(255,0,0,.15)');
        // for (const dp of this.dockpoints) fillRect(dp.x-view.x-2, dp.y-view.y-2, 4, 4, COLORS.topaz);

        // armor points
        for (const ap of this.armorPoints) {
            ap.draw();
        }

        // scrappers
        for (const scrapper of this.scrappers) {
            scrapper.draw();
        }
    }

    rotateTo(which, targetAngle, rate) {
        let angleTag = `${which}angle`;
        let rateTag = `${which}rate`;
        let delta = clampRoll(targetAngle - this[angleTag], -Math.PI, Math.PI);
        if (Math.abs(delta) < .1) {
            this[rateTag] = 0;
            this[angleTag] = targetAngle;
            return true;
        } else {
            this[rateTag] = (delta > 0) ? rate : -rate;
            return false;
        }
    }

    updateDock(targetAngle) {
        this.rotateTo('r1', targetAngle, .04);
        this.rotateTo('r2', targetAngle, .04);
        this.rotateTo('r3', targetAngle, .04);
        if (this.r1rate === 0 && this.r2rate === 0 && this.r3rate === 0) {
            if (!this.dockLocked) {
                this.dockLocked = true;
                this.delay = 40;
            } else {
                if (this.delay > 0) {
                    this.delay--;
                } else {
                    this.dockLocked = false;
                    this.state = 'idle';
                }
            }
        }
    }

    fireBullet() {
        let tax = Math.cos(this.targetAngle);
        let tay = Math.sin(this.targetAngle);
        let fx = this.collider.left + this.width/2 + tax*36;
        let fy = this.collider.top + this.height/2 + tay*36;
        audio.playSound(loader.sounds.pewpew2, 0, 0.1)
        for (let i=0; i<randomInt(2,8); i++) {
            let bullet = new Bullet(fx, fy, tax, tay, '#F00', 3, 3, 400);
            bullet.enemy = true;
            bullet.actor = this;
            world.enemyBullets.push(bullet);
        }
    }

    update() {
        
        // -- range to playerd
        let range = this.findPlayerRange();

        switch (this.state) {
            case 'idle': {
                // adjust ring rotation rates
                this.r1recalc--;
                if (this.r1rate === 0 || this.r1recalc <= 0) {
                    this.r1rate = randomRange(0.015, 0.03);
                    if (Math.random() > .5) this.r1rate = -this.r1rate;
                    this.r1recalc = randomInt(60,150);
                }
                this.r2recalc--;
                if (this.r2rate === 0 || this.r2recalc <= 0) {
                    this.r2rate = randomRange(0.015, 0.03);
                    if (Math.random() > .5) this.r2rate = -this.r2rate;
                    this.r2recalc = randomInt(60,150);
                }
                this.r3recalc--;
                if (this.r3rate === 0 || this.r3recalc <= 0) {
                    this.r3rate = randomRange(0.015, 0.03);
                    if (Math.random() > .5) this.r3rate = -this.r3rate;
                    this.r3recalc = randomInt(60,150);
                }
                // detect state change
                if (range < this.firingRange && this.r2alive) {
                    this.state = 'aiming';
                    this.r1anim = this.r1sprites.animations['idle'];
                    this.r2anim = this.r2sprites.animations['idle'];
                    this.r3anim = this.r3sprites.animations['alarm'];
                }
                // -- movement
                if(ticker%this.moveInterval == 0){
                    this.target.x = this.x + (Math.random() * 2 - 1) * 15;
                    this.target.y = this.y + (Math.random() * 2 - 1) * 15;
                }

                break;
            }

            case 'aiming': {
                if (range > this.firingRange || !this.r2alive) {
                    this.state = 'idle';
                    this.r1anim = this.r1sprites.animations['idle'];
                    this.r2anim = this.r2sprites.animations['idle'];
                    this.r3anim = this.r3sprites.animations['idle'];
                    break;
                }
                // determine angle to target
                this.targetAngle = clampRoll(this.findDirectionTowardsPlayer(), 0, Math.PI*2);
                // check if close enough to player angle, fire
                if (this.rotateTo('r2', this.targetAngle+Math.PI*.5, .04)) {
                    this.state = 'firing';
                    this.r1anim = this.r1sprites.animations['idle'];
                    this.r2anim = this.r2sprites.animations['firing'];
                    this.r2anim.reset();
                    this.r3anim = this.r3sprites.animations['alarm'];
                    this.delay = 40;
                }
                let r3target = 0;
                this.rotateTo('r3', r3target, .04);
                break;
            }

            case 'firing': {
                if (!this.r2alive) {
                    this.state = 'idle';
                    this.r1anim = this.r1sprites.animations['idle'];
                    this.r2anim = this.r2sprites.animations['idle'];
                    this.r3anim = this.r3sprites.animations['idle'];
                }
                if (this.delay) {
                    this.delay--;
                } else {
                    if (range < this.firingRange) {
                        this.fireBullet();
                        this.state = 'aiming';
                        this.r1anim = this.r1sprites.animations['idle'];
                        this.r2anim = this.r2sprites.animations['idle'];
                        this.r3anim = this.r3sprites.animations['alarm'];
                    } else {
                        this.state = 'idle';
                        this.r1anim = this.r1sprites.animations['idle'];
                        this.r2anim = this.r2sprites.animations['idle'];
                        this.r3anim = this.r3sprites.animations['idle'];
                    }
                }
                break;
            }

            case 'dock_east': {
                let targetAngle = Math.PI *1.5;
                this.updateDock(targetAngle);
                break;
            }

            case 'dock_west': {
                let targetAngle = Math.PI *.5;
                this.updateDock(targetAngle);
                break;
            }

            case 'dock_north': {
                let targetAngle = Math.PI;
                this.updateDock(targetAngle);
                break;
            }

            case 'dock_south': {
                let targetAngle = 0;
                this.updateDock(targetAngle);
                break;
            }


        }

        // update angles
        this.r1angle += this.r1rate;
        this.r2angle += this.r2rate;
        this.r3angle += this.r3rate;
        this.r1angle = clampRoll(this.r1angle, 0, Math.PI*2);
        this.r2angle = clampRoll(this.r2angle, 0, Math.PI*2);
        this.r3angle = clampRoll(this.r3angle, 0, Math.PI*2);

        // update animations
        this.r1anim.update();
        this.r2anim.update();
        this.r3anim.update();
        
        this.updateCollider();

        this.bump = lerp(this.bump, 0, 0.1);
        this.x = intLerp(this.x, this.target.x, 0.1);
        this.y = intLerp(this.y, this.target.y, 0.1);

        if(this.checkWorldCollision(this.x, this.y) ) {
            this.x = this.previous.x;
            this.y = this.previous.y;
        }

        if(this.bump < 0.01) { this.bump = 0;}
        
        if (range < this.collisionRange) {
        //if(rectCollision(this.collider, player.collider)) {
           collisionResponse(player, this);
        }

        //todo, need a line vs. rect method for bullets vs evertything

        // countdown hurt
        if (this.hurtTicks > 0) this.hurtTicks--;

        // bullet collision detection
        world.bullets.forEach(bullet => {
            if (bullet.actor === this) return;
            // check for collisions w/ armor points
            for(let armorPoint of this.armorPoints) {
                if(armorPoint.health > 0 ) {
                    if(rectCollision(bullet.collider, armorPoint)) {
                        armorPoint.bump = 2;
                        audio.playSound(loader.sounds[`enemyHurt0${Math.floor(Math.random()*8)}`],
                        map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.4, 1+Math.random()*0.2, false)
                        armorPoint.health -= 59;
                        if(armorPoint.health < 50) {
                            armorPoint.color = ticker%2==0? COLORS.dirtyRed : COLORS.white;
                        }
                        this.hurtTicks = 10;
                        bullet.hit();
                        bullet.die();
                    }
                }
            }
            // check for blocked collisions
            let center = {x: this.x + this.width/2, y: this.y + this.height/2};
            let d = distanceBetweenPoints(center, bullet);
            if (this.r1alive) {
                // bullets hitting outer shell w/ armor points don't do dammage
                if (d < 28) bullet.die();
            } else if (this.r2alive) {
                if (d < 24) {
                    bullet.hit();
                    bullet.die();
                    this.health -= 5;
                    this.hurtTicks = 10;
                }
            } else {
                if (d < 18) {
                    bullet.hit();
                    bullet.die();
                    this.health -= 5;
                    this.hurtTicks = 10;
                }
            }
        })

        // -- armor point updates
        this.armorPoints.forEach(function(armorPoint, i, array){
            if(armorPoint.health <= 0) {
                if(!armorPoint.dead) {
                    audio.playSound(loader.sounds[`bigSplode0${Math.floor(Math.random()*8)}`],
                    map(armorPoint.x-view.x, 0, canvas.width, -0.7, 0.7), 0.7, 1+Math.random()*0.2, false);
                    let splode = new Splode(armorPoint.x, armorPoint.y, 20, COLORS.dirtyRed);

                    world.entities.push(splode);
                    armorPoint.dead = true;
                }
            }
            armorPoint.bump = lerp(armorPoint.bump, 0, 0.1);
            if(armorPoint.bump < 0.01) { armorPoint.bump = 0;}
        })
        
        // -- health is determined by armor points
        if (this.r1alive) {
            this.health = this.armorPoints.reduce((acc, armorPoint) => {acc += armorPoint.health; return acc}, 0);
        }
        if(this.health <= 0) {
            this.die();
        }

        // compute delta from last position
        let dx = this.x - this.previous.x;
        let dy = this.y - this.previous.y;

        // update dock points
        for (const dp of this.dockpoints) {
            dp.x += dx;
            dp.y += dy;
        }

        // update armor points
        for (let i=0; i<this.armorPoints.length; i++) {
            this.armorPoints[i].x = this.x + this.width/2 + Math.cos(this.r1angle+this.apAngles[i])*this.apRadius;
            this.armorPoints[i].y = this.y + this.height/2 + Math.sin(this.r1angle+this.apAngles[i])*this.apRadius;
        }

        this.previous.x = this.x;
        this.previous.y = this.y;

        // update scrappers
        this.scrappers.forEach(function(scrapper){
            scrapper.update();
        })

        
    }

    die() {
        // effects on each "death"
        audio.playSound(loader.sounds[`bigSplode0${Math.floor(Math.random()*8)}`],
            map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.7, 1+Math.random()*0.2, false);
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.goldenFizz));

        for(let i = 0; i < 40; i++) {
            let angle = (Math.PI*2/40) * i;
            world.entities.push(new Particle(this.x + this.width/2, this.y + this.width/2, Math.cos(angle)*2, Math.sin(angle)*2, {color: COLORS.goldenFizz, life: Math.random()*20+10}));
            world.bullets.push(new Bullet(this.x, this.y, Math.cos(angle)*4*Math.random(), Math.sin(angle)*2*Math.random(), COLORS.dirtyRed));
        }
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.dirtyRed));

        // ring 1 death
        if (this.r1alive) {
            this.r1alive = false;
            this.health = this.r2health;
            this.maxHealth = this.r2health;
        // ring 2 death
        } else if (this.r2alive) {
            this.r2alive = false;
            this.health = this.r3health;
            this.maxHealth = this.r3health;
        // final death
        } else {
            this.r3alive = false;
            inventory.score+=10000;
            this.restoreTiles();

            this.scrappers.forEach(scrapper => {
                scrapper.die();
            })

            this.scrappers = [];
            world.worldEntities.splice(world.worldEntities.indexOf(this), 1);
            
        }
    }

    updateCollider() {
        this.collider.x = this.x;
        this.collider.y = this.y;
        this.collider.width = this.width;
        this.collider.height = this.height;
        this.collider.left = this.x;
        this.collider.right = this.x + this.width;
        this.collider.top = this.y;
        this.collider.bottom = this.y + this.height;
    }

    checkWorldCollision(X, Y) {
        X = Math.floor(X);
        Y = Math.floor(Y);
        return (
            world.getTileAtPixel(X, Y) != 0 ||
            world.getTileAtPixel(X, Y+this.height) != 0 ||
            world.getTileAtPixel(X+this.width, Y) != 0 ||
            world.getTileAtPixel(X+this.width, Y+this.height) != 0
        )
    }

    findDirection() {
        let xDir = this.target.x - this.x;
        let yDir = this.target.y - this.y;
        let angle = Math.atan2(yDir, xDir);
        // slice of the unit circle that each direction occupies
        let cardinalUnit = (2*Math.PI) / this.directions.length;
        // to map values of -PI to PI to the direction index, first add PI (to give values in the range of 0 to 2*PI), then
        // divide by the "cardinalUnit" or size of each directional slice of the unit circle.  Rounding this will give values
        // in the range from 0 to # of directions + 1.  Mod this by the # of directions to handle the special case of the "west"
        // direction which occurs at the beginning of the range (-PI) and end of the range (PI) of values.
        let dir_i = Math.round((angle + Math.PI) / cardinalUnit) % this.directions.length;
        return dir_i;
    }

    findBestDock(actor) {
        let best = this.dockpoints[0];
        let bestd = distanceBetweenPoints(this.dockpoints[0], actor);
        for (let i=1; i<this.dockpoints.length; i++) {
            let d = distanceBetweenPoints(this.dockpoints[i], actor);
            if (d < bestd) {
                best = this.dockpoints[i];
                bestd = d;
            }
        }
        return best;
    }

    findPlayerRange() {
        let center = {x: this.x + this.width/2, y: this.y + this.height/2};
        //console.log(`center: ${center.x},${center.y} player: ${player.x},${player.y}`);
        return distanceBetweenPoints(center, player);
    }

    findDirectionTowardsPlayer() {
        let px  = player.x;
        let py = player.y;
        let xDir = px - (this.x+this.width*.5);
        let yDir = py - (this.y+this.height*.5);
        let angle = Math.atan2(yDir, xDir);
        return angle;
    }

    restoreTiles() {
        this.tilesEaten.forEach(tile => {
            world.setTileAtPosition(tile.i, tile.j, tile.tile);
        })

        this.scrappers.forEach(scrapper => {
            let tile = scrapper.grabbedTile;
            if(tile){
                world.setTileAtPosition(tile.i, tile.j, tile.tile);
            }
        })
    }
}

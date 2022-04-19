
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
        this.health = 100;
        //this.moveInterval = 5;
        this.moveSpeed = 0.2;
        this.moveInterval = 100;
        this.playerRange = 75;

        this.r1angle = 0;
        this.r2angle = 0;
        this.r3angle = 0;
        this.r1rate = .02;
        this.r2rate = -.03;
        this.r3rate = .01;
        this.r1recalc = 0;
        this.r2recalc = 0;
        this.r3recalc = 0;

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

        this.target = {
            x: this.x,
            y: this.y
        }
        this.previous = {
            x: this.x,
            y: this.y
        }

        this.states = {
            IDLE: 1,
            AIMING: 2,
            SHOOTING: 2,
            DOCK_WEST: 3,
            DOCK_NORTH: 4,
            DOCK_EAST: 4,
            DOCK_SOUTH: 5
        }
        this.state = this.states.IDLE;

        this.r1sprites = spritesheet({
            image: img['tileeater_r1'],
            frameWidth: 68,
            frameHeight: 68,
            frameMargin: 0,
            animations: {
                idle: {
                    frames: '0',
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
                    frames: '0',
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
                    frames: '0',
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
        this.dockpoints = [
            {x: this.x+this.width/2, y:this.y+dockoff, state: 'dock_north'},
            {x: this.x+this.width/2, y:this.y+this.height-dockoff, state: 'dock_south'},
            {x: this.x+dockoff, y: this.y+this.height/2, state: 'dock_west'},
            {x: this.x+this.width-dockoff, y: this.y+this.height/2, state: 'dock_east'},
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
        // -- outer ring
        canvasContext.save();
        canvasContext.translate(x,y)
        canvasContext.rotate(this.r1angle);
        this.r1anim.render({
            x: -w/2,
            y: -h/2,
            width: w,
            height: h
        })
        canvasContext.rotate(-this.r1angle);
        // -- middle ring
        canvasContext.rotate(this.r2angle);
        this.r2anim.render({
            x: -w/2,
            y: -h/2,
            width: w,
            height: h
        })
        canvasContext.rotate(-this.r2angle);
        // -- inner ring
        canvasContext.rotate(this.r3angle);
        this.r3anim.render({
            x: -w/2,
            y: -h/2,
            width: w,
            height: h
        })
        canvasContext.restore();

        // -- dock points
        for (const dp of this.dockpoints) {
            fillRect(dp.x-view.x-2, dp.y-view.y-2, 4, 4, COLORS.topaz);
        }
    
        // -- health bar
        if(this.health < 800) {
            fillRect(this.x-5 - view.x, this.y - view.y - 8, this.health/20, 2, COLORS.tahitiGold);
        }

        // dbg center
        //fillRect(this.x-view.x+this.width/2-2, this.y-view.y+this.height/2-2, 4, 4, "green");

        // armor points
        for (const ap of this.armorPoints) {
            ap.draw();
        }
    }

    updateDock(targetAngle) {
        let r1delta = clampRoll(targetAngle - this.r1angle, -Math.PI, Math.PI);
        this.r1rate = (r1delta > 0) ? .04 : -.04;
        let r2delta = clampRoll(targetAngle - this.r2angle, -Math.PI, Math.PI);
        this.r2rate = (r2delta > 0) ? .04 : -.04;
        let r3delta = clampRoll(targetAngle - this.r3angle, -Math.PI, Math.PI);
        this.r3rate = (r3delta > 0) ? .04 : -.04;
        if (Math.abs(r1delta) < .1) {
            this.r1rate = 0;
            this.r1angle = targetAngle;
        }
        if (Math.abs(r2delta) < .1) {
            this.r2rate = 0;
            this.r2angle = targetAngle;
        }
        if (Math.abs(r3delta) < .1) {
            this.r3rate = 0;
            this.r3angle = targetAngle;
        }
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

    update() {
        
        // -- range to player
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
                if (range < this.playerRange) {
                    this.state = 'aiming';
                }
                // -- movement
                if(ticker%this.moveInterval == 0){
                    this.target.x = this.x + (Math.random() * 2 - 1) * 15;
                    this.target.y = this.y + (Math.random() * 2 - 1) * 15;
                    this.targetX += Math.cos(this.findDirectionTowardsPlayer()) * 32;
                    this.targetY += Math.sin(this.findDirectionTowardsPlayer()) * 32;
                    while(this.checkWorldCollision(this.target.x, this.target.y) ) {
                        this.target.x = this.x + (Math.random() * 2 - 1) * 15;
                        this.target.y = this.y + (Math.random() * 2 - 1) * 15;
                        this.targetX += Math.cos(this.findDirectionTowardsPlayer()) * 32;
                        this.targetY += Math.sin(this.findDirectionTowardsPlayer()) * 32;
                    }
                }

                break;
            }

            case 'aiming': {
                if (range > this.playerRange) {
                    this.state = 'idle';
                    break;
                }
                // determine angle to target
                let targetAngle = clampRoll(this.findDirectionTowardsPlayer() + Math.PI * .5, 0, Math.PI*2);
                let delta = clampRoll(targetAngle - this.r2angle, -Math.PI, Math.PI);
                this.r2rate = (delta > 0) ? .04 : -.04;
                // close enough to player angle, fire
                if (Math.abs(delta) < .1) {
                    this.state = 'firing';
                    //this.state = 'dock_south';
                    this.r2rate = 0;
                    this.delay = 20;
                }
                //console.log(`r2angle: ${this.r2angle} targetangle: ${this.targetAngle} delta: ${delta}`);
                break;
            }

            case 'firing': {
                if (this.delay) {
                    this.delay--;
                } else {
                    if (range < this.playerRange) {
                        this.state = 'aiming';
                    } else {
                        this.state = 'idle';
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
        /*
        if (this.r1angle > Math.PI*2) this.r1angle = this.r1angle - Math.PI*2;
        if (this.r2angle > Math.PI*2) this.r2angle = this.r2angle - Math.PI*2;
        if (this.r3angle > Math.PI*2) this.r3angle = this.r3angle - Math.PI*2;
        */
        

        //let anim_tag = `${this.state}_${this.directions[this.findDirection()]}`;
        //console.log(`dir: ${this.findDirection()} anim_tag: ${anim_tag}`);
        //this.currentAnimation = this.spritesheet.animations[ anim_tag ];
        //this.currentAnimation.update();

       
        
        this.updateCollider();

        this.bump = lerp(this.bump, 0, 0.1);
        this.x = intLerp(this.x, this.target.x, 0.1);
        this.y = intLerp(this.y, this.target.y, 0.1);

        if(this.checkWorldCollision(this.x, this.y) ) {
            this.x = this.previous.x;
            this.y = this.previous.y;
        }

        if(this.bump < 0.01) { this.bump = 0;}
        
        if(rectCollision(this.collider, player.collider)) {
            //signal.dispatch('keysChanged', {amount: 1})
            //inventory.items.keys -= 1;
           collisionResponse(player, this);
           
        }

        //todo, need a line vs. rect method for bullets vs evertything

        /*
        world.bullets.forEach(bullet => {
            if(rectCollision(this.collider, bullet.collider)) {
                audio.playSound(loader.sounds[`enemyHurt0${Math.floor(Math.random()*8)}`],
                map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.4, 1+Math.random()*0.2, false);
                this.health -= 10;
                bullet.die();
                this.bump = 5;
            }
        })
        */

        // bullet collision detection
        world.bullets.forEach(bullet => {
            //update for 3 colliders
            for(let armorPoint of this.armorPoints) {
                if(armorPoint.health > 0 ) {
                    if(rectCollision(bullet.collider, armorPoint)) {
                        armorPoint.bump = 2;
                        audio.playSound(loader.sounds[`enemyHurt0${Math.floor(Math.random()*8)}`],
                        map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.4, 1+Math.random()*0.2, false)
                        armorPoint.health -= 5;
                        if(armorPoint.health < 50) {
                            armorPoint.color = COLORS.loulou;
                        }
                        bullet.hit();
                        bullet.die();
                    }
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
        this.health = this.armorPoints.reduce((acc, armorPoint) => {acc += armorPoint.health; return acc}, 0);
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
        
    }

    die() {
        inventory.score+=100;
        audio.playSound(loader.sounds[`bigSplode0${Math.floor(Math.random()*8)}`],
        map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.7, 1+Math.random()*0.2, false);
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.goldenFizz));

        world.worldEntities.splice(world.entities.indexOf(this), 1);

        for(let i = 0; i < 40; i++) {
            let angle = (Math.PI*2/40) * i;
            world.entities.push(new Particle(this.x + this.width/2, this.y + this.width/2, Math.cos(angle)*2, Math.sin(angle)*2, {color: COLORS.goldenFizz, life: Math.random()*20+10}));
            world.bullets.push(new Bullet(this.x, this.y, Math.cos(angle)*4*Math.random(), Math.sin(angle)*2*Math.random(), COLORS.dirtyRed));
        }
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.dirtyRed));
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
}
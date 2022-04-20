class Scrapper {
    constructor(tileX, tileY, northTile, southTile, eastTile, westTile) {
        this.tileX = tileX
        this.tileY = tileY
        this.x = tileX * 8;
        this.y = tileY * 8;
        this.startX = tileX * 8;
        this.startY = tileY * 8;
        this.northTile = northTile;
        this.southTile = southTile;
        this.eastTile = eastTile;
        this.westTile = westTile;
        this.neighbors = [ northTile, southTile, eastTile, westTile ];
        this.height = 15;
        this.angle = 0;
        this.width = 15;
        this.bump = 0;
        this.health = 100;
        this.tileTimer = 0;
        this.tileTimerMax = 200;
        //this.moveInterval = 5;
        this.moveSpeed = 0.2;
        this.moveInterval = 300;
        this.dockRange = 20;

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

        this.target = {
            x: this.x,
            y: this.y
        }
        this.previous = {
            x: this.x,
            y: this.y
        }

        this.states = {
            PLAYER_PILOTED: 1,
            DAMAGED: 2,
            SEEK_TILE: 3,
            EATING_TILE: 4,
            DELIVERING_TILE: 5,
            DOCKING: 6
        }
        this.state = this.states.SEEK_TILE


        this.spritesheet = spritesheet({
            image: img['scrapper'],
            frameWidth: 24,
            frameHeight: 24,
            frameMargin: 0,
            animations: {

                idle_north: {
                    frames: '0..3',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                grab_north: {
                    frames: '4..9',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry_north: {
                    frames: '10..13',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                sleep_north: {
                    frames: 14,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                unload_north: {
                    frames: [14,14],
                    frameRate: 1,
                    loop: false,
                    noInterrupt: true
                },

                idle_west: {
                    frames: '15..18',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                grab_west: {
                    frames: '19..24',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry_west: {
                    frames: '25..28',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                sleep_west: {
                    frames: 29,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                unload_west: {
                    frames: [29,29],
                    frameRate: 1,
                    loop: false,
                    noInterrupt: true
                },

                idle_south: {
                    frames: '30..33',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                grab_south: {
                    frames: '34..39',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry_south: {
                    frames: '40..43',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                sleep_south: {
                    frames: 44,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                unload_south: {
                    frames: [44,44],
                    frameRate: 1,
                    loop: false,
                    noInterrupt: true
                },

                idle_east: {
                    frames: '45..48',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                grab_east: {
                    frames: '49..54',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry_east: {
                    frames: '55..58',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                sleep_east: {
                    frames: 59,
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                unload_east: {
                    frames: [59,59],
                    frameRate: 1,
                    loop: false,
                    noInterrupt: true
                },

            }
        })

        // order here is based on calculation in findDirection
        this.direction = 2;
        this.directions = ['west', 'north', 'east', 'south'];
        this.tileGripOffsets = [
            {x: -2, y: 12},
            {x: 12, y: 0},
            {x: 28, y: 12},
            {x: 12, y: 23}
        ]
        this.tileGripOffset = this.tileGripOffsets[this.direction];
        
        // -- this.currentAnimation
        // -- this.animState
        this.setDirectionalAnim("idle");

    }

    draw() {
        this.currentAnimation.render({
            x: Math.floor(this.x-view.x+this.bump),
            y: Math.floor(this.y-view.y),
            width: 24,
            height: 24
        })
    
        if(this.health < 100) {
            fillRect(this.x - view.x, this.y - view.y - 5, this.health/10, 2, COLORS.tahitiGold);
        }
        pset(this.x - view.x + this.tileGripOffsets[0].x, this.y - view.y + this.tileGripOffsets[0].y, COLORS.tahitiGold);
        pset(this.x - view.x + this.tileGripOffsets[1].x, this.y - view.y + this.tileGripOffsets[1].y, COLORS.tahitiGold);
        pset(this.x - view.x + this.tileGripOffsets[2].x, this.y - view.y + this.tileGripOffsets[2].y, COLORS.tahitiGold);
        pset(this.x - view.x + this.tileGripOffsets[3].x, this.y - view.y + this.tileGripOffsets[3].y, COLORS.tahitiGold);
    }

    setDirectionalAnim(state) {
        this.animState = state;
        let anim_tag = `${state}_${this.directions[this.direction]}`;
        let anim = this.spritesheet.animations[ anim_tag ];
        if (this.currentAnimation !== anim) {
            anim.reset();
            this.currentAnimation = anim;
        }
    }

    update() {
        if(ticker%50 === 0 && this.state != this.states.EATING_TILE) {
            this.direction = this.findDirection();
        }
        this.tileGripOffset = this.tileGripOffsets[this.direction];

        this.currentAnimation.update();
        //console.log(`anim state: ${this.animState} cf: ${this.currentAnimation.currentFrame} fl: ${this.currentAnimation.frames.length} accum: ${this.currentAnimation.accumulator.toFixed(2)} done: ${this.currentAnimation.done} loop: ${this.currentAnimation.loop}`);

        let tileEater = world.worldEntities.filter(e => e.type === TILE_EATER)[0];

        // pick tile eater dock that is closest
        let bestDock = tileEater.findBestDock(this);
        this.startX = bestDock.x;
        this.startY = bestDock.y;
        let waitForDock = false;

       switch(this.state){
            case this.states.PLAYER_PILOTED: {
                //
                break;
            }
            case this.states.DAMAGED: {
                break;
            }
            case this.states.SEEK_TILE: {
                this.setDirectionalAnim("idle");
                //find nearest tile from spawn/start location that isn't eaten
                   //pick random tile location from onscreen tiles
                   

                     //if tile is solid and not eaten, move to it
 
                if(ticker%this.moveInterval == 0) {
                    this.angle = Math.random() * Math.PI*2;
                }
                this.moveSpeed = 0.2;
                this.target.x += Math.cos(this.angle)*0.7 + Math.random() - 0.5
                this.target.y += Math.sin(this.angle)*0.7 + Math.random() - 0.5
                this.captureCoolDown--;
                let tile = world.getTileAtPixel(this.x + this.tileGripOffset.x, this.y + this.tileGripOffset.y);
                if(tile != 0 && tile != COLOR_DIRTY_RED) {
                    this.tileTimer = this.tileTimerMax;
                    this.state = this.states.EATING_TILE;
                }

                break;
            }
            case this.states.EATING_TILE: {
                //change animation to grabbing/eating
                this.setDirectionalAnim("grab");
                this.tileTimer--
                for(let i = 0; i < 2; i++) {
                    let particle = new Particle(
                        this.x + this.tileGripOffset.x +  Math.random()*8 - 4,
                        this.y + this.tileGripOffset.y,
                        0, Math.random() * -1,
                        {color: COLORS.dirtyRed, life: Math.random() * 20}
                         );
                    world.entities.push(particle);
                    particle = new Particle(
                        this.x + this.tileGripOffset.x,
                        this.y + this.tileGripOffset.y + Math.random()*8 - 4,
                        Math.random() * -1, 0,
                        {color: COLORS.dirtyRed, life: Math.random() * 20}
                         );
                    world.entities.push(particle);
                    particle = new Particle(
                        this.x + this.tileGripOffset.x +  Math.random()*8 - 4,
                        this.y + this.tileGripOffset.y,
                        0, Math.random(),
                        {color: COLORS.dirtyRed, life: Math.random() * 20}
                         );
                    world.entities.push(particle);
                    particle = new Particle(
                        this.x + this.tileGripOffset.x,
                        this.y + this.tileGripOffset.y +  Math.random()*8 -4,
                        Math.random(), 0,
                        {color: COLORS.dirtyRed, life: Math.random() * 20}
                         );
                    world.entities.push(particle);
                }
                if(this.tileTimer <= 0) {
                    this.state = this.states.DELIVERING_TILE;
                    let tile = world.getTileAtPixel(this.x + this.tileGripOffset.x, this.y + this.tileGripOffset.y);
                    if(tile != 0) {
                        world.data[ world.pixelToTileIndex(
                        this.x + this.tileGripOffset.x,
                        this.y + this.tileGripOffset.y) ] = COLOR_DIRTY_RED;
                    }
                }
                //emit particles from target tile
                //if tile timer is zero,
                    //change tile to glitch tile
                    //change state to delivering tile
                break;
            }   
            case this.states.DELIVERING_TILE: {
                this.setDirectionalAnim("carry");
                this.angle = Math.atan2(this.startY - this.y, this.startX - this.x);
                this.target.x += Math.cos(this.angle)*0.7 + Math.random() - 0.5
                this.target.y += Math.sin(this.angle)*0.7 + Math.random() - 0.5

                // signal tileeater to start dock sequence
                if (distanceBetweenPoints(bestDock, this) < this.dockRange) {
                    this.state = this.states.DOCKING;
                    this.dockingTimer = 150;
                }
                break;
            }
            case this.states.DOCKING: {
                // handle docking delay (don't get stuck in docking state if tileeater is busy with other states)
                this.dockingTimer--;
                if (this.dockingTimer <= 0) {
                    this.state = this.states.SEEK_TILE;
                    this.unloading = false;
                    break;
                }
                // detect out of range
                let range = distanceBetweenPoints(bestDock, this);
                if (range > this.dockRange) {
                    this.state = this.states.DELIVERING_TILE;
                    this.unloading = false;
                    break;
                }
                // signal tile eater
                if (tileEater.state === 'idle') {
                    tileEater.state = bestDock.state;
                    waitForDock = true;
                // wait for tile eater to be locked to requested dock
                } else if (!tileEater.dockLocked || tileEater.state !== bestDock.state) {
                    waitForDock = true;
                // finish carrying to dock
                } else if (range > .2) {
                    waitForDock = false;
                    this.setDirectionalAnim("carry");
                    this.angle = Math.atan2(this.startY - this.y, this.startX - this.x);
                    this.target.x += Math.cos(this.angle)*0.7 + Math.random() - 0.5
                    this.target.y += Math.sin(this.angle)*0.7 + Math.random() - 0.5
                // within range of dock...
                } else {
                    if (!this.unloading) {
                        this.unloading = true;
                        this.animState = bestDock.unloadAnim;
                        this.currentAnimation = this.spritesheet.animations[this.animState];
                        this.currentAnimation.reset();
                    }
                    if (!this.currentAnimation.done) {
                        // console.log(`anim done: ${this.currentAnimation.done}`);
                    // finish ... go back to seeking next tile
                    } else {
                        console.log(`loading is done: ${this.currentAnimation.done}`);
                        this.unloading = false;
                        this.state = this.states.SEEK_TILE;
                    }
                }
                break;
            }
       }
        
        this.updateCollider();
        if(this.health < 0) {
            this.die();
        }
        this.bump = lerp(this.bump, 0, 0.1);
        if (!waitForDock) {
            this.x = intLerp(this.x, this.target.x, 0.1);
            this.y = intLerp(this.y, this.target.y, 0.1);
        }

        if(this.bump < 0.01) { this.bump = 0;}
        
        if(rectCollision(this.collider, player.collider)) {
            //signal.dispatch('keysChanged', {amount: 1})
            //inventory.items.keys -= 1;
           collisionResponse(player, this);
           
        }

        world.bullets.forEach(bullet => {
            if(rectCollision(this.collider, bullet.collider)) {
                audio.playSound(loader.sounds[`enemyHurt0${Math.floor(Math.random()*8)}`],
                map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.4, 1+Math.random()*0.2, false);
                this.health -= 10;
                bullet.die();
                this.bump = 5;
            }
        })

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

    findDirectionTowardsPlayer() {
        let px  = player.x;
        let py = player.y;
        let xDir = px - this.x;
        let yDir = py - this.y;
        let angle = Math.atan2(yDir, xDir);
        return angle;
    }
}
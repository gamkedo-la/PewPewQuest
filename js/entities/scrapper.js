class Scrapper {
    constructor(tileX, tileY, parent) {
        this.tileX = tileX
        this.tileY = tileY
        this.x = tileX * 8;
        this.y = tileY * 8;
        this.startX = tileX * 8;
        this.startY = tileY * 8;
        this.height = 15;
        this.angle = 0;
        this.width = 15;
        this.bump = 0;
        this.health = 100;
        this.tileTimer = 0;
        this.tileTimerMax = 200;
        this.moveSpeed = 0.2;
        this.moveInterval = 300;
        this.dockRange = 20;
        this.unloadOffset = {x: 0, y: 0};
        this.tileEater = parent;

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
        this.state = this.states.SEEK_TILE;

        this.tilesEaten = [];

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
                    frames: ['70..74',74,74],
                    frameRate: 10,
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
                    frames: ['65..69',69,69],
                    frameRate: 10,
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
                    frames: ['75..79',79,79],
                    frameRate: 10,
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
                    frames: ['60..64',64,64],
                    frameRate: 10,
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
        this.directionVectors = [
            {x:-1, y: 0},
            {x:0, y: -1},
            {x:1, y: 0},
            {x:0, y: 1},
        ];
        this.tileGripOffset = this.tileGripOffsets[this.direction];
        this.tileCarryOffsets = [
            {x: 8, y: 8},
            {x: 8, y: 8},
            {x: 8, y: 8},
            {x: 8, y: 8}
        ];
        
        // -- this.currentAnimation
        // -- this.animState
        this.setDirectionalAnim("idle", this.direction);

    }

    draw() {
        // draw grabbed tile
        if (this.grabbedTile) {
            let offset = this.tileCarryOffsets[this.direction];
            world.drawImageTileAt(this.x+offset.x+this.unloadOffset.x, this.y+offset.y+this.unloadOffset.y, this.grabbedTile);
        }

        this.currentAnimation.render({
            x: Math.floor(this.x-view.x+this.bump),
            y: Math.floor(this.y-view.y),
            width: 24,
            height: 24
        })
    
        if(this.health < 100) {
            fillRect(this.x - view.x, this.y - view.y - 5, this.health/10, 2, COLORS.tahitiGold);
        }
    }

    setDirectionalAnim(state, direction) {
        this.animState = state;
        let anim_tag = `${state}_${this.directions[direction]}`;
        let anim = this.spritesheet.animations[ anim_tag ];
        if (this.currentAnimation !== anim) {
            anim.reset();
            this.currentAnimation = anim;
        }
    }

    update() {
        if(ticker%50 === 0 && this.state != this.states.EATING_TILE && this.state != this.states.DOCKING) {
            this.direction = this.findDirection();
        }
        this.tileGripOffset = this.tileGripOffsets[this.direction];

        this.currentAnimation.update();

        // pick tile eater dock that is closest
        let bestDock = this.tileEater.findBestDock(this);
        this.startX = bestDock.x;
        this.startY = bestDock.y;
        let waitForDock = false;

       switch(this.state){
            case this.states.DAMAGED: {
                break;
            }
            case this.states.SEEK_TILE: {
                this.setDirectionalAnim("idle", this.direction);
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
                    audio.playSound(loader.sounds.eatingTile, 0, 0.15);
                    this.tileTimer = this.tileTimerMax;
                    this.state = this.states.EATING_TILE;
                }

                break;
            }
            case this.states.EATING_TILE: {
                //change animation to grabbing/eating
                this.setDirectionalAnim("grab", this.direction);
                this.tileTimer--
                if( inView(this.x, this.y) ){
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
                }
                
                if(this.tileTimer <= 0) {
                    audio.playSound(loader.sounds.deliverTile, 0, 0.15);
                    this.state = this.states.DELIVERING_TILE;
                    let tile = world.getTileAtPixel(this.x + this.tileGripOffset.x, this.y + this.tileGripOffset.y);
                    if(tile != 0) {
                        world.data[ world.pixelToTileIndex(
                        this.x + this.tileGripOffset.x,
                        this.y + this.tileGripOffset.y) ] = COLOR_DIRTY_RED;
                    }
                    this.grabbedTile = {
                        tile: tile,
                        i: Math.floor((this.x + this.tileGripOffset.x)/8),
                        j: Math.floor((this.y + this.tileGripOffset.y)/8),
                    };
                }
                break;
            }   
            case this.states.DELIVERING_TILE: {
                this.setDirectionalAnim("carry", this.direction);
                this.angle = Math.atan2(this.startY - this.y, this.startX - this.x);
                this.target.x += Math.cos(this.angle)*0.7 + Math.random() - 0.5
                this.target.y += Math.sin(this.angle)*0.7 + Math.random() - 0.5

                // signal tileeater to start dock sequence
                if (distanceBetweenPoints(bestDock, this) < this.dockRange) {
                    this.state = this.states.DOCKING;
                    this.dockingTimer = 250;
                }
                break;
            }
            case this.states.DOCKING: {
                // handle docking delay (don't get stuck in docking state if tileeater is busy with other states)
                this.dockingTimer--;
                if (this.dockingTimer <= 0) {
                    this.state = this.states.SEEK_TILE;
                    this.unloading = false;
                    
                    //we go ahead and pass along the tile to the tile eater anyways, so restoration is possible
                    this.tileEater.tilesEaten.push(this.grabbedTile);

                    this.grabbedTile = null;
                    this.unloadOffset = { x: 0, y: 0};
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
                if (this.tileEater.state === 'idle') {
                    this.tileEater.state = bestDock.state;
                    waitForDock = true;
                // wait for tile eater to be locked to requested dock
                } else if (!this.tileEater.dockLocked || this.tileEater.state !== bestDock.state) {
                    waitForDock = true;
                // finish carrying to dock
                } else if (range > .2) {
                    waitForDock = false;
                    let dir = ['dock_west', 'dock_north', 'dock_east', 'dock_south'].indexOf(bestDock.state);
                    this.setDirectionalAnim("carry", dir);
                    this.angle = Math.atan2(this.startY - this.y, this.startX - this.x);
                    this.target.x += Math.cos(this.angle)*0.7 + Math.random() - 0.5
                    this.target.y += Math.sin(this.angle)*0.7 + Math.random() - 0.5
                // within range of dock...
                } else {
                    if (!this.unloading) {
                        audio.playSound(loader.sounds.unloadingTile, 0, 0.15);
                        this.unloading = true;
                        // animation is set to unloading, which is a non-looping animation
                        this.animState = bestDock.unloadAnim;
                        this.direction = bestDock.dir;
                        this.currentAnimation = this.spritesheet.animations[this.animState];
                        this.currentAnimation.reset();
                        this.unloadOffset = { x: 0, y: 0};
                    }
                    if (!this.currentAnimation.done) {
                        // update unloading offset
                        if (ticker%4 === 0) {
                            let dv = this.directionVectors[this.direction];
                            this.unloadOffset.x -= dv.x;
                            this.unloadOffset.y -= dv.y;
                        }
                    // finish ... go back to seeking next tile
                    } else {
                        //audio.playSound(loader.sounds.unloadingComplete, 0, 0.15);
                        console.log(`loading is done: ${this.currentAnimation.done}`);
                        this.unloading = false;
                        let dir = ['dock_west', 'dock_north', 'dock_east', 'dock_south'].indexOf(bestDock.state);
                        this.setDirectionalAnim("carry", dir);
                        this.tileEater.tilesEaten.push(this.grabbedTile);
                        //console.log(this.tileEater.tilesEaten);
                        this.state = this.states.SEEK_TILE;
                        this.grabbedTile = null;
                        this.unloadOffset = { x: 0, y: 0};
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
           collisionResponse(player, this);
           player.hurt(5);
           
        }

        world.bullets.forEach(bullet => {
            if(rectCollision(this.collider, bullet.collider)) {
                audio.playSound(loader.sounds[`enemyHurt0${Math.floor(Math.random()*8)}`],
                map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.4, 1+Math.random()*0.2, false);
                //reaect but no health lost, scrappers invulnerable
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
class Enforcer {
    constructor(tileX, tileY, northTile, southTile, eastTile, westTile) {
        this.tileX = tileX
        this.tileY = tileY
        this.x = tileX * 8;
        this.y = tileY * 8;
        this.northTile = northTile;
        this.southTile = southTile;
        this.eastTile = eastTile;
        this.westTile = westTile;
        this.neighbors = [ northTile, southTile, eastTile, westTile ];
        //
        //this.keysNeeded = this.keyQuantities.filter(element => this.neighbors.includes(element) );
        //this.direction = this.neighbors.indexOf(this.keysNeeded[0]);
        //this.keysRequiredToUnlock = 1 + this.keyQuantities.indexOf(this.keysNeeded[0]);
        this.height = 15;
        this.width = 15;

        this.armorWidth = 4;
        this.armorHeight = 4;

        this.bump = 0;
        this.health = 100;
        this.moveInterval = 100;
        this.angle = 0;
        this.playerDistance = 300;
        this.moveSpeed = 0.2;
        this.captureCoolDownMax = 500;
        this.captureCoolDown = 0;

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

        this.spritesheet = spritesheet({
            image: img['enforcer'],
            frameWidth: 18,
            frameHeight: 17,
            frameMargin: 0,
            animations: {

                idle: {
                    frames: '0..5',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                },

                carry: {
                    frames: '6..11',
                    frameRate: 10,
                    loop: true,
                    noInterrupt: true
                }
            }
        })

        this.armorPoints = [
            //top
             {x: this.x+6, y: this.y-5, width: this.armorWidth, height: this.armorHeight, health: 100, color: COLORS.dirtyRed, bump: 0,
                left: this.x+6, right: this.x+6 + this.armorWidth, top: this.y-5, bottom: this.y-5 + this.armorHeight},
            //bottom-left health: 100,
            {x:this.x-5, y:this.y+14, width: this.armorWidth, height: this.armorHeight, health: 100, color: COLORS.dirtyRed, bump: 0,
                left: this.x-5, right: this.x-5 + this.armorWidth, top: this.y+14, bottom: this.y+14 + this.armorHeight},
            //bottom-right
            {x:this.x+17, y:this.y+14, width: this.armorWidth, height: this.armorHeight, health: 100, color: COLORS.dirtyRed, bump: 0,
                left: this.x+17, right: this.x+17 + this.armorWidth, top: this.y+14, bottom: this.y+14 + this.armorHeight},
            
        ];

        this.target = {
            x: this.x,
            y: this.y
        }

        this.previous = {
            x: this.x,
            y: this.y
        }

        this.currentAnimation = this.spritesheet.animations['idle'];
        
        this.states = {
            PLAYER_CAPTURED: 1,
            WANDER: 3,
            CHASE: 4,
            EVADE: 5
        }
        this.state = this.states.WANDER

    }

    draw() {

        this.currentAnimation.render({
            x: Math.floor(this.x-view.x ),
            y: Math.floor(this.y-view.y),
            width: 16,
            height: 16
        })
                //fillRect(this.left-view.x, this.top-view.y, this.right-this.left, this.bottom-this.top, `rgba(255,0,0,0.5)`);

       // fillRect(this.collider.left-view.x, this.collider.top-view.y, this.collider.right - this.collider.left, this.collider.bottom - this.collider.top, 'rgba(255, 0,0,0.3)');

        for(let armorPoint of this.armorPoints) {
           if(armorPoint.health > 0) {
                fillRect(Math.floor(armorPoint.x-view.x + (ticker%2==0?armorPoint.bump:-armorPoint.bump) ),
                Math.floor(armorPoint.y-view.y),
                armorPoint.width, armorPoint.height, armorPoint.color);
           }
        }

    
    
        if(this.health < 300) {
            fillRect(this.x-5 - view.x, this.y - view.y - 8, this.health/20, 2, COLORS.tahitiGold);
        }
    }

    update() {

        this.previous.x = this.x;
        this.previous.y = this.y;
        this.playerDistance = this.findDistanceToPlayer();
        //console.log(this.playerDistance);

                
        this.health = this.armorPoints.reduce((acc, armorPoint) => {acc += armorPoint.health; return acc}, 0);
        
        this.currentAnimation.update();
        this.updateCollider();

        if(this.health <= 100) {
            this.state = this.states.EVADE;
        }

        switch(this.state) {

            case this.states.WANDER:{
                this.currentAnimation = this.spritesheet.animations['idle'];
                if(ticker%this.moveInterval == 0) {
                    this.angle = Math.random() * Math.PI*2;
                }
                this.moveSpeed = 0.2;
                this.target.x += Math.cos(this.angle)*0.7 + Math.random() - 0.5
                this.target.y += Math.sin(this.angle)*0.7 + Math.random() - 0.5
                this.captureCoolDown--;
                if(this.playerDistance < 150 & this.captureCoolDown <= 0) {
                    this.state = this.states.CHASE;
                }
                break;
            }

            case this.states.CHASE: {
                this.currentAnimation = this.spritesheet.animations['idle'];

                this.angle = this.findDirectionTowardsPoint(player);
                this.moveSpeed = 0.3;
                this.target.x += Math.cos(this.angle)*1.1 + Math.random() - 0.5
                this.target.y += Math.sin(this.angle)*1.1 + Math.random() - 0.5
                if(this.playerDistance > 300) {
                    this.state = this.states.WANDER;
                }
                break;
            }

            case this.states.EVADE: {
                this.currentAnimation = this.spritesheet.animations['idle'];

                this.angle = this.findDirectionTowardsPoint(player);
                this.angle += Math.PI; //flip it 180 degrees
                this.moveSpeed = 0.3;
                this.target.x += Math.cos(this.angle)*0.7 + Math.random() - 0.5
                this.target.y += Math.sin(this.angle)*0.7 + Math.random() - 0.5

                //let lastArmo
                break;
            }

            case this.states.PLAYER_CAPTURED: {
                this.currentAnimation = this.spritesheet.animations['carry'];
                this.angle = this.findDirectionTowardsPoint({x:playerStart.x*8, y:playerStart.y*8});
                this.target.x += Math.cos(this.angle)*3 + Math.random() - 0.5
                this.target.y += Math.sin(this.angle)*3 + Math.random() - 0.5
                player.capturer = this;
                this.moveSpeed = 0.2;
                //if distance from player start is less than ---> then go to wander
                //release player
                if(this.findDistanceToPoint({x:playerStart.x*8, y:playerStart.y*8}) < 10) {
                    //player.capturer = null;
                    player.captured = false;
                    player.x = playerStart.x*8;
                    player.y = playerStart.y*8;
                    this.captureCoolDown = this.captureCoolDownMax;
                    this.angle += Math.PI; //flip it 180 degrees
                    this.target.x += Math.cos(this.angle)*40 + Math.random() - 0.5
                    this.target.y += Math.sin(this.angle)*40 + Math.random() - 0.5
                    this.state = this.states.WANDER;

                }
                break;
            }

        }


        //if all armor points are gone, die
        if(this.health < 0) {
            this.die();
        }
        this.bump = lerp(this.bump, 0, 0.1);
        this.x = lerp(this.x, this.target.x, this.moveSpeed);
        this.y = lerp(this.y, this.target.y, this.moveSpeed);


        if(this.bump < 0.01) { this.bump = 0;}
        
        if(rectCollision(this.collider, player.collider) && this.captureCoolDown <= 0) {
            this.state = this.states.PLAYER_CAPTURED;
            player.captured = true;
        }

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

        this.previous.x = this.x;
        this.previous.y = this.y;

        this.armorPoints.forEach(function(armorPoint, i, array){
            if(armorPoint.health < 0) {
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

        if(this.armorPoints.length == 0) {
            this.die();
        }

        
    }

    die() {
        inventory.score+=1000;
        audio.playSound(loader.sounds[`bigSplode0${Math.floor(Math.random()*8)}`],
        map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.7, 1+Math.random()*0.2, false);
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.goldenFizz));
        world.worldEntities.splice(world.entities.indexOf(this), 1);

        for(let i = 0; i < 40; i++) {
            let angle = (Math.PI*2/40) * i;
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
       
        this.armorPoints[0] = {...this.armorPoints[0], x: this.x+6, y: this.y-5, width: this.armorWidth, height: this.armorHeight, bump: 0,
            left: this.x+6, right: this.x+6 + this.armorWidth, top: this.y-5, bottom: this.y-5 + this.armorHeight};
        this.armorPoints[1] = {...this.armorPoints[1], x:this.x-5, y:this.y+14, width: this.armorWidth, height: this.armorHeight, bump: 0,
            left: this.x-5, right: this.x-5 + this.armorWidth, top: this.y+14, bottom: this.y+14 + this.armorHeight};
        this.armorPoints[2] = {...this.armorPoints[2], x:this.x+17, y:this.y+14, width: this.armorWidth, height: this.armorHeight, bump: 0,
            left: this.x+17, right: this.x+17 + this.armorWidth, top: this.y+14, bottom: this.y+14 + this.armorHeight};

    

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

    findDirectionTowardsPoint(point) {
        let px  = point.x
        let py = point.y
        let xDir = px - this.x;
        let yDir = py - this.y;
        let angle = Math.atan2(yDir, xDir);
        return angle;
    }

    findDistanceToPoint(point) {
        let px  = point.x
        let py = point.y
        let xDir = px - this.x;
        let yDir = py - this.y;
        let distance = Math.sqrt(xDir*xDir + yDir*yDir);
        return distance;
    }

    findDistanceToPlayer() {
        let px  = player.x;
        let py = player.y;
        let xDir = px - this.x;
        let yDir = py - this.y;
        return Math.sqrt(xDir*xDir + yDir*yDir);
    }
}
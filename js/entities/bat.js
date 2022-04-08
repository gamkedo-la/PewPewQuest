
class Bat {
    constructor(tileX, tileY, northTile, southTile, eastTile, westTile) {
        this.carryingKey = false;
        this.idealKeepawayDist = 64;
        this.tileX = tileX;
        this.tileY = tileY;
        this.x = tileX * 8;
        this.y = tileY * 8;
        this.northTile = northTile;
        this.southTile = southTile;
        this.eastTile = eastTile;
        this.westTile = westTile;
        this.neighbors = [ northTile, southTile, eastTile, westTile ];
        this.height = 10;
        this.width = 25;
        this.bump = 0;
        this.health = 100;
        this.moveInterval = 10;

        this.collider = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        }

        this.spritesheet = spritesheet({
            image: img['bat2'],
            frameWidth: 27,
            frameHeight: 16,
            frameMargin: 0,
            animations: {

                flying: {
                    frames: '0..7',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                },

                hasKey: {
                    frames: '8..15',
                    frameRate: 30,
                    loop: true,
                    noInterrupt: true
                }
            }
        })

        this.currentAnimation = this.spritesheet.animations['flying'];

        this.target = {
            x: this.x,
            y: this.y
        }

        this.previous = {
            x: this.x,
            y: this.y
        }

    }

    draw() {
        this.currentAnimation.render({
            x: Math.floor(this.x-view.x+this.bump),
            y: Math.floor(this.y-view.y),
            width: 27,
            height: 13
        })

       // fillRect(this.collider.left-view.x, this.collider.top-view.y, this.collider.right - this.collider.left, this.collider.bottom - this.collider.top, 'rgba(255, 0,0,0.3)');

        
        if(this.health < 100) {
            fillRect(this.x - view.x, this.y - view.y - 5, this.health/10, 2, COLORS.tahitiGold);
        }

        if (this.carryingKey) {
            this.play('hasKey');
        }
    }

    update() {
        this.currentAnimation.update();
        
        if(ticker%this.moveInterval == 0){
            this.target.x += (Math.random() * 2 - 1) * 15;
            this.target.y += (Math.random() * 2 - 1) * 15;
        }

        if(inventory.items.keys > 0 && !this.carryingKey){
            // move toward the player if they have a key we want
            let pX = player.x - this.x;
            let pY = player.y - this.y;
            let pDir = Math.atan2(pY, pX);
            this.target.x += Math.cos(pDir);
            this.target.y += Math.sin(pDir);
        }

        if(this.carryingKey){
            let pX = player.x - this.x;
            let pY = player.y - this.y;
            let pDir = Math.atan2(pY, pX); // toward player

            let distance = Math.sqrt(pX * pX + pY * pY);
            if (distance < this.idealKeepawayDist) {
                pDir += Math.PI; // run away from player
            }

            this.target.x += Math.cos(pDir) * 1.7;
            this.target.y += Math.sin(pDir) * 1.7;
        }
        
        this.updateCollider();

        if(this.health < 0) {
            audio.playSound(loader.sounds[`bigSplode0${Math.floor(Math.random()*8)}`],
            map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.4, 1+Math.random()*0.2, false);


            this.die();
        }

        this.bump = lerp(this.bump, 0, 0.1);
        this.x = intLerp(this.x, this.target.x, 0.1);
        this.y = intLerp(this.y, this.target.y, 0.1);
        if(this.bump < 0.01) { this.bump = 0;}
        
        if(rectCollision(this.collider, player.collider)) {
            //signal.dispatch('keysChanged', {amount: 1})
            //inventory.items.keys -= 1;
            collisionResponse(player, this);
 
            if (!this.carryingKey && inventory.items.keys > 0) {            
                this.carryingKey = true;
                inventory.items.keys--;
                console.log("a bat just stole a key! you now have "+inventory.items.keys);
            }

        }

        //todo, need a line vs. rect method for bullets vs evertything

        world.bullets.forEach(bullet => {
            if(rectCollision(this.collider, bullet.collider)) {
                this.health -= 10;
                bullet.die();
                audio.playSound(loader.sounds[`enemyHurt0${Math.floor(Math.random()*8)}`],
                map(this.x-view.x, 0, canvas.width, -0.7, 0.7), 0.7, 1+Math.random()*0.2, false);
                this.bump = 5;
            }
        })

        this.previous.x = this.x;
        this.previous.y = this.y;
        
    }

    die() {

        if (this.carryingKey) {
            console.log("bat is dropping a key!");

            let tile = world.getTileAtPixel(this.x,this.y);
            if(tile == 0){
                let obj = new DoorKey(this.x,this.y,tile);
                world.entities.push(obj);
            }
            else{
                signal.dispatch('getKey', {item: null}); // note: no item entity
            } 
        }

        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.goldenFizz));
        world.entities.splice(world.entities.indexOf(this), 1);

        for(let i = 0; i < 40; i++) {
            let angle = (Math.PI*2/40) * i;
            world.bullets.push(new Bullet(this.x, this.y, Math.cos(angle)*4*Math.random(), Math.sin(angle)*2*Math.random(), COLORS.dirtyRed));
        }
        world.entities.push(new Splode(this.x + this.width/2, this.y + this.width/2, 20, COLORS.dirtyRed));
        world.entities.splice(world.entities.indexOf(this), 1);

    }

    updateCollider() {
        this.collider.x = this.x;
        this.collider.y = this.y;
        this.collider.width = this.width;
        this.collider.height = 8;
        this.collider.left = this.x+1;
        this.collider.right = this.collider.left + this.width;
        this.collider.top = this.y+2;
        this.collider.bottom = this.collider.top + this.collider.height;
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

    play(animationName){
        this.currentAnimation = this.spritesheet.animations[animationName];
        if (!this.currentAnimation.loop){
            this.currentAnimation.reset();
        }
    }
}
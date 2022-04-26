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

    }

    update() {
        this.updateCollider();
        this.currentAnimation.update();

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

        this.currentAnimation.render({
            x: Math.floor(this.x-view.x+this.bump),
            y: Math.floor(this.y-view.y),
            width: this.width,
            height: this.height
        });

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
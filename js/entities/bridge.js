class Bridge {
    constructor(x,y) {
        this.type = BRIDGE;
        this.x = x*8;
        this.y = y*8;
        this.offsetX = 0;
        this.offsetY = 0;
        this.width = 35;
        this.height = 31;
        this.left = this.x;
        this.right = this.x + 35;
        this.top = this.y;
        this.bottom = this.y + 31;
        this.activeArea = {
            left: this.x+13,
            right: this.x + 23,
            top: this.y,
            bottom: this.y + 31,
        }
        this.held = false;
       
    }

    update() {
        this.updateCollider();
        if(rectCollision(this, player.collider)) {
            //get p
            if(!this.held){
                this.offsetX = player.x - this.x;
                this.offsetY = player.y - this.y;
            }

            if(Key.isDown(Key.SPACE) || gamepad.buttonX()) {
                this.held = true;
                if(!rectCollision(player.collider, this.activeArea)) {
                    this.x = player.x-this.offsetX;
                    this.y = player.y-this.offsetY;
                    }
            
            }else {
                this.held = false;
            }

            if(rectCollision(this.activeArea, player.collider)) {
                world.noCollide = true;
                player.maxSpeed = 20;
                player.friction = 0.01;
            }
            if(!rectCollision(this.activeArea, player.collider)) {
                world.noCollide = false;
                player.friction = 0.85;
                player.maxSpeed = 400;
            }
        }
        

        


        console.log(`world.noCollide: ${world.noCollide}`);
    }
    
    draw() {
        canvasContext.drawImage(img["bridge"], Math.floor(this.x-view.x), Math.floor(this.y-view.y) );
        if(ticker%4 == 0) {
            fillRect(this.activeArea.left-view.x,
                this.activeArea.top-view.y,
                this.activeArea.right-this.activeArea.left,
                this.activeArea.bottom-this.activeArea.top, '#000000');
            }
        if(rectCollision(this, player.collider)) {
            if(ticker%2 == 0) {
                fillRect(this.activeArea.left-view.x,
                    this.activeArea.top-view.y,
                    this.activeArea.right-this.activeArea.left,
                    this.activeArea.bottom-this.activeArea.top, '#8888FF');
                }
        }
        //fillRect(this.left-view.x, this.top-view.y, this.right-this.left, this.bottom-this.top, `rgba(255,0,0,0.5)`);
     }

    collect() {
        console.log('collected bridge');
        signal.dispatch('getBridge', {item: this});
    }

    pickup() {
        this.x = -100;
        this.y = -100;
    }

    updateCollider() {
        this.left = this.x-4;
        this.right = this.x + this.width+4;
        this.top = this.y-4;
        this.bottom = this.y + this.height+4;
        this.activeArea = {
            left: this.x+13,
            right: this.x + 23,
            top: this.y,
            bottom: this.y + 31,
        }
    }

}
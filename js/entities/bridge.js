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
       
    }

    update() {
        this.updateCollider();
        if(rectCollision(this, player.collider)) {
            if(!Key.isDown(Key.SPACE)){
                this.offsetX = player.x - this.x;
                this.offsetY = player.y - this.y;
            }
                // is player in the active area?
              
                    //set no world collision flag
                //not in the active area, but pressing the pickup button
                    if(Key.isDown(Key.SPACE)){
                        if(!rectCollision(player.collider, this.activeArea)) {
                            this.x = player.x-this.offsetX;
                            this.y = player.y-this.offsetY;
                         }
                        
                    }
        }
        if(rectCollision(player.collider, this.activeArea)) {
            world.noCollide = true;
         }
        else{
            world.noCollide = false;
        }
        // if(inventory.selectedItem == "bridge") {
        //     console.log('bridge selected');
        //     this.x = player.x;
        //     this.y = player.y;
        // }
    }
    
    draw() {
        canvasContext.drawImage(img["bridge"], Math.floor(this.x-view.x), Math.floor(this.y-view.y) );
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
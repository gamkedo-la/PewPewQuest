class Bridge {
    constructor(x,y) {
        this.type = BRIDGE;
        this.x = x*8;
        this.y = y*8;
        this.width = 35;
        this.height = 31;
        this.left = this.x;
        this.right = this.x + 35;
        this.top = this.y;
        this.bottom = this.y + 31;
        this.activeArea = {
            left: this.x+11,
            right: this.x + 25,
            top: this.y,
            bottom: this.y + 31,
        }
        // this.handle = {
        //     left: this.x, 
        //     right: this.x + 10,
        //     top: this.y,
        //     bottom: this.y + 8
        // }
    }

    update() {
        this.updateCollider();
        if(rectCollision(this, player.collider)) {
            if(!inventory.items.bridge){
                this.collect();
                this.x = -100;
                this.y = -100;
            }
            // else bridge has been dropped by player in the map
                // is player in the active area?
                if(rectCollision(player.collider, this.activeArea)) {
                   world.noCollide = true;
                }
                    //set no world collision flag
                //not in the active area, but pressing the pickup button
                    //this.pickup();s
        }
        else{
            world.noCollide = false;
        }
        if(inventory.selectedItem == "bridge") {
            console.log('bridge selected');
            this.x = player.x;
            this.y = player.y;
        }
    }
    
    draw() {
        canvasContext.drawImage(img["bridge"], this.x-view.x, this.y-view.y);
        fillRect(this.activeArea.left-view.x,
            this.activeArea.top-view.y,
            this.activeArea.right-this.activeArea.left,
            this.activeArea.bottom-this.activeArea.top, '#8888FF');
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
        this.left = this.x;
        this.right = this.x + 35;
        this.top = this.y;
        this.bottom = this.y + 31;
        this.activeArea = {
            left: this.x+11,
            right: this.x + 25,
            top: this.y,
            bottom: this.y + 31,
        }
        this.handle = {
            left: this.x, 
            right: this.x + 10,
            top: this.y,
            bottom: this.y + 8
        }
    }

}
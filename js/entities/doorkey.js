class DoorKey {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.width = 8;
        this.height = 8;
        this.left = x-4;
        this.right = x + 8;
        this.top = y-4;
        this.bottom = y + 8;
    }

    update() {
        if(rectCollision(this, player.collider)) {
            this.collect();
        }
    }
    
    draw() {
        canvasContext.drawImage(img["key"], this.x-view.x, this.y-view.y);
    }

    collect() {
        
        console.log('collected item');
        signal.dispatch('getKey', {item: this});
    }
}
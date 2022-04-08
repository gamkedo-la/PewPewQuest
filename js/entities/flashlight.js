class Flashlight {
    constructor(x,y) {
        this.x = x*8;
        this.y = y*8;
        this.width = 24;
        this.height = 24;
        this.left = this.x-4;
        this.right = this.x + 8;
        this.top = this.y-4;
        this.bottom = this.y + 8;
    }

    update() {
        if(rectCollision(this, player.collider)) {
            this.collect();
        }
    }
    
    draw() {
        canvasContext.drawImage(img["flashlight"], this.x-view.x, this.y-view.y);
        //fillRect(this.x-view.x, this.y-view.y, this.width, this.height, 'rgba(255, 0,0,0.3)');

    }

    collect() {
        
        console.log('collected item');
        signal.dispatch('getLight', {item: this});
    }
}
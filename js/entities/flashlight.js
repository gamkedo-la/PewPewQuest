class Flashlight {
    constructor(x,y) {
        this.x = x*8;
        this.y = y*8;
        this.width = 24;
        this.height = 24;
        this.left = this.x;
        this.right = this.x + this.width;
        this.top = this.y;
        this.bottom = this.y + this.height;
    }

    update() {
        if(rectCollision(this, player.collider)) {
            this.collect();
        }
    }
    
    draw() {
        canvasContext.drawImage(img["flashlight"], this.x-view.x, this.y-view.y);
        //fillRect(this.left-view.x, this.top-view.y,this.right - this.left, this.bottom - this.top, 'rgba(255, 0,0,0.3)');

    }

    collect() {
        
        console.log('collected item');
        signal.dispatch('getLight', {item: this});
    }
}
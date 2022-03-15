class DoorKey {
    constructor(x,y,type) {
        this.x = x;
        this.y = y;
        this.type = type;
    }

    update() {
        if(pointInRect(this.x, this.y, player.collider)){
            this.collect();
        }
    }
    
    draw() {
        strokePolygon(this.x-view.x, this.y-view.y, 8, 3, ticker/20, 'magenta');
    }

    collect() {
        
        console.log('collected item');
        signal.dispatch('getKey', {item: this});
    }
}
class StationLL{
    constructor(x,y) {
        this.x = x * 8 - 3;
        this.y = y * 8 - 3;
        this.width = 18;
        this.height = 28;
        this.left = this.x;
        this.right = this.x + this.width;
        this.top = this.y;
        this.bottom = this.y + this.height;
        this.canBeCollected = true;

        this.mapSprite = {
            x: 1365,
            y: 160,
            width: 13,
            height: 13
        }
    }

    update() {
        this.checkForGlitch();
        if(this.canBeCollected){
            world.stations[3] = 1;
        }else {
            world.stations[3] = 0;
        }
    }
    
    draw() {
        //canvasContext.drawImage(img["key"], this.x-view.x, this.y-view.y);
        if(this.canBeCollected){
            world.drawFromMap(this.mapSprite, this.x-view.x, this.y-view.y);
        } else {
            if(ticker % 3 == 0){
                world.drawFromMap(this.mapSprite, this.x-view.x, this.y-view.y);
            }
        }
    }

    collect() {
        signal.dispatch('getTreasure', {item: this});
        audio.playSound(loader.sounds.test2);
        for(let i = 0; i < 20; i++) {
            let particle = new Particle(this.left + Math.random()*this.width, this.y-2, Math.random() * 2-1, Math.random() * -2,
             {color: COLORS.goldenFizz, life: Math.random() * 20});
             world.entities.push(particle)
        }
        inventory.score += 100;
        world.entities.splice(world.entities.indexOf(this), 1);
    }

    checkForGlitch(){
        let x = this.mapSprite.x,
            y = this.mapSprite.y,
            width = this.mapSprite.width,
            height = this.mapSprite.height;
        this.canBeCollected = true;
        for(let i = 0; i < width; i++){
            for(let j = 0; j < height; j++){
                color = world.getTileAtPosition(x+i, y+j);
                if(color == COLOR_DIRTY_RED){
                    //console.log('glitch');
                    this.canBeCollected = false;
                }
            }
        }
    }
}
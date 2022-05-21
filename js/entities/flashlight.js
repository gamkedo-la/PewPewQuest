class Gun {
    
}
class Flashlight {
    constructor(x,y) {
        this.x = x * 8;
        this.y = y * 8;
        this.width = 25;
        this.height = 25;
        this.left = this.x;
        this.right = this.x + this.width;
        this.top = this.y;
        this.bottom = this.y + this.height;
        this.canBeCollected = true;

        this.mapSprite = {
            x: 1130,
            y: 600,
            width: 25,
            height: 25
        }
    }

    update() {
        this.checkForGlitch();
        if(this.canBeCollected){
            if(rectCollision(this, player.collider)) {
                this.collect();
            }
            for(let i = 0; i < 2; i++) {
                let particle = new Particle(this.left + Math.random()*this.width, this.y, 0, Math.random() * -1,
                {color: COLORS.goldenFizz, life: Math.random() * 10});
                world.entities.push(particle);
            }
        }
    }
    
    draw() {
        if(this.canBeCollected){
            world.drawFromMap(this.mapSprite, this.x-view.x, this.y-view.y);
        } else {
            if(ticker % 3 == 0){
                world.drawFromMap(this.mapSprite, this.x-view.x, this.y-view.y);
            }
        }
    }
    
    collect() {
        signal.dispatch('getLight', {item: this});
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
                let color = world.getTileAtPosition(x+i, y+j);
                 if(color == COLOR_DIRTY_RED){
                    this.canBeCollected = false;
                    
                }
            }
        }
    }
    
}
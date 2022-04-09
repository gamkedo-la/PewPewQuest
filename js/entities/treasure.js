class Treasure {
    constructor(x,y) {
        this.x = x * 8;
        this.y = y * 8;
        this.width = 4;
        this.height = 4;
        this.left = this.x-4;
        this.right = this.x + this.width;
        this.top = this.y;
        this.bottom = this.y + this.height;
    }

    update() {
        if(rectCollision(this, player.collider)) {
            this.collect();
        }
        for(let i = 0; i < 2; i++) {
            let particle = new Particle(this.left + Math.random()*this.width, this.y-2, 0, Math.random() * -1,
             {color: COLORS.elfGreen, life: Math.random() * 10});
            world.entities.push(particle);
        }
    }
    
    draw() {
        //canvasContext.drawImage(img["key"], this.x-view.x, this.y-view.y);
        fillRect(this.left-view.x, this.top-view.y, this.width, this.height, COLORS.atlantis);
    }

    collect() {
        console.log('collected treasure');
        signal.dispatch('getTreasure', {item: this});
        audio.playSound(loader.sounds.test2);
        for(let i = 0; i < 20; i++) {
            let particle = new Particle(this.left + Math.random()*this.width, this.y-2, Math.random() * 2-1, Math.random() * -2,
             {color: COLORS.elfGreen, life: Math.random() * 20});
             world.entities.push(particle)
        }
        inventory.score += 100;
        world.entities.splice(world.entities.indexOf(this), 1);
    }
}
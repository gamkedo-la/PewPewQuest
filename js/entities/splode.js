class Splode{
    constructor(x,y,life, color){
        this.x = x;
        this.y = y;
        this.lifeMax = life;
        this.life = life;
        this.alive = true;
        this.color = color;
        this.angle = Math.random() * Math.PI * 2;
    }
    draw(){
            strokePolygon(this.x-view.x, this.y-view.y, this.lifeMax-this.life, 4, this.angle+ticker/5,  this.color);
    }
    update(){
        if(this.life > 0){
            this.life-=1;
        }
        else {
            this.die();
        }
    }
    die(){  
        world.entities.splice(world.entities.indexOf(this), 1);
    }
}

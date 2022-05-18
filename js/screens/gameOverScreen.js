class gobug {
    constructor(spec={}) {
        this.dst = {x: spec.x, y: spec.y};
        this.dstRange = 4;
        this.x = Math.round(Math.random() * canvas.width);
        this.y = Math.round(Math.random() * canvas.height);
        this.target = { x: 0, y: 0 };
        this.directions = ['west', 'northwest', 'north', 'northeast', 'east', 'southeast', 'south', 'southwest'];
        this.moveInterval = 2;
        this.moveSpeed = .1;
        this.moveAmount = 8;
        this.spritesheet = spritesheet({
            image: img['bug'],
            frameWidth: 16,
            frameHeight: 16,
            frameMargin: 0,
            animations: {
                east: { frames: '0..3', frameRate: 30, loop: true, noInterrupt: true },
                west: { frames: '4..7', frameRate: 30, loop: true, noInterrupt: true },
                south: { frames: '8..11', frameRate: 30, loop: true, noInterrupt: true },
                north: { frames: '12..15', frameRate: 30, loop: true, noInterrupt: true },
                southeast: { frames: '16..19', frameRate: 30, loop: true, noInterrupt: true },
                southwest: { frames: '20..23', frameRate: 30, loop: true, noInterrupt: true },
                northwest: { frames: '24..27', frameRate: 30, loop: true, noInterrupt: true },
                northeast: { frames: '28..31', frameRate: 30, loop: true, noInterrupt: true },
            }
        })
        this.currentAnimation = this.spritesheet.animations['east'];
        this.done = false;
    }

    update() {
        if (this.done) return;
        let d = distanceBetweenPoints(this, this.dst)
        if (d <= this.dstRange) {
            this.x = this.dst.x;
            this.y = this.dst.y;
            this.done = true;
            return;
        }
        let angle = this.findAngleToDst();
        this.currentAnimation = this.spritesheet.animations[ this.directions[this.findDirection()] ];
        this.currentAnimation.update();
        if (ticker%this.moveInterval == 0) {
            this.target.x = this.x + (Math.random() * 2 - 1) * 4;
            this.target.y = this.y + (Math.random() * 2 - 1) * 4;
            this.target.x += Math.cos(angle) * this.moveAmount;
            this.target.y += Math.sin(angle) * this.moveAmount;
        }
        this.x = intLerp(this.x, this.target.x, this.moveSpeed);
        this.y = intLerp(this.y, this.target.y, this.moveSpeed);
    }

    findAngleToDst() {
        let xDir = this.dst.x - this.x;
        let yDir = this.dst.y - this.y;
        let angle = Math.atan2(yDir, xDir);
        return angle;
    }

    findDirection() {
        let angle = this.findAngleToDst();
        // slice of the unit circle that each direction occupies
        let cardinalUnit = (2*Math.PI) / this.directions.length;
        // to map values of -PI to PI to the direction index, first add PI (to give values in the range of 0 to 2*PI), then
        // divide by the "cardinalUnit" or size of each directional slice of the unit circle.  Rounding this will give values
        // in the range from 0 to # of directions + 1.  Mod this by the # of directions to handle the special case of the "west"
        // direction which occurs at the beginning of the range (-PI) and end of the range (PI) of values.
        let dir_i = Math.round((angle + Math.PI) / cardinalUnit) % this.directions.length;
        return dir_i;
    }

    draw() {
        let size = (this.done) ? 14 : 16;
        this.currentAnimation.render({
            x: Math.floor(this.x),
            y: Math.floor(this.y),
            width: size,
            height: size
        })    
    }
}

var gameOverScreen = {
    box: {
        x: 0,
        y: 0,
    },
    needSpawn: true,
    bugSpots: [
        // G
        [5,14], [5,15], [5,16], [5,17], [5,18], [5,19],
        [6,13], [7,13], [8,13], [9,13],
        [6,19], [7,19], [8,18], 
        [9,19], [9,18], [9,17], [9,16],
        [7,16], [8,16],
        // A
        [11,14], [11,15], [11,16], [11,17], [11,18], [11,19],
        [12,13], [13,13], [14,13],
        [12,16], [13,16], [14,16],
        [15,14], [15,15], [15,16], [15,17], [15,18], [15,19],
        // M
        [17,13], [17,14], [17,15], [17,16], [17,17], [17,18], [17,19],
        [18,15], [19,16], [20,15],
        [21,13], [21,14], [21,15], [21,16], [21,17], [21,18], [21,19],
        // E
        [23,14], [23,15], [23,16], [23,17], [23,18], [23,19],
        [24,13], [25,13], [26,13],
        [24,16], [25,16],
        [24,19], [25,19], [26,19],

        // O
        [35,14], [35,15], [35,16], [35,17], [35,18],
        [36,13], [37,13], [38,13],
        [36,19], [37,19], [38,19],
        [39,14], [39,15], [39,16], [39,17], [39,18],
        // V
        [41,13], [41,14], [41,15], [42,16], [42,17], [42,18], [43,19],
        [45,13], [45,14], [45,15], [44,16], [44,17], [44,18],
        // E
        [47,14], [47,15], [47,16], [47,17], [47,18], [47,19],
        [48,13], [49,13], [50,13],
        [48,16], [49,16],
        [48,19], [49,19], [50,19],
        // E
        [53,13], [53,14], [53,15], [53,16], [53,17], [53,18], [53,19],
        [54,13], [55,13], [56,13],
        [54,16], [55,16], [56,16],
        [57,14], [57,15], 
        [57,17], [57,18], [57,19],
    ],
    bugs: [],
    gameEndState: {},
    spawn: function() {
        for (const [i,j] of this.bugSpots) {
            let size = 5;
            let bug = new gobug({x: i*size, y: j*size});
            this.bugs.push(bug);
        }
    },
    draw: function () {
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        //replace with big 'game over' graphic?
        //gameFont.drawText("GAME OVER", { x: 30, y: 70 }, 0, 1, 5);
        fillRect(0,165, canvas.width, 15, '#111');
        tinyFont.drawText( "Press (Y) or Enter to return to Title", { x: 170, y: 170}, 0, 0);
        for (const bug of this.bugs) bug.draw();
    },
    update: function () {
        if (this.needSpawn) {
            this.needSpawn = false;
            this.spawn();
        }
        if (Key.justReleased(Key.y)) { signal.dispatch('titleScreen'); }
        if (gamepad.buttonY()) { signal.dispatch('titleScreen'); }
        this.box.x = canvas.width/2 - 5;
        this.box.y = canvas.height/2 - 5;
        this.box.x += Math.sin(ticker/10) * 50;
        this.box.y += Math.cos(ticker/10) * 50;
        for (const bug of this.bugs) bug.update();
    }
}

var gameScreen = {
    box: {
        x: 0,
        y: 0,
    },
    timerbox: {
        x: 0,
        y: 0,
        width: 320,
        height: 10
    },
    hitCounter: 0,
    reset: function () {
        this.box.x = 0;
        this.box.y = 0;
        this.timerbox.width = 320;
        this.hitCounter = 0;
    },
    draw: function () {
        clearScreen('black');
        world.drawMap();
        player.draw();
       },
    update: function () {
        player.update();
    }
}

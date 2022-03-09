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
        player.placeAtTile(1220, 589 )
    },
    draw: function () {
        clearScreen('black');
        world.drawMap();
        world.entities.forEach(function (entity) {
            if(inView(entity.x, entity.y)){
                entity.draw()
            } 
        });
        player.draw();
       },
    update: function () {
        view.x = intLerp(view.x, view.targetX, 0.3);
        view.y = intLerp(view.y, view.targetY, 0.3);

        world.entities.forEach(function (entity) {
            if(inView(entity.x, entity.y)){
                entity.update()
            } 
        });
        player.update();
    }
}

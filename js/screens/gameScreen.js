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
        view.targetX = Math.floor((1220 * world.tileSize) / canvas.width) * canvas.width
        view.targetY = Math.floor((589 * world.tileSize) / canvas.height) * canvas.height
        view.x = view.targetX
        view.y = view.targetY
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

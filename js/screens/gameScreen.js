var gameScreen = {
   
    reset: function () {
        let playerStart = {x: 1217, y: 591}
        player.placeAtTile(playerStart.x, playerStart.y )
        view.targetX = Math.floor((playerStart.x * world.tileSize) / view.width) * view.width
        view.targetY = Math.floor((playerStart.y * world.tileSize) / view.height) * view.height
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
        inventory.draw();
        strokePolygon(mouse.x, mouse.y, 6, 4, ticker/4,  COLORS.tahitiGold);
       },
    update: function () {
        view.x = intLerp(view.x, view.targetX, 0.2);
        view.y = intLerp(view.y, view.targetY, 0.2);

        world.entities.forEach(function (entity) {
            if(inView(entity.x, entity.y)){
                entity.update()
            } 
        });
        player.update();
        inventory.update();
    }
}

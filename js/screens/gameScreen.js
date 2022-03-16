var gameScreen = {
   
    reset: function () {
        player.placeAtTile(32, 15 )
        view.targetX = Math.floor((32 * world.tileSize) / canvas.width) * canvas.width
        view.targetY = Math.floor((15 * world.tileSize) / canvas.height) * canvas.height
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

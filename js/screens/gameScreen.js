var gameScreen = {

    cameraTypeToggle: true,
    bgmStarted: false,
   
    reset: function () {
       
        player.placeAtTile(playerStart.x, playerStart.y )
        player.health = player.maxHealth;
        view.targetX = Math.floor((playerStart.x * world.tileSize) / view.width) * view.width
        view.targetY = Math.floor((playerStart.y * world.tileSize) / view.height) * view.height
        view.x = view.targetX
        view.y = view.targetY
        currentAreaMode = EXPLORATION_MODE
    },
    draw: function () {
        clearScreen('black');
        world.drawMap();

        world.entities.forEach(function (entity) {
            if(inView(entity.x, entity.y)){
                entity.draw()
            } 
        });

        world.bullets.forEach(function (bullet) {
            if(inView(bullet.x, bullet.y)){
                bullet.draw()
            }
        });

        world.enemyBullets.forEach(function (bullet) {
            if(inView(bullet.x, bullet.y)){
                bullet.draw()
            }
        });

        world.worldEntities.forEach(function (entity) {
            if(inView(entity.x, entity.y, 200)){
                entity.draw();
            }
        });


        player.draw();
        inventory.draw();
        if(gp?.axes[2] != 0 || gp?.axes[3] != 0){
            let angle = Math.atan2(gp?.axes[3], gp?.axes[2])
            let x = player.x + 4 +  Math.cos(angle) * 20 - view.x;
            let y = player.y + 4 + Math.sin(angle) * 20 - view.y;
            strokePolygon(x, y, 6, 4, ticker/4,  COLORS.tahitiGold);
        }else {
            let x = mouse.x, y = mouse.y;
                strokePolygon(x, y, 6, 4, ticker/4,  COLORS.tahitiGold);
            }
    },

    update: function () {
        if(!this.bgmStarted) {
            this.bgmStarted = true;
            audio.playMusic(loader.sounds['bgm_exploration'], 0.07);
        }
        if(Key.justReleased(Key.m)) {
            signal.dispatch('miniMap');
        }

        if(Key.justReleased(Key.ONE)) {
            gameScreen.cameraTypeToggle = !gameScreen.cameraTypeToggle;
        }

        let updateAreaMode = world.environmentData[
            world.getIndexAtPosition(
                Math.floor(player.x/8), Math.floor(player.y/8))
            ]

        if(currentAreaMode != updateAreaMode){

            switch(updateAreaMode){
                case EXPLORATION_MODE:
                    audio.assignReverb(loader.sounds.reverbE)
                    break;
                case COMBAT_MODE:
                    audio.assignReverb(loader.sounds.reverbC)
                    break;
                default:
                    audio.assignReverb(loader.sounds.reverbE)
            }

            currentAreaMode = updateAreaMode;
        }

        if(world.environmentData[
            world.getIndexAtPosition(
                Math.floor(player.x/8), Math.floor(player.y/8))
            ] == COMBAT_MODE) {
            if(!player.combat){
                player.combat = true;
                gameScreen.cameraTypeToggle = false;

            }
        }else{
            player.combat = false;
            gameScreen.cameraTypeToggle = true;
        }
            

        if(this.cameraTypeToggle){
            
            view.x = intLerp(view.x, view.targetX, 0.2);
            view.y = intLerp(view.y, view.targetY, 0.2);
        }
        else{
            view.targetX = Math.floor(player.x / view.width) * view.width
            view.targetY = Math.floor(player.y / view.height) * view.height
            view.x = intLerp(view.x, player.x - canvas.width/2, 0.2);
            view.y = intLerp(view.y, player.y - canvas.height/2, 0.2);
        }
       
        world.entities.forEach(function (entity) {
            if(inView(entity.x, entity.y)){
                entity.update()
            }else{

                if (entity.type == SPLODE || entity.type == PARTICLE) {
                    entity.die();
                }

            }
            
        });
        world.bullets.forEach(function (bullet) {
            if(inView(bullet.x, bullet.y)){
                bullet.update()
            }else{
                bullet.die()
            }
        });
        world.enemyBullets.forEach(function (bullet) {
            if(inView(bullet.x, bullet.y)){
                bullet.update()
            }else{
                bullet.die()
            }
        });

        world.worldEntities.forEach(function (entity) {
                entity.update();
            
        });

        
        player.update();
        inventory.update();
    }
}

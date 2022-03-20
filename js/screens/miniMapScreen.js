var miniMapScreen = {
    reset: function(){
        ticker = 0;
    },

    draw: function () {
        clearScreen('black');
        //todo: add centered text function to spriteFont
        world.drawMiniMap();
    },

    update: function () {

        scaleTarget = 8;
        scale = lerp(scale, scaleTarget, 0.1);

        if(Key.isDown(Key.LEFT)) {
            view.x -= 32;
        }
        else if(Key.isDown(Key.RIGHT)) {
            view.x += 32;
        }
        if(Key.isDown(Key.UP)) {
            view.y -= 32;
        }
        else if(Key.isDown(Key.DOWN)) {
            view.y += 32;
        }
        
       if(Key.justReleased(Key.m)) { signal.dispatch('gameScreen'); }

       if(mouse.pressed){
           //fillRect(mouse.x - view.x/8 + canvas.width/2, mouse.y - view.y/8 + canvas.height/2, 1,1, COLORS.goldenFizz);

            let x = Math.floor(mouse.x + view.x/8 - canvas.width/2);
            let y = Math.floor(mouse.y + view.y/8 - canvas.height/2);
            player.placeAtTile(x, y);
            signal.dispatch('gameScreen');
       }

    }
}

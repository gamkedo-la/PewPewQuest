var miniMapScreen = {
    reset: function(){
        ticker = 0;
    },

    draw: function () {
        clearScreen('black');
        world.drawMiniMap();
        strokePolygon(cursorX, cursorY, 3, 2, ticker/8,  COLORS.tahitiGold);
        strokePolygon(cursorX, cursorY, 3, 2, Math.PI/2 + ticker/8,  COLORS.tahitiGold);
        fillRect(0,165, canvas.width, 15, '#111');
        gameFont.drawText("PAUSE", { x: 145, y: 169 }, 0, 1, 1);
    },

    update: function () {
        cursorX = mouse.x;
        cursorY = mouse.y;
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
        
       if(Key.justReleased(Key.m) || Key.justReleased(Key.p) ) { signal.dispatch('gameScreen'); }

       if(mouse.pressed){
           //fillRect(mouse.x - view.x/8 + canvas.width/2, mouse.y - view.y/8 + canvas.height/2, 1,1, COLORS.goldenFizz);

            let x = Math.floor(mouse.x + view.x/8 - canvas.width/2);
            let y = Math.floor(mouse.y + view.y/8 - canvas.height/2);
            player.placeAtTile(x, y);
            signal.dispatch('gameScreen');
       }

    }
}

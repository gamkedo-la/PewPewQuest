var titleScreen = {

    draw: function () {

        //fill background
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);

        //fun polygon background
        for(let i = 0; i < 20; i++){
            color = `
            rgb(
                ${Math.floor(255*Math.sin(ticker/300*i))},
                ${Math.floor(255*Math.cos(ticker/100*i/20))},
                ${Math.floor(255*Math.sin(ticker/60))})`;

            strokePolygon(canvas.width/2, canvas.height/2, 10*i, 7, ticker/100*i/2, color);
            canvasContext.drawImage(img['titleCard'], 0, 0);
            
        }
        
        //title text
       // gameFont.drawText("Start (X)  Credits (A)", { x: 40, y: 160 }, 0, 0);

        fillRect(0,165, canvas.width, 15, '#111');
        tinyFont.drawText( "Start (X)  Credits (A)", { x: 110, y: 170}, 0, 0);
        cursorX = mouse.x;
        cursorY = mouse.y;
        gameScreen.drawMouseCursor();



    },

    update: function () {
        if(Key.justReleased(Key.a)){
            audio.playSound(loader.sounds.test1);
        }
        if(Key.justReleased(Key.x)) { signal.dispatch('startGame'); }
        if(gamepad.buttonX()) { signal.dispatch('startGame'); }

        if(Key.justReleased(Key.a)) { signal.dispatch('creditScreen'); }
        if(gamepad.buttonA()) { signal.dispatch('creditScreen'); }
        
    }
}



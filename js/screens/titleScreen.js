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
            
        }
        // strokePolygon(canvas.width/2, canvas.height/2, 50, 3, 0, "white");
        // pixelLine(100,100,150,150,"red");
        
        //title text
        gameFont.drawText("PewPewQuest", { x: 10, y: 10 }, 0, 0, 2);
        gameFont.drawText("Press Z to Start", { x: 10, y: 30 }, 0, 0);
        gameFont.drawText("Press C for Credits", { x: 10, y: 40 }, 0, 0);

    },

    update: function () {
        if(Key.justReleased(Key.a)){
            audio.playSound(loader.sounds.test1);
        }
        if(Key.justReleased(Key.z)) { signal.dispatch('startGame'); }

         if(Key.justReleased(Key.c)) { signal.dispatch('creditScreen'); }
        
    }
}



var gameOverScreen = {
    box: {
        x: 0,
        y: 0,
    },
    gameEndState: {},
    draw: function () {
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        
         //feedback! draw a polygon for how many hits you've made
         for(let i = 0; i < this.gameEndState.hitCounter; i++){
            canvasContext.strokeStyle = `#DD0000`;

            strokePolygon(canvas.width/2, canvas.height/2, 3*i, 7, ticker/100*i/2);
            
        }
        gameFont.drawText(`You pounded the z key ${this.gameEndState.hitCounter} times`, { x: 10, y: 10 }, 0, 0);
        gameFont.drawText("GAME OVER", { x: 30, y: 70 }, 0, 1, 5);
        gameFont.drawText("Press Enter to return to titleScreen\nPress SPACE to try again", { x: 90, y: 150 }, 0, 1);
    },
    update: function () {
        if (Key.justReleased(Key.ENTER)) { signal.dispatch('titleScreen'); }
        if (Key.justReleased(Key.SPACE)) { signal.dispatch('startGame'); }
        this.box.x = canvas.width/2 - 5;
        this.box.y = canvas.height/2 - 5;
        this.box.x += Math.sin(ticker/10) * 50;
        this.box.y += Math.cos(ticker/10) * 50;
    }
}

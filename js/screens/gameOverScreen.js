var gameOverScreen = {
    box: {
        x: 0,
        y: 0,
    },
    gameEndState: {},
    draw: function () {
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        
        gameFont.drawText("GAME OVER", { x: 30, y: 70 }, 0, 1, 5);
        gameFont.drawText("(Y) Return To Title", { x: 90, y: 150 }, 0, 1);
    },
    update: function () {
        if (Key.justReleased(Key.y)) { signal.dispatch('titleScreen'); }
        if (gamepad.buttonY()) { signal.dispatch('titleScreen'); }
        this.box.x = canvas.width/2 - 5;
        this.box.y = canvas.height/2 - 5;
        this.box.x += Math.sin(ticker/10) * 50;
        this.box.y += Math.cos(ticker/10) * 50;
    }
}

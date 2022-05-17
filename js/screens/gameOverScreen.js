var gameOverScreen = {
    box: {
        x: 0,
        y: 0,
    },
    gameEndState: {},
    draw: function () {
        canvasContext.fillStyle = 'black';
        canvasContext.fillRect(0, 0, canvas.width, canvas.height);
        //replace with big 'game over' graphic?
        gameFont.drawText("GAME OVER", { x: 30, y: 70 }, 0, 1, 5);


        fillRect(0,165, canvas.width, 15, '#111');
        tinyFont.drawText( "Press (Y) or Enter to return to Title", { x: 170, y: 170}, 0, 0);
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

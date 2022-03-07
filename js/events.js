signal.addEventListener('startGame', startGame);
signal.addEventListener('gameOver', gameOver);
signal.addEventListener('titleScreen', gotoTitleScreen);
signal.addEventListener('creditScreen', gotoCreditScreen);




function startGame(event){
    console.log('startGame triggered');
    gameScreen.reset();
    gameState = GAMESTATE_PLAY;
}

function gameOver(event){
    console.log('gameOver triggered');
    gameOverScreen.gameEndState = event.detail;
    gameState = GAMESTATE_GAME_OVER;
}

function gotoTitleScreen(event){
    console.log('gotoTitleScreen triggered');
    gameState = GAMESTATE_TITLE;
}

function gotoCreditScreen(event){
    console.log('gotoCreditScreen triggered');
    gameState = GAMESTATE_CREDITS;
}
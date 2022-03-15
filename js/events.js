signal.addEventListener('startGame', startGame);
signal.addEventListener('gameOver', gameOver);
signal.addEventListener('titleScreen', gotoTitleScreen);
signal.addEventListener('creditScreen', gotoCreditScreen);

signal.addEventListener('getKey', getKey);




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
    creditsScreen.reset();
    gameState = GAMESTATE_CREDITS;
}

function getKey(event){
    console.log('getKey triggered');
    keyItem = event.detail.item;
    if(inventory.items.keys < 5){
        inventory.items.keys++;
        audio.playSound(loader.sounds.test1);
        world.entities.splice(world.entities.indexOf(keyItem), 1);

    }
    else {
        audio.playSound(loader.sounds.test2);
        console.log(
            'You have too many keys! You can only carry 5 keys at a time.'
        )
    }
}
signal.addEventListener('startGame', startGame);
signal.addEventListener('gameOver', gameOver);
signal.addEventListener('titleScreen', gotoTitleScreen);
signal.addEventListener('creditScreen', gotoCreditScreen);
signal.addEventListener('gameScreen', resumeGame);
signal.addEventListener('miniMap', gotoMapScreen);


signal.addEventListener('getKey', getKey);
signal.addEventListener('getLight', getLight);
signal.addEventListener('getGun', getGun);
signal.addEventListener('getSabre', getSabre);
signal.addEventListener('getChalice', getChalice);

signal.addEventListener ('removeBarrier', removeBarrier);
signal.addEventListener ('keysChanged', splodeKeys);



function startGame(event){
   // console.log('startGame triggered');
    gameScreen.reset(false);
    gameState = GAMESTATE_PLAY;
    audio.playSound(loader.sounds.boop);
}

function resumeGame(event)
{
    gameState = GAMESTATE_PLAY;
}

function gotoMapScreen(event){
    scale = 1;
    gameState = GAMESTATE_MINIMAP;
}

function gameOver(event){
    //console.log('gameOver triggered');
    gameOverScreen.gameEndState = event.detail;
    gameState = GAMESTATE_GAME_OVER;
}

function gotoTitleScreen(event){
    //console.log('gotoTitleScreen triggered');
    gameScreen.reset(true);
    gameState = GAMESTATE_TITLE;
}

function gotoCreditScreen(event){
    //console.log('gotoCreditScreen triggered');
    creditsScreen.reset();
    gameState = GAMESTATE_CREDITS;
    audio.playSound(loader.sounds.boop);
}

function getKey(event){
    //console.log('getKey triggered');
    keyItem = event.detail.item;
    if(inventory.items.keys < 5){
        inventory.items.keys++;
        audio.playSound(loader.sounds.test1);
        
        // keyitem can be null when a bat that had stolen a key is destroyed
        // because there is no key entity to speak of
        if (keyItem) {
            let splode = new Splode(keyItem.x, keyItem.y, 10, COLORS.tahitiGold);
            world.entities.push(splode);
            world.entities.splice(world.entities.indexOf(keyItem), 1);
        }

    }
    else {
        audio.playSound(loader.sounds.test2);
        //console.log(
        //    'You have too many keys! You can only carry 5 keys at a time.'
        //)
    }
}

function getLight(event){
    //console.log('getLight triggered');
    lightItem = event.detail.item;
    
        inventory.items.torch=1;
        inventory.selectedItem = 'torch';
        inventory.selection = inventory.itemList.indexOf(inventory.selectedItem);
        audio.playSound(loader.sounds.test1);
        let splode = new Splode(lightItem.x, lightItem.y, 10, COLORS.tahitiGold);
        world.entities.push(splode);
        world.entities.splice(world.entities.indexOf(lightItem), 1);

}

function getGun(event){
    //console.log('getGun triggered');
    lightItem = event.detail.item;
    
        inventory.items.gun=1;
        inventory.selectedItem = 'gun';
        inventory.selection = inventory.itemList.indexOf(inventory.selectedItem);
        audio.playSound(loader.sounds.test1);
        let splode = new Splode(lightItem.x, lightItem.y, 10, COLORS.tahitiGold);
        world.entities.push(splode);
        world.entities.splice(world.entities.indexOf(lightItem), 1);

}

function getSabre(event){
    //console.log('getSabre triggered');
    lightItem = event.detail.item;
    
        inventory.items.sabre=1;
        inventory.selectedItem = 'sabre';
        inventory.selection = inventory.itemList.indexOf(inventory.selectedItem);
        audio.playSound(loader.sounds.test1);
        let splode = new Splode(lightItem.x, lightItem.y, 10, COLORS.tahitiGold);
        world.entities.push(splode);
        world.entities.splice(world.entities.indexOf(lightItem), 1);

}

function getChalice(event){
    //console.log('getChalice triggered');
    lightItem = event.detail.item;
    
        inventory.items.chalice=1;
        inventory.selectedItem = 'chalice';
        inventory.selection = inventory.itemList.indexOf(inventory.selectedItem);
        audio.playSound(loader.sounds.test1);
        let splode = new Splode(lightItem.x, lightItem.y, 10, COLORS.tahitiGold);
        world.entities.push(splode);
        world.entities.splice(world.entities.indexOf(lightItem), 1);

}


function removeBarrier(event){
    //console.log('removeBarrier triggered');
    barrierItem = event.detail.item;
    if(barrierItem.width > barrierItem.height){
        for(var i = 0; i < barrierItem.width; i++){
            let splode = new Splode(barrierItem.x + i*8, barrierItem.y, 10, COLORS.tahitiGold);
            world.entities.push(splode);
        }
    }
    else {
        for(var i = 0; i < barrierItem.height; i++){
            let splode = new Splode(barrierItem.x, barrierItem.y + i*8, 10, COLORS.tahitiGold);
            world.entities.push(splode);
        }
    }
    world.entities.splice(world.entities.indexOf(barrierItem), 1);
}

function splodeKeys(event) {
    let amount = event.detail.amount;
    for(let i = 1; i <= amount; i++){
        let radius = 20;
        let angle = Math.PI*2/inventory.items.keys*i;
        let x = Math.sin(angle+ticker/10)*radius;
        let y = Math.cos(angle+ticker/10)*radius;

        let splode = new Splode(player.x + x, player.y + y, 10, COLORS.dirtyRed);
        world.entities.push(splode);
        
    }
}
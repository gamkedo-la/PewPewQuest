//custom even Listener setup
var signal = new Signal();

//canvas setup

canvas = document.getElementById("canvas");
canvasContext = canvas.getContext("2d");
canvas.imageSmoothingEnabled = false;
canvas.width = 320;
canvas.height = 180;

//globals and constants

const GAMESTATE_TITLE = 0
const GAMESTATE_PLAY = 1;
const GAMESTATE_GAME_OVER = 2;
const GAMESTATE_CREDITS = 3;

var gameState = GAMESTATE_TITLE;
var ticker = 0;
var loader = new AssetLoader();
var audio = new AudioGlobal();
var img, gameFont, tinyFont;

const imageList = [
    //image loader assumes .png and appends it. all images should be in /src/img/.
    'smallFont',
    '3x5font',
]

const soundList = [
    { name: "test1", url:"snd/test1.mp3" },
    { name: "test2", url:"snd/test2.mp3" }
]

function init(){
    
    loadImages();
    
}

function loadImages(){
    img = loader.loadImages(imageList, initAudio);
}

function initAudio(){
    audio.init(loadSounds);
}


function loadSounds(){ 
    console.log('loading sounds');
    loader.soundLoader({context: audio.context, urlList: soundList, callback: loadingComplete});
    loader.loadAudioBuffer();
}

function loadingComplete(){
    console.log('loading complete, starting game')

     //create spriteFont
     gameFont = new spriteFont({
        width: 255,
        height: 128,
        characterHeight: 9,
        characterWidth: 6,
        image: img.smallFont
        //remaining options are in spriteFont defaults
    })

    tinyFont = new spriteFont({
        width: 320,
        height: 240,
        characterHeight: 6,
        characterWidth: 4,
        image: img["3x5font"]
        //remaining options are in spriteFont defaults
    })


    setInterval(gameLoop, 1000/60);
}

function gameLoop() {
    ticker++;
    switch (gameState) {
        case GAMESTATE_TITLE:
            titleScreen.draw();
            titleScreen.update();
            break;
        case GAMESTATE_PLAY:
            gameScreen.draw();
            gameScreen.update();
            break;
        case GAMESTATE_GAME_OVER:
            gameOverScreen.draw();
            gameOverScreen.update();
            break;
        case GAMESTATE_CREDITS:
            creditsScreen.draw();
            creditsScreen.update();
            break;
    }
    Key.update();
}

function soundInit(){ 
        loader.soundLoader({context: audio.context, urlList: soundList, callback: loadingComplete});
        loader.loadAudioBuffer();
}

window.addEventListener('keyup',    function (event) { Key.onKeyup(event); event.preventDefault() }, false);
window.addEventListener('keydown',  function (event) { Key.onKeydown(event); event.preventDefault() }, false);
window.addEventListener('blur',     function (event) { paused = true; }, false);
window.addEventListener('focus',    function (event) { paused = false; }, false);

init();
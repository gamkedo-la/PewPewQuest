//custom even Listener setup
var signal = new Signal();

//Pseudo random number generators
worldRandomGenerator = new PRNG(42);
tileRandomGenerator = new PRNG(1019);

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
const GAMESTATE_MINIMAP = 4;


const FRAMES_PER_SECOND = 60;
const SPLODE = 10;
const BULLET = 11;

// [ northTile, southTile, eastTile, westTile ];
const NORTH = 0;
const SOUTH = 1;
const EAST = 2;
const WEST = 3;



const imageList = [
    //image loader assumes .png and appends it. all images should be in img/.
    'smallFont',
    '3x5font',
    'map',
    'tiles',
    'key',
    'orbit-key',
    'flashlight',
    'flashlight-inventory'

]

const soundList = [
    { name: "test1", url:"snd/test1.mp3" },
    { name: "test2", url:"snd/test2.mp3" },
    { name: "boop", url:"snd/boop.mp3" }
]

var gameState = GAMESTATE_PLAY;
var ticker = 0;
var loader = new AssetLoader();
var audio = new AudioGlobal();
var sounds = loader.sounds;
var play = audio.playSound;
var img, gameFont, tinyFont;

var view = {
    x: 0,
    y: 0,
    width: 320,
    height: 160,
    widthInTiles: 40,
    heightInTiles: 20,
    targetX: 0,
    targetY: 0,
}

var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
var gp = gamepads[0];

mouse = {};

var palette = [];

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
    console.log('loading complete, initializing game');
    console.log(img['map'].width)
    world = new World(img['map'].width, img['map'].height, 8);
    world.populateWithImage(img['map']);
   

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

    gameScreen.reset();
    //signal.dispatch('startGame');

    setInterval(gameLoop, 1000/FRAMES_PER_SECOND);
}

function gameLoop() {
    ticker++;
    gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    gp = gamepads[0];
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
        case GAMESTATE_MINIMAP:
            miniMapScreen.draw();
            miniMapScreen.update();
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
canvas.addEventListener('mousemove',getMousePosition);
canvas.addEventListener('mousedown',getMousePosition);
init();
//custom even Listener setup
var signal = new Signal();

var spritesheet = spriteSheetFactory
var animation = animationFactory

//Pseudo random number generators
worldRandomGenerator = new PRNG(42);
tileRandomGenerator = new PRNG(1019);

//canvas setup

canvas = document.getElementById("canvas");
canvasContext = canvas.getContext("2d");
canvas.imageSmoothingEnabled = false;
canvas.width = 320;
canvas.height = 180;

// $CTK CSS HAXX 
// additional (redundant!) code which successfully
// gives up crisp edges on windows running the latest
// chrome v.101.0.4951.67 (Official Build) (64-bit) on 2022-05-17
canvas.style.cssText = 
'image-rendering: optimizeSpeed;' +
'image-rendering: -moz-crisp-edges;' +
'image-rendering: -o-crisp-edges;' +
'image-rendering: -webkit-crisp-edges;' +
'image-rendering: crisp-edges;' +
'image-rendering: -webkit-optimize-contrast;' +
'image-rendering: pixelated; ' +
'-ms-interpolation-mode: nearest-neighbor;';
canvasContext.webkitImageSmoothingEnabled = false;
canvasContext.msImageSmoothingEnabled = false;
canvasContext.imageSmoothingEnabled = false;

var stats = Stats();
stats.showPanel(0);
document.body.appendChild(stats.dom);

//globals and constants

const GAMESTATE_TITLE = 0
const GAMESTATE_PLAY = 1;
const GAMESTATE_GAME_OVER = 2;
const GAMESTATE_CREDITS = 3;
const GAMESTATE_MINIMAP = 4;

const PRE_GAME_LOOP_COUNT = 4000;


const FRAMES_PER_SECOND = 60;
const SPLODE = 10;
const BULLET = 11;

// [ northTile, southTile, eastTile, westTile ];
const NORTH = 0;
const SOUTH = 1;
const EAST = 2;
const WEST = 3;
const GRIDSIZE = 8;



const imageList = [
//image loader assumes .png and appends it. all images should be in img/.
'3x5font',
'bat',
'bat2',
'bridge-inventory',
'bridge',
'bug',
"checkpoint_v1",
'enforcer',
'environment',
'flashlight-inventory',
'flashlight',
'key',
'mapb',
'map',
'maptest',
'orbit-key',
'smallFont',
'spawner',
'tiles',
'scrapper',
'tileeater_r1',
'tileeater_r2',
'tileeater_r3',
'sabre',
'sabreItem',
'sabre-inventory',
'gun-inventory',
'chalice-inventory',
'titleCard',

]

const soundList = [
    { name: "reverbE", url:"snd/verb/reverb1.wav" },
    { name: "reverbC", url:"snd/enemy-hurt-003.mp3" },

    { name: "test1", url:"snd/test1.mp3" },
    { name: "test2", url:"snd/test2.mp3" },
    { name: "eatingTile", url:"snd/eating-tile.mp3" },
    { name: "deliverTile", url:"snd/deliver-tile.mp3" },
    { name: "unloadingTile", url:"snd/unloading-tile.mp3" },
    { name: "boop", url:"snd/boop.mp3" },
    { name: "splode01", url:"snd/small-explosion-001.mp3" },
    { name: "splode02", url:"snd/small-explosion-002.mp3" },
    { name: "splode03", url:"snd/small-explosion-003.mp3" },
    { name: "splode04", url:"snd/small-explosion-004.mp3" },
    { name: "splode05", url:"snd/small-explosion-005.mp3" },
    { name: "splode06", url:"snd/small-explosion-006.mp3" },
    { name: "splode07", url:"snd/small-explosion-007.mp3" },
    { name: "splode08", url:"snd/small-explosion-008.mp3" },

    { name: "bigSplode01", url:"snd/big-explosion-001.mp3" },
    { name: "bigSplode02", url:"snd/big-explosion-002.mp3" },
    { name: "bigSplode03", url:"snd/big-explosion-003.mp3" },
    { name: "bigSplode04", url:"snd/big-explosion-004.mp3" },
    { name: "bigSplode05", url:"snd/big-explosion-005.mp3" },
    { name: "bigSplode06", url:"snd/big-explosion-006.mp3" },
    { name: "bigSplode07", url:"snd/big-explosion-007.mp3" },
    { name: "bigSplode08", url:"snd/big-explosion-008.mp3" },

    { name: "bulletHitWall01", url:"snd/bullet-hit-wall-001.mp3" },
    { name: "bulletHitWall02", url:"snd/bullet-hit-wall-002.mp3" },
    { name: "bulletHitWall03", url:"snd/bullet-hit-wall-003.mp3" },
    { name: "bulletHitWall04", url:"snd/bullet-hit-wall-004.mp3" },
    { name: "bulletHitWall05", url:"snd/bullet-hit-wall-005.mp3" },
    { name: "bulletHitWall06", url:"snd/bullet-hit-wall-006.mp3" },
    { name: "bulletHitWall07", url:"snd/bullet-hit-wall-007.mp3" },
    { name: "bulletHitWall08", url:"snd/bullet-hit-wall-008.mp3" },

    { name: "bulletHitEnemy01", url:"snd/bullet-hits-enemy-001.mp3" },
    { name: "bulletHitEnemy02", url:"snd/bullet-hits-enemy-002.mp3" },
    { name: "bulletHitEnemy03", url:"snd/bullet-hits-enemy-003.mp3" },
    { name: "bulletHitEnemy04", url:"snd/bullet-hits-enemy-004.mp3" },
    { name: "bulletHitEnemy05", url:"snd/bullet-hits-enemy-005.mp3" },

    { name: "enemyHurt01", url:"snd/enemy-hurt-001.mp3" },
    { name: "enemyHurt02", url:"snd/enemy-hurt-002.mp3" },
    { name: "enemyHurt03", url:"snd/enemy-hurt-003.mp3" },
    { name: "enemyHurt04", url:"snd/enemy-hurt-004.mp3" },
    { name: "enemyHurt05", url:"snd/enemy-hurt-005.mp3" },
    { name: "enemyHurt06", url:"snd/enemy-hurt-006.mp3" },
    { name: "enemyHurt07", url:"snd/enemy-hurt-007.mp3" },
    { name: "enemyHurt08", url:"snd/enemy-hurt-008.mp3" },

    { name: "playerHurt09", url:"snd/player-hurt-009.mp3" },
    { name: "playerHurt01", url:"snd/player-hurt-001.mp3" },

    { name: "playerFootstep03", url:"snd/player-footstep-003.mp3" },

    { name: "enforcer_offscreen" , url:"snd/enforcer_offscreen.mp3" },
    { name: "enforcer_onscreen" , url:"snd/enforcer_onscreen.mp3" },

    { name: "pewpew" , url:"snd/shoot-276.mp3" },
    { name: "pewpew2" , url:"snd/shoot-302.mp3" },

    { name: "barrierHit" , url:"snd/barrier-hit.mp3" },

    { name: "bgm_exploration", url:"snd/bgm-exploration-2-v1.mp3" },
    { name: "bgm_attack", url:"snd/bgm-attack-v1.mp3" },
    { name: "bgm_title", url:"snd/bgm-adventure-v2.mp3" },
    // { name: "bullethit", url:"snd/Shoot 245"}

]

var gameState = GAMESTATE_TITLE;
var previousGameState = null;
var ticker = 0;
var loader = new AssetLoader();
var audio = new AudioGlobal();
var sounds = loader.sounds;
var play = audio.playSound;
var img, gameFont, tinyFont;
var fps, fpsInterval, startTime, now, then, elapsed;

var congrats =
`

CONGRATULATIONS!
You have defeated the virus and saved Arcadia!

`

var noWin =
`

You have not yet finished the game.


`
var gameWon = false;
gameWonText = gameWon ? congrats : noWin;


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

var playerStart= { x: 1210, y: 589}
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
    //console.log('loading sounds');
    loader.soundLoader({context: audio.context, urlList: soundList, callback: loadingComplete});
    loader.loadAudioBuffer();
}

function loadingComplete(){    
    audio.assignReverb(loader.sounds.reverbE);
    //console.log('loading complete, initializing game');
    worldInit();

    gameFont = new spriteFont({
        width: 255,
        height: 128,
        characterHeight: 9,
        characterWidth: 6,
        image: img.smallFont
    })

    tinyFont = new spriteFont({
        width: 320,
        height: 240,
        characterHeight: 6,
        characterWidth: 4,
        image: img["3x5font"]
    })

    gameScreen.reset(false);
    begin(FRAMES_PER_SECOND);
}

function worldInit(){
    world = new World(img['map'].width, img['map'].height, 8);
    world.populateWithImage(img['map'])
}

function begin(fps) {
    fpsInterval = 1000/fps;
    then = Date.now();
    startTime = then;
    mainLoop();
}

function mainLoop(){

    requestAnimationFrame(mainLoop);

    // calc elapsed time since last loop
    now = Date.now();
    elapsed = (now - then) * slowmoTimeScale;

    // if enough time has elapsed, draw the next frame
    if (elapsed > fpsInterval) {

        // Get ready for next frame by setting then=now, but also adjust for your
        // specified fpsInterval not being a multiple of RAF's interval (16.7ms) <--used to be pretty normal
        //to expect 60fps.  nowadays, it could be 120fps or even 240fps.  So, we need to adjust for that.
        then = now - (elapsed % fpsInterval);

        // Put your drawing code here
        gameLoop();
    }
}

function gameLoop() {
    ticker++;
    stats.begin();
    const lastLoopGameState = previousGameState;
    previousGameState = gameState;
    switch (gameState) {
        case GAMESTATE_TITLE:
            if(lastLoopGameState !== GAMESTATE_TITLE)
                titleScreen.enter();
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
            creditsScreen.draw(gameWonText);
            creditsScreen.update();
            break;
        case GAMESTATE_MINIMAP:
            miniMapScreen.draw();
            miniMapScreen.update();
            break;
    }
    audio.update();
    Key.update();
    stats.end();
    
    if(lastLoopGameState ===  GAMESTATE_TITLE  && previousGameState !== GAMESTATE_TITLE)
    {
        titleScreen.leave();
    }
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
canvas.addEventListener('mouseup',getMousePosition);
init();
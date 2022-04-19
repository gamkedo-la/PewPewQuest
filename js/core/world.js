const World = function World(widthInTiles=100, heightInTiles=100, tileSize=8){
    this.heightInTiles = heightInTiles;
    this.widthInTiles = widthInTiles;
    this.tileSize = tileSize;
    this.data = [];
    this.decorData = [];
    this.entities = [];
    this.bullets = [];
    this.safeSpots = [];
    this.noCollide = false;
    //world entities need updated every frame regardless of whether they are in the viewport
    this.worldEntities = [];

    return this;
}

World.prototype.getTileAtPosition = function getTileAtPosition(tx, ty){
    return this.data[this.widthInTiles*ty + tx];
}

World.prototype.getTileAtPixel = function(x, y){
    return this.getTileAtPosition(Math.floor(x/this.tileSize), Math.floor(y/this.tileSize));
}

World.prototype.setTileAtPosition = function setTileAtPosition(tx, ty, value=1){
    return this.data[this.widthInTiles*ty + tx] = value;
}


World.prototype.getIndexAtPosition = function getIndexAtPosition(tx, ty){
    return this.widthInTiles*ty + tx;
}

World.prototype.pixelToTileID = function pixelToTileID(x, y){
    return this.data[this.pixelToTileIndex(x, y)];
}

World.prototype.pixelToTileIndex = function pixelToTileIndex(x, y){
    let tx = Math.floor(x / this.tileSize);
    let ty = Math.floor(y / this.tileSize);
    return this.getIndexAtPosition(tx, ty);
}

World.prototype.pixelToTileGrid = function pixelToTileGrid(x, y){
    return {
            x: Math.floor(x / this.tileSize),
            y: Math.floor(y / this.tileSize)
            }
}

World.prototype.tileFillRect = function tileFillRect( tx, ty, width, height, value ){
    for(let i = ty; i <= ty + height; i++){
        let start = this.widthInTiles * i + tx;
        let finish = start + width+1;
        this.data.fill(value, start, finish);
    }
}

World.prototype.tileFillRectRandom = function tileFillRectRandom(params = {
    tx: 0, ty: 0, width: 1, height: 1, rangeStart: 0, rangeEnd: 0,
}){
    for(let i = params.tx; i <= params.tx + params.width; i++){
        for(let j = params.ty; j <= params.ty + params.height; j++){
            this.data[j * this.widthInTiles + i] = Math.floor( Math.random() * (params.rangeEnd-params.rangeStart) ) + params.rangeStart
        }
    }
}

World.prototype.tileFillCircle = function tileFillCircle( tx, ty, radius, value ){
    let rad = Math.floor(radius);
    for(let y = -rad; y <= rad; y++){
        for(let x = -rad; x <=rad; x++){
            if(x*x+y*y <= rad*rad){
                this.data[this.getIndexAtPosition(tx+x, ty+y)] = value;
            }
        }
    }
}

World.prototype.populateWithImage = function populateWithImage(image){
    let c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.height;
    let ctx = c.getContext('2d');
    ctx.drawImage(image, 0, 0);
    let data = new Uint32Array(ctx.getImageData(0, 0, image.width, image.height).data.buffer);
    this.decorData = new Uint32Array(image.width * image.height);
    for(let i = 0; i < this.decorData.length; i++){
        this.decorData[i] = tileRandomGenerator.nextIntRange(0, 31);
    }
    this.data = data;

    image = img['environment'];
    ctx.drawImage(image, 0, 0);
    data = new Uint32Array(ctx.getImageData(0, 0, image.width, image.height).data.buffer); 
    this.environmentData = data;
    
    palette = this.data.slice(0, 256);
    this.populateMapPalette(palette);
    this.populateCSSColorsArray();
    this.populateMapObjects();
}


World.prototype.drawMap = function(){
    let left = Math.floor(view.x/8);
    let right = Math.ceil((view.x+view.width)/8);
    let top = Math.floor(view.y/8);
    let bottom = Math.ceil((view.y+view.height)/8);


    //--------------
    for(let i = left; i < right; i++){
        for(let j = top; j < bottom; j++){
            let tile = this.getTileAtPosition(i, j);
            
                switch(tile){
                    case 0:
                        if(inventory.items.torch && inventory.selectedItem == 'torch'){
                            this.drawLightGridRadius(i,j,player,50, "#202030");
                        }
                        //this.drawFilledTile(i,j,tile);
                        this.drawImageTile(i,j,tile);
                        break;
                    case COLOR_DIRTY_RED:{
                        this.drawGlitchTile(i,j,tile);
                        break;

                    }
                    default:
                        //this.drawFilledTile(i,j,tile);
                        this.drawImageTile(i,j,tile);
                        break;

                }
            
        }
    }
}

World.prototype.drawLightGridRadius = function(i, j, location, radius, color = '#101010'){
    let tilePosition = {x: i*8, y: j*8};
    let distanceFromLocation = Math.sqrt(Math.pow(location.x - tilePosition.x, 2) + Math.pow(location.y - tilePosition.y, 2));
    if(distanceFromLocation < radius){
        normalizedDistance = distanceFromLocation/radius;
        fillRect(
        Math.round ( (i*this.tileSize-view.x+4*normalizedDistance) ),
        Math.round ( (j*this.tileSize-view.y+4*normalizedDistance) ),
        Math.round ( 8-(this.tileSize-2)*normalizedDistance ),
        Math.round ( 8-(this.tileSize-2)*normalizedDistance ),
        color
        );
    }
}

World.prototype.drawCheckeredOverlay = function(i,j){
    if((i+j)%2 == 0){
        fillRect(i*this.tileSize-view.x, j*this.tileSize-view.y, this.tileSize, this.tileSize, "rgba(16,0,8,0.2)");
    }
}

World.prototype.drawFilledTile = function(i,j,tile){
    fillRect(i*this.tileSize-view.x, j*this.tileSize-view.y, this.tileSize, this.tileSize, convertUint32ToRGBA(tile));
}

World.prototype.drawImageTile = function(i,j,basicTileColor){
    let tilesheet = img['tiles']
    let row = palette.indexOf(basicTileColor) * 8
    let column = this.decorData[this.widthInTiles * j + i] * 8
    //console.log(`${row}, ${column}`)
    
    canvasContext.drawImage(
        tilesheet,
        column, row, 8, 8,
        i*this.tileSize-view.x, j*this.tileSize-view.y, this.tileSize, this.tileSize
    );

}

World.prototype.drawGlitchTile = function(i,j,basicTileColor){
    let tilesheet = img['tiles']
    let row = palette.indexOf(basicTileColor) * 8
    let column = this.decorData[this.widthInTiles * j + i] * 8
    let randomDecor = Math.floor(Math.random() * 32);
    //console.log(`${row}, ${column}`)
    
    canvasContext.drawImage(
        tilesheet,
        randomDecor, row, 8, 8,
        i*this.tileSize-view.x, j*this.tileSize-view.y, this.tileSize, this.tileSize
    );

}


World.prototype.populateMapObjects = function(){
    for(let i = 0; i < this.widthInTiles; i++){
        for(let j = 0; j < this.heightInTiles; j++){
            let tile = this.getTileAtPosition(i, j);
           switch (tile){
                case DOORKEY:
                let obj = new DoorKey(i * 8, j * 8, tile);
                this.entities.push(obj);
                this.setTileAtPosition(i, j, 0);
                break;
                case BARRIER:{
                    let neighbors = this.getNeighbors(i, j);
                    let barrier = new Barrier(i, j, ...neighbors);
                    world.entities.push(barrier);
                }
                break;
                case ENEMY_MINION:{
                    let neighbors = this.getNeighbors(i, j);
                    let enemy = new Bug(i, j, ...neighbors);
                    world.entities.push(enemy);
                    this.setTileAtPosition(i, j, 0);
                    break;
                }
                case FLASHLIGHT:{
                    let light = new Flashlight(i,j);
                    world.entities.push(light);
                    this.setTileAtPosition(i, j, 0);
                    break;
                }
                case ENEMY_BAT:{
                    let bat = new Bat(i,j);
                    world.entities.push(bat);
                    this.setTileAtPosition(i, j, 0);
                    break;
                }
                case BRIDGE:{
                    console.log("bridge placed")
                    let bridge = new Bridge(i,j);
                    world.worldEntities.push(bridge);
                    this.setTileAtPosition(i, j, 0);
                    break;
                }
                case SPAWNER:{
                    let neighbors = this.getNeighbors(i, j);
                    let spawner = new Spawner(i,j, ...neighbors);
                    world.entities.push(spawner);
                    this.setTileAtPosition(i, j, 0);
                    break;
                }
                case ENFORCER:{
                    let neighbors = this.getNeighbors(i, j);
                    let enforcer = new Enforcer(i,j, ...neighbors);
                    //we want Enforcers to follow player beyond screen bounds, so
                    //it goes in worldEntties. 
                    world.worldEntities.push(enforcer);
                    this.setTileAtPosition(i, j, 0);
                    break;
                }
                case SCRAPPER:{
                    let neighbors = this.getNeighbors(i, j);
                    let scrapper = new Scrapper(i,j, ...neighbors);
                    //we want Enforcers to follow player beyond screen bounds, so
                    //it goes in worldEntties. 
                    world.worldEntities.push(scrapper);
                    this.setTileAtPosition(i, j, 0);
                    break;
                }
                case TREASURE:{
                    let treasure = new Treasure(i,j);   
                    world.entities.push(treasure);
                    console.log("treasure placed");
                    this.setTileAtPosition(i, j, 0);
                    break;
                }
                case SAFE_SPOT:{
                    let safeSpot = {x: i, y: j};
                    world.safeSpots.push(safeSpot);
                    this.setTileAtPosition(i, j, 0);
                    break;

                }
                case TILE_EATER:{
                    let neighbors = this.getNeighbors(i, j);
                    let tileeater = new Tileeater(i,j, ...neighbors);
                    //we want Enforcers to follow player beyond screen bounds, so
                    //it goes in worldEntties. 
                    world.worldEntities.push(tileeater);
                    this.setTileAtPosition(i, j, 0);
                    break;
                }
            }
        }
    }
}


World.prototype.populateMapPalette = function(palette){
    //palette is a slice of the first 256 entries of the world data array.
    //you can see the colors in the top left corner of map.png. 
    //256 is arbitrary; we're not really using an indexed color image to make this work
    //the order they appear in in the image becomes their indice in palette[].
    
    //yeah yeah, making globals from within a function is bad, but I'm lazy

    //these color constants are meant to be used for logic in the game, not for drawing.
    //for drawing functions use COLORS[]. 
    COLOR_BLACK__TRANSPARENT = palette[0];
    COLOR_VALHALLA = palette[1];
    COLOR_LOULOU = palette[2];
    COLOR_OILED_CEDAR = palette[3];
    COLOR_ROPE = palette[4];
    COLOR_TAHITI_GOLD = palette[5];
    COLOR_TWINE = palette[6];
    COLOR_PANCHO = palette[7];
    COLOR_GOLDEN_FIZZ = palette[8];
    COLOR_ATLANTIS = palette[9];
    COLOR_CHRISTI = palette[10];
    COLOR_ELF_GREEN = palette[11];
    COLOR_DELL = palette[12];
    COLOR_VERDIGRIS = palette[13];
    COLOR_OPAL = palette[14];
    COLOR_DEEP_KOAMARU = palette[15];
    COLOR_VENICE_BLUE = palette[16];
    COLOR_ROYAL_BLUE = palette[17];
    COLOR_CORNFLOWER = palette[18];
    COLOR_VIKING = palette[19];
    COLOR_LIGHT_STEEL_BLUE = palette[20];
    COLOR_WHITE = palette[21];
    COLOR_HEATHER = palette[22];
    COLOR_TOPAZ = palette[23];
    COLOR_DIM_GRAY = palette[24];
    COLOR_SMOKEY_ASH = palette[25];
    COLOR_CLAIRVOYANT = palette[26];
    COLOR_DIRTY_RED = palette[27];
    COLOR_MANDY = palette[28];
    COLOR_PLUM = palette[29];
    COLOR_RAIN_FOREST = palette[30];
    COLOR_STINGER = palette[31];

    //item and gameobject specific 
    DOORKEY = palette[32];
    BARRIER = palette[33];
    ONE = palette[34];
    TWO = palette[35];
    THREE = palette[36];
    FOUR = palette[37];
    FIVE = palette[38];
    ENEMY_MINION = palette[39];
    FLASHLIGHT = palette[40];
    ENEMY_BAT = palette[41];
    BRIDGE = palette[42];
    SPAWNER = palette[43];
    ENFORCER = palette[44];
    SCRAPPER = palette[45];
    TREASURE = palette[46];
    SAFE_SPOT = palette[47];
    TILE_EATER = palette[48];
    PARTICLE = 1000;

    COMBAT_MODE=palette[8];
    EXPLORATION_MODE=palette[0];

    world.data.fill(0, 0, 256);

}

World.prototype.populateCSSColorsArray = function(){
    //these color constants meant to be used for drawing.
    COLORS = {
        transparent: convertUint32ToRGBA(COLOR_BLACK__TRANSPARENT),
        valhalla: convertUint32ToRGBA(COLOR_VALHALLA),
        loulou: convertUint32ToRGBA(COLOR_LOULOU),
        oiledCedar: convertUint32ToRGBA(COLOR_OILED_CEDAR),
        rope: convertUint32ToRGBA(COLOR_ROPE),
        tahitiGold: convertUint32ToRGBA(COLOR_TAHITI_GOLD),
        twine: convertUint32ToRGBA(COLOR_TWINE),
        panther: convertUint32ToRGBA(COLOR_PANCHO),
        goldenFizz: convertUint32ToRGBA(COLOR_GOLDEN_FIZZ),
        atlantis: convertUint32ToRGBA(COLOR_ATLANTIS),
        christi: convertUint32ToRGBA(COLOR_CHRISTI),
        elfGreen: convertUint32ToRGBA(COLOR_ELF_GREEN),
        dell: convertUint32ToRGBA(COLOR_DELL),
        verdigris: convertUint32ToRGBA(COLOR_VERDIGRIS),
        opal: convertUint32ToRGBA(COLOR_OPAL),
        deepKoamaru: convertUint32ToRGBA(COLOR_DEEP_KOAMARU),
        veniceBlue: convertUint32ToRGBA(COLOR_VENICE_BLUE),
        royalBlue: convertUint32ToRGBA(COLOR_ROYAL_BLUE),
        cornflower: convertUint32ToRGBA(COLOR_CORNFLOWER),
        viking: convertUint32ToRGBA(COLOR_VIKING),
        lightSteelBlue: convertUint32ToRGBA(COLOR_LIGHT_STEEL_BLUE),
        white: convertUint32ToRGBA(COLOR_WHITE),
        heather: convertUint32ToRGBA(COLOR_HEATHER),
        topaz: convertUint32ToRGBA(COLOR_TOPAZ),
        dimGray: convertUint32ToRGBA(COLOR_DIM_GRAY),
        smokeyAsh: convertUint32ToRGBA(COLOR_SMOKEY_ASH),
        clairvoyant: convertUint32ToRGBA(COLOR_CLAIRVOYANT),
        dirtyRed: convertUint32ToRGBA(COLOR_DIRTY_RED),
        mandy: convertUint32ToRGBA(COLOR_MANDY),
        plum: convertUint32ToRGBA(COLOR_PLUM),
        rainForest: convertUint32ToRGBA(COLOR_RAIN_FOREST),
        stinger: convertUint32ToRGBA(COLOR_STINGER),
   
    }
}

World.prototype.getNeighbors = function(i, j){
    let north = this.getTileAtPosition(i, j-1);
    let south = this.getTileAtPosition(i, j+1);
    let east = this.getTileAtPosition(i+1, j);
    let west = this.getTileAtPosition(i-1, j);
    return [north, south, east, west];
}
World.prototype.drawMiniMap = function(){
   scale = 8;
    //--------------
    for(let i = 0; i < canvas.width; i++){
        for(let j = 0; j < canvas.height; j++){
            
            
            let tileX = Math.floor( view.x/scale - (canvas.width/2));
            let tileY = Math.floor( view.y/scale - (canvas.height/2));

            tileX += i;
            tileY += j;

            let tile = this.getTileAtPosition(tileX, tileY);
            fillRect(i, j, 1,1, convertUint32ToRGBA(tile));

        }
    }
    fillRect(
        player.x/scale - view.x/scale + canvas.width/2,
        player.y/scale - view.y/scale + canvas.height/2,
        1*(8/scale), 1*(8/scale), COLORS.goldenFizz);

    world.entities.forEach(function(entity){
        fillRect(
            (entity.x/scale) - (view.x/scale) + canvas.width/2,
            (entity.y/scale) - (view.y/scale) + canvas.height/2,
            1*(8/scale),1*(8/scale),
            ticker%2 == 0 ? COLORS.goldenFizz : COLORS.dell);

    })
    world.worldEntities.forEach(function(entity){
        fillRect(
            (entity.x/scale) - (view.x/scale) + canvas.width/2,
            (entity.y/scale) - (view.y/scale) + canvas.height/2,
            1*(8/scale),1*(8/scale),
            ticker%2 == 0 ? COLORS.dirtyRed : COLORS.dell);

    })
}
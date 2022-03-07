function clearScreen(color='#040408'){
    canvasContext.save();
    canvasContext.setTransform(1,0,0,1,0,0);
    canvasContext.fillStyle = color;
    canvasContext.fillRect(0, 0, c.width, c.height);
    canvasContext.restore();
}

/**
 * draws a filled equaliteral polygon. assumes canvasContext exists
 * @param  {} x: x position of center
 * @param  {} y: y position of center
 * @param  {} r: radius
 * @param  {} sides: number of sides
 * @param  {} filled=true : if true, will draw a filled polygon otherwise stroke, with current context fillStyle or strokeStyle
 * @param  {} rotation=0 : rotation of polygon in radians
 */
function fillPolygon(x,y,r,sides, rotation=0){
    sides = sides || Math.floor( 120 * (r*2) )+16;
    canvasContext.beginPath();
    for(let i = 0; i < sides; i++){
        let j = i/sides * 6.283185; //tau radians
        let px = x + Math.cos(j+rotation)*r;
        let py = y + Math.sin(j+rotation)*r;
        canvasContext.lineTo(px,py);
    }
    canvasContext.closePath();
    canvasContext.fill();
}

/**
 * draws a stroked equaliteral polygon. assumes canvasContext exists
 * @param  {} x: x position of center
 * @param  {} y: y position of center
 * @param  {} r: radius
 * @param  {} sides: number of sides
 * @param  {} filled=true : if true, will draw a filled polygon otherwise stroke, with current context fillStyle or strokeStyle
 * @param  {} rotation=0 : rotation of polygon in radians
 */
 function strokePolygon(x,y,r,sides, rotation=0){
    sides = sides || Math.floor( 120 * (r*2) )+16;
    canvasContext.beginPath();
    for(let i = 0; i < sides; i++){
        let j = i/sides * 6.283185; //tau radians
        let px = x + Math.cos(j+rotation)*r;
        let py = y + Math.sin(j+rotation)*r;
        canvasContext.lineTo(px,py);
    }
    canvasContext.closePath();
    canvasContext.stroke();
}

/**
 * draws a filled rectangle. assumes canvasContext exists
 * @param  {} x: x position of center
 * @param  {} y: y position of center
 * @param  {} width: width of rectangle
 * @param  {} height: height of rectangle
 */
function fillRect(x,y,width,height,filled = true){
    canvasContext.fillRect(x, y,width, height );
}


/**
 * fills one pixel. assumes canvasContext exists
 * @param  {} x: x position of pixel
 * @param  {} y: y position of pixel
 * @param  {} color: color of pixel. default is error magenta
 * 
 */
function pset(x,y, color='#FF00FF'){
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x,y, 1, 1);
}

function onScreen(position, width = 0, height = 0,){

    let x = position.x;
    let y = position.y;

    //none of this is right, also needs to account for padding
    //TODO: rewrite as AABB check instead of point in rect
    const left = view.x - width;
    const top = view.y - height;
    const right = view.x + canvas.width;
    const bottom = view.y + canvas.height;

  return x > left && x < right && y > top && y < bottom
  
}
function spriteFont({
    width, 
    height,  
    characterWidth, 
    characterHeight, 
    characterOrderString = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.0123456789 '!@#$%^&*()+-=,":;><`,
    image }
    ={}
    ){
        this.width = width;
        this.height = height;
        this.characterWidth = characterWidth;
        this.characterHeight = characterHeight;
        
        this.widthInCharacters = Math.floor( width / characterWidth );
        this.heightInCharacters = Math.floor( height / characterHeight );
        this.characterMap = characterOrderString.split("");
        this.image = image;

        return this;
    }

spriteFont.prototype.drawText = function drawText(textString, pos={x: 0, y: 0}, hspacing=0, vspacing = 2, scale=1){
    if (!textString) return;
    var lines = textString.split("\n");
    var self = this;
    self.pos = pos, self.hspacing = hspacing, self.vspacing = vspacing;
    lines.forEach(function(line, index, arr){
        self.textLine( { textString:line, pos:{x: self.pos.x, y: self.pos.y + index * (self.characterHeight + self.vspacing)*scale }, hspacing: self.hspacing }, scale )
    })
}

spriteFont.prototype.textLine = function textLine({ textString, pos={x: 0, y: 0}, hspacing=0 } = {}, scale=1){
    var textStringArray = textString.split("");
    var self = this;

    textStringArray.forEach(function(character, index, arr){
        //find index in characterMap
        let keyIndex = self.characterMap.indexOf(character);
        //tranform index into x,y coordinates in spritefont texture
        let spriteX = (keyIndex % self.widthInCharacters) * self.characterWidth;
        let spriteY = Math.floor( keyIndex / self.widthInCharacters ) * self.characterHeight;
        //draw
        //console.log(character);
        canvasContext.imageSmoothingEnabled = false;
        canvasContext.drawImage(
            self.image,
            spriteX,
            spriteY,
            self.characterWidth,
            self.characterHeight,
            pos.x + ( (self.characterWidth + hspacing) * index * scale),
            pos.y,
            self.characterWidth * scale,
            self.characterHeight * scale
        )
        //console.log(keyIndex);
    })
}



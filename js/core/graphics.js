/**
 * clears the screen by filling it with the background color. Assumes canvasContext exists
 * @param  {} color='#040408' : background color to clear with
 */
function clearScreen(color='#040408'){
    canvasContext.fillStyle = color;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
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
function fillPolygon(x,y,r,sides, rotation=0, color='white'){
    sides = sides || Math.floor( 120 * (r*2) )+16;
    canvasContext.beginPath();
    for(let i = 0; i < sides; i++){
        let j = i/sides * 6.283185; //tau radians
        let px = x + Math.cos(j+rotation)*r;
        let py = y + Math.sin(j+rotation)*r;
        canvasContext.lineTo(px,py);
    }
    canvasContext.fillStyle=color;
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
; function strokePolygon(x,y,r,sides, rotation=0, color='white'){
    sides = sides || Math.floor( 120 * (r*2) )+16;
    
    for(let i = 0; i < sides; i++){

        let j = i/sides * 6.283185; //tau radians
        let j2 = (i+1)/sides * 6.283185; //tau radians

        var sx = x + Math.cos(j+rotation)*r;
        var sy = y + Math.sin(j+rotation)*r;

        let px = x + Math.cos(j2+rotation)*r;
        let py = y + Math.sin(j2+rotation)*r;

        pixelLine(sx,sy,px,py,color);
    }
}

/**
 * draws a filled rectangle. assumes canvasContext exists
 * @param  {} x: x position of top left corner
 * @param  {} y: y position of top left corner
 * @param  {} width: width of rectangle
 * @param  {} height: height of rectangle
 */
function fillRect(x,y,width,height, color='white'){
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y,width, height );
}

/**
 * draws a rectangle given an object (collider)
 * @param {*} rectangle: object with left, right, top, and bottom properties
 * @param {*} color 
 */
function fillRectangle(rectangle, color = 'white') {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(rectangle.left - view.x, rectangle.top - view.y, rectangle.right - rectangle.left, rectangle.bottom - rectangle.top);
}

/**
 * draws a stroked rectangle. assumes canvasContext exists
 * @param  {} x: x position of center
 * @param  {} y: y position of center
 * @param  {} width: width of rectangle
 * @param  {} height: height of rectangle
 */
 function strokeRect(x,y,width,height, color='white'){
    canvasContext.strokeStyle =`1px solid ${color}`;
    canvasContext.strokeRect(x, y ,width, height );
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
/**
 * 
 * @param  {} {width
 * @param  {} height
 * @param  {} characterWidth
 * @param  {} characterHeight
 * @param  {} characterOrderString=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.0123456789'!@#$%^&*(
 * @param  {} +-=
 * @param  {;><`} "
 * @param  {} image}={}
 */
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
    })
}

pixelLine = function(x1, y1, x2, y2, color='white') {

    x1 = x1 | 0,
        x2 = x2 | 0,
        y1 = y1 | 0,
        y2 = y2 | 0;

    var dy = (y2 - y1);
    var dx = (x2 - x1);
    var stepx, stepy;

    if (dy < 0) {
        dy = -dy;
        stepy = -1;
    } else {
        stepy = 1;
    }
    if (dx < 0) {
        dx = -dx;
        stepx = -1;
    } else {
        stepx = 1;
    }
    dy <<= 1; // dy is now 2*dy
    dx <<= 1; // dx is now 2*dx

    pset(x1, y1, color);
    if (dx > dy) {
        var fraction = dy - (dx >> 1); // same as 2*dy - dx
        while (x1 != x2) {
            if (fraction >= 0) {
                y1 += stepy;
                fraction -= dx; // same as fraction -= 2*dx
            }
            x1 += stepx;
            fraction += dy; // same as fraction -= 2*dy
            pset(x1, y1, color);
        };
    } else {
        fraction = dx - (dy >> 1);
        while (y1 != y2) {
            if (fraction >= 0) {
                x1 += stepx;
                fraction -= dy;
            }
            y1 += stepy;
            fraction += dx;
            pset(x1, y1, color);
        }
    }

}

convertUint32ToRGBA = function convertUint32ToRGBA(color){
    return `rgba(${(color)&255},${(color>>8)&255},${color>>16&255},${(color>>24)&255})`;
}

convertUint32ToHex = function convertUint32ToHex(color){
   return`#${(color>>16)&255}${(color>>8)&255},${color&255}${(color>>24)&255}`;
}


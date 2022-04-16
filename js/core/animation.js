class Animation {
  constructor({spriteSheet, frames, frameRate = 30, loop = true, noInterrupt = true} = {}) {

    
    this.spriteSheet = spriteSheet;

   
    this.frames = frames;

    
    this.frameRate = frameRate;

    
    this.loop = loop;

    this.noInterrupt = noInterrupt;

    let { width, height, margin = 0 } = spriteSheet.frame;

    
    this.width = width;

    
    this.height = height;

    
    this.margin = margin;

    if (!this.frames) {
      const imageWidth = this.spriteSheet.image.width;
      const imageHeight = this.spriteSheet.image.height;
      const framesPerRow = imageWidth / this.width;
      const framesPerCol = imageHeight / this.height;
      const frameCount = framesPerRow * framesPerCol
      for (let i = 0; i < frameCount; i++) this.frames.push(i);
    }

    
    this.currentFrame = 0;
    this.accumulator = 0;
    this.done = false;
  }

  
  clone() {
    return animationFactory(this);
  }

  reset() {
    this.currentFrame = 0;
    this.accumulator = 0;
    this.done = false;
  }

  update(dt = 1/60) {

    // if the animation doesn't loop we stop at the last frame
    if (!this.loop && this.currentFrame == this.frames.length-1){
      this.done = true;
      return;
    } 

    this.accumulator += dt;

    // update to the next frame if it's time
    while (this.accumulator * this.frameRate >= 1) {
      this.currentFrame = ++this.currentFrame % this.frames.length;
      this.accumulator -= 1 / this.frameRate;
    }
  }

  render({x, y, width = this.width, height = this.height} = {}) {

    // get the row and col of the frame
    let row = this.frames[this.currentFrame] / this.spriteSheet._f | 0;
    let col = this.frames[this.currentFrame] % this.spriteSheet._f | 0;

    canvasContext.drawImage(
      this.spriteSheet.image,
      col * this.width + (col * 2 + 1) * this.margin,
      row * this.height + (row * 2 + 1) * this.margin,
      this.width, this.height,
      x, y,
      width, height
    );
  }
}

function animationFactory(properties) {
  return new Animation(properties);
}
animationFactory.prototype = Animation.prototype;
animationFactory.class = Animation;
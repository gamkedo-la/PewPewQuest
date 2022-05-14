const creditsScreen = {

    reset: function(){
        ticker = 0;
    },

    draw: function (additionalText="") {
        this.credits=``+
this.congratsText +
`
HomeTeam GameDev Presents:
PewPewQuest

a JS game led by Ryan Malm from
March 21st thru May 22th 2022

John Doe: thing 1 and thing 2
Jane Doe: thing 3 and thing 4
Credits Scroller
Credits Scroller
Credits Scroller
Credits Scroller
Credits Scroller
Credits Scroller
Credits Scroller
Credits Scroller
Credits Scroller
Credits Scroller
Credits Scroller
Credits Scroller
`
        this.congratsText = additionalText;
        clearScreen('black');
        let verticalSpacing = 4;
        let creditsLength = this.credits.split(/\r?\n/).length * ( gameFont.characterHeight + verticalSpacing) + canvas.height;
        console.log(this.credits.split(/\r?\n/).length);
        gameFont.drawText( this.credits, { x: 10, y: canvas.height - (ticker/2) % creditsLength }, 0, verticalSpacing);
        gameFont.drawText( this.credits, { x: 10, y: creditsLength + (ticker/2) % creditsLength }, 0, verticalSpacing);
    },

    update: function () {
       if(Key.justReleased(Key.ENTER)) { signal.dispatch('titleScreen'); }
       if(gamepad.start()) { signal.dispatch('titleScreen'); }
    }
}

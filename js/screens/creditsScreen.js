credits =
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
var creditsScreen = {
    reset: function(){
        ticker = 0;
    },

    draw: function () {
        clearScreen('black');
        //todo: add centered text function to spriteFont
        verticalSpacing = 4;
        creditsLength = credits.split(/\r?\n/).length * ( gameFont.characterHeight + verticalSpacing) + canvas.height;
        console.log(credits.split(/\r?\n/).length);
        gameFont.drawText( credits, { x: 10, y: canvas.height - (ticker/2) % creditsLength }, 0, verticalSpacing);
        gameFont.drawText( credits, { x: 10, y: creditsLength + (ticker/2) % creditsLength }, 0, verticalSpacing);
    },

    update: function () {
       if(Key.justReleased(Key.ENTER)) { signal.dispatch('titleScreen'); }
    }
}

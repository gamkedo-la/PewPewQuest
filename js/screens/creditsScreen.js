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

Ryan Malm: Project lead, core gameplay, tile art, 
map system, collisions, items, bridge feature, 
level design, inventory, key barriers, minimap 
fast travel, base enemy mechanics, enemy behavior 
(bat, bug, enforcer, scrapper polish), camera 
movement, treasure tile glitch effect, explode 
sounds, particle system, sounds (player hurt, 
footstep), custom vector draw code, win state

Tylor Allison: Armor rings, player sabre weapon, 
enemy functionality (tile eater, scrapper, 
checkpoint), sprites (bat, bug, spawner, tile 
eater), various bullet improvements, assorted 
gameplay tuning, game over

Evan Sklarski: Enforcer AI improvements, better
mouse targeting, Firefox compatiblity fix, audio
bug patched, key carry effect, bridge glitch
tweaks, collision debug draw

Michael "Misha" Fewkes: Sounds (explosions,
enforcer), reverb support, sound voice limiting,
bit crush

Klaim (A. Joel Lamotte): Exploration music

Christer "McFunkypants" Kaitila: Bats stealing
keys, slow motion effect, gamepad support, minimap
optimization, analog input, additional sounds
(scrapper), pixel sharp fix

Patrick McKeown: Sounds (tile pickup, hurt,
pause/unpause, player captured), initial sound
test code

H Trayford: Collision precision fix, dpad movement,
animation loading improvements

Syed Daniyal Ali: Practice commit
`
        this.congratsText = additionalText;
        clearScreen('black');
        let verticalSpacing = 4;
        let creditsLength = this.credits.split(/\r?\n/).length * ( gameFont.characterHeight + verticalSpacing) + canvas.height;
        //console.log(this.credits.split(/\r?\n/).length);
        gameFont.drawText( this.credits, { x: 10, y: canvas.height - (ticker/2) % creditsLength }, 0, verticalSpacing);
        gameFont.drawText( this.credits, { x: 10, y: creditsLength + (ticker/2) % creditsLength }, 0, verticalSpacing);
        fillRect(0,165, canvas.width, 15, '#111');
        tinyFont.drawText( "Press Enter to return to Title", { x: 190, y: 170}, 0, 0);
    },

    update: function () {
       if(Key.justReleased(Key.ENTER)) { signal.dispatch('titleScreen'); }
       if(gamepad.start()) { signal.dispatch('titleScreen'); }
    }
}

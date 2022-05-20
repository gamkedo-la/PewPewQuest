// a simple slow motion effect
// distorts elapsed time in the main loop
var slowmoTimeScale = 1;

function startSlowMotion(timespanInMS=3000) {
    
    console.log("starting slow motion!");

    // go slow!
    // (see main.js near line 233)
    slowmoTimeScale = 0.25;
    
    // speed back up! (only if specified - otherwise do it manually)
    if (timespanInMS) setTimeout(endSlowMotion,timespanInMS);

    // TODO
    // alternately we could store a timestamp and
    // update() every frame so we could tween smoothly
}

function endSlowMotion() {
    //console.log("ending slow motion!");
    slowmoTimeScale = 1;
}
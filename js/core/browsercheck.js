
var browserNotSupported = false;
// safari test from https://stackoverflow.com/questions/7944460/detect-safari-browser
var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
// IE/edge test from https://stackoverflow.com/questions/31757852/how-can-i-detect-internet-explorer-ie-and-microsoft-edge-using-javascript
if(isSafari ||
    /MSIE 10/i.test(navigator.userAgent) || // This is internet explorer 10
    /MSIE 9/i.test(navigator.userAgent) || /rv:11.0/i.test(navigator.userAgent) || // This is internet explorer 9 or 11
    /Edge\/\d./i.test(navigator.userAgent) ) { // This is Microsoft Edge
    browserNotSupported = true;

    var local_c=document.getElementById("c");
    var local_ctx = local_c.getContext('2d');

    local_ctx.fillStyle = 'rgba(0,0,0, 1.0)';
    local_ctx.fillRect(0,0,local_c.width,local_c.height);
    local_ctx.fillStyle = 'rgba(255,255,255, 1.0)';
    local_ctx.font = "14px Arial";
    local_ctx.textAlign = "left";
    local_ctx.fillText("Sorry, this browser is not supported.",35,55);
    local_ctx.fillText("Please revisit with Chrome or Firefox.",35,75);

    throw Error("browser not supported"); // intentional error to derail code
}
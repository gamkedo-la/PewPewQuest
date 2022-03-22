var inventory = {
    items: {
        keys: 0,
        bridge: 0,
        torch: 0,
    },
    
    rect: {
        x: 0,
        y: 160,
        width: 320,
        height: 20
    },

    draw: function () {
        let drawPosition = 10;
        fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height, COLORS.dirtyRed);
        for (var i = 0; i < this.items.keys; i++) {
            canvasContext.drawImage(img['key'], drawPosition, this.rect.y+2);
            drawPosition += 14;
        }
    },
    update: function () {

    }
}
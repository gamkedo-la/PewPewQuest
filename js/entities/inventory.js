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
            strokePolygon(drawPosition + i*10, this.rect.y + this.rect.height / 2, 7, 3, 0, COLORS.white);
            drawPosition += 10;
        }
    },
    update: function () {

    }
}
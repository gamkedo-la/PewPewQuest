var inventory = {
    switchCooldown: 0,
    switchCooldownMax: 10,
    healthBarColor: 0,
    items: {
        keys: 0,
        bridge: 0,
        torch: 0,
        gun: 0,
        sabre: 0,
        chalice: 0
    },

    itemList: ["torch", "sabre", "gun", "chalice"],
    
    selection: 0,

    score: 10,

    selectedItem: "none",
    
    rect: {
        x: 0,
        y: 160,
        width: 320,
        height: 20
    },

    reset: function(){
        this.items = {
            keys: 0,
            bridge: 0,
            torch: 0,
            gun: 0,
            sabre: 0,
            chalice: 0
        };
        this.selection = 0;
        this.selectedItem = "none";
    },

    draw: function () {
        let drawPosition = 10;
        fillRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height, COLORS.veniceBlue);


        //player health rectangle
        let playerHealthBarWidthMax = 320-230;
        let playerHealthBarWidth = playerHealthBarWidthMax * player.health / player.maxHealth;
        fillRect(230, this.rect.y, playerHealthBarWidth, this.rect.height, this.healthBarColor);
        //textString, pos={x: 0, y: 0}, hspacing=0, vspacing = 2, scale=1
        gameFont.drawText(this.score.toString().padStart(12, '0'), {x: 240, y: this.rect.y + 6}, 0, 0, 1);

//debug text------------------------------------------------------------------------------
// tinyFont.drawText(
//     `E: ${world.entities.length} WE: ${world.worldEntities.length} B: ${world.bullets.length}`,
//     {x: 200, y: 4}, 0, 0, 1
// );
// tinyFont.drawText(
// `A: ${gamepad.buttonA()} B: ${gamepad.buttonB()} X: ${gamepad.buttonX()} Y: ${gamepad.buttonY()}LT: ${gamepad.leftTrigger()} RT: ${gamepad.rightTrigger()}
// LX: ${gamepad.leftStick_xAxis()} LY: ${gamepad.leftStick_yAxis()} RX: ${gamepad.rightStick_xAxis()} RY: ${gamepad.rightStick_yAxis()}`,
// {x: 4, y: 12}, 0, 0, 1
//         );
//----------------------------------------------------------------------------------------

        //draw items
        let start = drawPosition;
        for (var i = 0; i < this.items.keys; i++) {
            canvasContext.drawImage(img['key'], drawPosition, this.rect.y+2);
            drawPosition += 18;
        }
        // if(this.selectedItem == "keys"){
        //     pixelLine(start, this.rect.y+18, drawPosition-4, this.rect.y+18, COLORS.white);
        // }

        if(inventory.items.torch) {
            let start = drawPosition;
            canvasContext.drawImage(img['flashlight-inventory'], drawPosition, this.rect.y+2);
            drawPosition += 18;
            if(this.selectedItem == "torch"){
                pixelLine(start, this.rect.y+18, drawPosition-4, this.rect.y+18, COLORS.white);
            }
        }
        if(inventory.items.sabre) {
            let start = drawPosition;
            canvasContext.drawImage(img['sabre-inventory'], drawPosition, this.rect.y+2);
            drawPosition += 18;
            if(this.selectedItem == "sabre"){
                pixelLine(start, this.rect.y+18, drawPosition-4, this.rect.y+18, COLORS.white);
            }
        }
        if(inventory.items.gun) {
            let start = drawPosition;
            canvasContext.drawImage(img['gun-inventory'], drawPosition, this.rect.y+6);
            drawPosition += 20;
            if(this.selectedItem == "gun"){
                pixelLine(start, this.rect.y+18, drawPosition-4, this.rect.y+18, COLORS.white);
            }
        }
        if(inventory.items.chalice) {
            let start = drawPosition;
            canvasContext.drawImage(img['chalice-inventory'], drawPosition, this.rect.y+2);
            drawPosition += 20;
            if(this.selectedItem == "chalice"){
                pixelLine(start, this.rect.y+18, drawPosition-4, this.rect.y+18, COLORS.white);
            }
        }
        
        
    },
    update: function () {
        this.healthBarColor = player.hurtCooldown > 0 ? COLORS.dirtyRed : COLORS.elfGreen;
        inventory.switchCooldown--;
        
        if (gamepad.rightShoulder() && inventory.switchCooldown <= 0) {
            inventory.switchCooldown = inventory.switchCooldownMax;
            this.inventoryForward();
        }else if (gamepad.leftShoulder() && inventory.switchCooldown <= 0) {
            inventory.switchCooldown = inventory.switchCooldownMax;
            this.inventoryReverse();
        }

        if (Key.justReleased(Key.c)) {
            this.inventoryForward();
        }else if (Key.justReleased(Key.x)) {
            this.inventoryReverse();
        }
    },

    inventoryForward: function () {
        let count = 0;

        do {
            this.selection++;
            this.selection = this.selection % this.itemList.length;
            this.selectedItem = this.itemList[this.selection];
            count++;
        }
        while (this.items[this.selectedItem] != 1 && count < this.itemList.length);
    },

    inventoryReverse: function () {
        let count = 0;

        do {
            this.selection--;
            if(this.selection < 0){
                this.selection = this.itemList.length-1;
            }
            this.selectedItem = this.itemList[this.selection];
            count++;
        }
        while (this.items[this.selectedItem] != 1 && count < this.itemList.length);
    }
}
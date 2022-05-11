

// example
// if (gamepad.xAxis()>0.1) move_north();
// if (gamepad.buttonA()) pew();

var gamepad = {
    axis:function(num) {
        if (!navigator.getGamepads) return 0;
        let joy = navigator.getGamepads()[0];
        if (joy) return joy.axes[num]; else return 0;
    },
    butt:function(num) {
        if (!navigator.getGamepads) return false;
        let joy = navigator.getGamepads()[0];
        if (joy){
            return joy.buttons[num].value;
        }else{ return false }
    },
    released: [],
    
    leftStick_xAxis:function() { return this.axis(0); },
    leftStick_yAxis:function() { return this.axis(1); },
    rightStick_xAxis:function() { return this.axis(2); },
    rightStick_yAxis:function() { return this.axis(3); },
    buttonA:function() { return this.butt(0); },
    buttonB:function() { return this.butt(1); },
    buttonX:function() { return this.butt(2); },
    buttonY:function() { return this.butt(3); },
    leftShoulder:function() { return this.butt(4); },
    rightShoulder:function() { return this.butt(5); },
    leftTrigger:function() { return this.butt(6); },
    rightTrigger:function() { return this.butt(7); },
    select:function() { return this.butt(8); },
    start:function() { return this.butt(9); },
    dpadUp:function() { return this.butt(12); },
    dpadDown:function() { return this.butt(13); },
    dpadLeft:function() { return this.butt(14); },
    dpadRight:function() { return this.butt(15); },
};
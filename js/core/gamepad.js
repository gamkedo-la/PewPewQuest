

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
        if (joy) return joy.buttons[num].value; else return false;
    },
    xAxis:function() { return this.axis(0); },
    yAxis:function() { return this.axis(1); },
    buttonA:function() { return this.butt(0); },
    buttonB:function() { return this.butt(1); },
    buttonX:function() { return this.butt(2); },
    buttonY:function() { return this.butt(3); },
};
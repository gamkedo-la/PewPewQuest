function PRNG(seed = Date.now(), a = 1664525, c = 1013904223, m = Math.pow(2,32) ){
    this.seed = seed;
    this.a= a;
    this.c = c;
    this.m = m;
  }
  
  
    PRNG.prototype.setSeed =  function(seed) {
      this.seed = seed;
    },
  
    PRNG.prototype.nextInt = function() {
      // range [0, 2^32)
      this.seed = (this.seed * this.a + this.c) % this.m;
      return this.seed;
    },
  
    PRNG.prototype.nextFloat = function() {
      // range [0, 1)
      return this.nextInt() / this.m;
    },
  
    PRNG.prototype.nextBool = function(percent) {
      // percent is chance of getting true
      if(percent == null) {
        percent = 0.5;
      }
      return this.nextFloat() < percent;
    },
  
    PRNG.prototype.nextFloatRange = function(min, max) {
      // range [min, max)
      return min + this.nextFloat() * (max - min);
    },
  
    PRNG.prototype.nextIntRange = function(min, max) {
      // range [min, max)
      return Math.floor(this.nextFloatRange(min, max));
    },
  
    PRNG.prototype.nextColor = function() {
      // range [#000000, #ffffff]
      var c = this.nextIntRange(0, Math.pow(2, 24)).toString(16).toUpperCase();
      while(c.length < 6) {
        c = "0" + c;
      }
      return "#" + c;
    }
  
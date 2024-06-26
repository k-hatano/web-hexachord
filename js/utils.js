// ============================================================================
// Misc utility functions

//Clips a value to remain between the bounds fixed by mini and maxi
function bound(value,mini,maxi){
    return Math.min(maxi,Math.max(mini,value));
}

//True modulo function (always positive for positive period)
function mod(value,period){
    return ((value%period)+period)%period
}

// create a generator function returning an
// iterator to a specified range of numbers
function* range (begin, end, interval = 1) {
    for (let i = begin; i < end; i += interval) {
        yield i;
    }
}

//Greatest common divisor
function gcd(a, b) {
    if ( ! b) {
        return a;
    }
    return gcd(b, a % b);
};

// Basic memoizer
// Warning: do not mutate returned objects as it will mutate the cache
function memo(func){
    var cache = {};
      return function(){
        var key = JSON.stringify(arguments);
        if (cache[key]){
          //console.log(cache)
          return cache[key];
        }
        else{
          val = func.apply(null, arguments);
          cache[key] = val;
          return val; 
        }
    }
  }

//Used for validation
function isSubset(a, b){
    return a.every(val => b.includes(val));
}

//Is pitch a valid Midi pitch ?
function isMidiPitch(pitch){
    return (pitch >= 0 && pitch < 128) || (JZZ.MIDI.noteValue(pitch) !== undefined);
}

const noop = function(){};

const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;

function arrayEquals(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length != b.length) return false;

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
}

// Turns a unary function into an array compatible version
function mapOrApply(f){
  return (args) => {
      if (Array.isArray(args)){
          return args.map(f);
      }else{
          return f(args);
      }
  }
}

const colorMap = {
    0: "#ff941f",
    1: "#e66438",
    2: "#cc3450",
    3: "#b30469",
    4: "#822b9b",
    5: "#5053cd",
    6: "#1f7aff",
    7: "#258dab",
    8: "#2ba058",
    9: "#31b304",
    10: "#76a900",
    11: "#e6bd00",
}

var Tonnetz_utils = true

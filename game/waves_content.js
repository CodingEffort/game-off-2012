var GRUNT_PATHS = ["LeftRight", "RightLeft", "TopBottom", "BottomTop"];
var PATROL_PATHS = ["PatrolHorizontalStartLeft", "PatrolHorizontalStartRight"];

var GRUNT = { type: 'Grunt', path: GRUNT_PATHS };
var PATROL = { type: 'Patrol', path: PATROL_PATHS };

function rand(min, max) {
  return (Math.random()*(max-min)) + min;
}

// Temporary file to represent the waves. Could be a lot cleaner than that.
// REFUCKTOR ME PLZ, GOOBY PLZ.
module.exports = {
  self: this,
    // The list of all the possible waves, ordered by their difficulty
    waves: [
        {
            enemies: [GRUNT,GRUNT],
            pause: 4000
        },

        {
            enemies: [GRUNT,GRUNT,GRUNT],
            pause: 4000
        },

        {
            enemies: [GRUNT,GRUNT,PATROL],
            pause: 8000
        },

        {
            enemies: [GRUNT,GRUNT,PATROL,PATROL],
            pause: 10000
        },

        {
            enemies: [GRUNT,GRUNT,GRUNT,PATROL,PATROL],
            pause: 10000
        }
    ],

    rand: rand,

    posForPath:
    {
        "TopLeftBottomRight": function() {return { x: rand(50, 300), y: -50 };},
        "TopRightBottomLeft": function() {return { x: rand(300, 650), y: -50 };},
        "LeftRight": function() {return { x: -50, y: rand(50, 550) };},
        "RightLeft": function() {return { x: 650, y: rand(50, 550) };},
        "TopBottom": function() {return { x: rand(50, 650), y: -50 };},
        "BottomTop": function() {return { x: rand(50, 650), y: 600 };},
        "PatrolHorizontalStartLeft": function() {return { x: rand(50, 650), y: -50 };},
        "PatrolHorizontalStartRight": function() {return { x: rand(50, 650), y: -50 };},
        "ZigZagStartLeft": function() {return { x: rand(50, 650), y: -50 };},
        "ZigZagStartRight": function() {return { x: rand(50, 650), y: -50 };},
        "CircleStartLeft": function() {return { x: rand(50, 650), y: -50 };},
        "CircleStartRight": function() {return { x: rand(50, 650), y: -50 };}
    },

    // Returns a random item from a list of possible values of a proprety of an enemy. If the path is not an array, it returns
    // the path directly.
    // e.g. you can pass ["LeftRight", "RightLeft"] to get a random path from these
    // or you could pass "LeftRight" and get back "LeftRight".
    // This is used to simplify the creation of waves.
    getWaveParamValue: function(obj) {
        // Check if it is an array, return a random element if it is
        if (Object.prototype.toString.call(obj) === '[object Array]')
            return obj[Math.floor(Math.random() * obj.length)];
        else
            return obj;
    },

    getStartPosForPath: function(path) {
        if (this.posForPath[path]) return this.posForPath[path];
        else throw "Path's starting position not defined.";
    }
};

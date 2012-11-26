// Temporary file to represent the waves. Could be a lot cleaner than that.
// REFUCKTOR ME PLZ, GOOBY PLZ.
module.exports = function() {
    var GRUNT_PATHS = ["LeftRight", "RightLeft", "TopBottom", "BottomTop"];
    var PATROL_PATHS = ["PatrolHorizontalStartLeft", "PatrolHorizontalStartRight"];

    var GRUNT = { type: 'Grunt', path: GRUNT_PATHS };
    var PATROL = { type: 'Patrol', path: PATROL_PATHS };

    // The list of all the possible waves, ordered by their difficulty
    this.waves = [
         [
            GRUNT, GRUNT
         ],

         [
            GRUNT, GRUNT,
            PATROL
         ],

         [
            GRUNT, GRUNT, GRUNT,
            PATROL, PATROL
         ],

         [
            PATROL, PATROL, PATROL, PATROL
         ],

         [
            GRUNT, GRUNT, GRUNT,
            PATROL, PATROL, PATROL, PATROL
         ]
    ];

    this.rand = function(min, max) {
        return (Math.random()*(max-min)) + min;
    };

    this.posForPath =
    {
        "TopLeftBottomRight": { x: this.rand(50, 300), y: -50 },
        "TopRightBottomLeft": { x: this.rand(300, 650), y: -50 },
        "LeftRight": { x: -50, y: this.rand(50, 550) },
        "RightLeft": { x: 650, y: this.rand(50, 550) },
        "TopBottom": { x: this.rand(50, 650), y: -50 },
        "BottomTop": { x: this.rand(50, 650), y: 850 },
        "PatrolHorizontalStartLeft": { x: this.rand(50, 650), y: -50 },
        "PatrolHorizontalStartRight": { x: this.rand(50, 650), y: -50 },
        "ZigZagStartLeft": { x: this.rand(50, 650), y: -50 },
        "ZigZagStartRight": { x: this.rand(50, 650), y: -50 },
        "CircleStartLeft": { x: this.rand(50, 650), y: -50 },
        "CircleStartRight": { x: this.rand(50, 650), y: -50 }
    };

    // Returns a random item from a list of possible values of a proprety of an enemy. If the path is not an array, it returns
    // the path directly.
    // e.g. you can pass ["LeftRight", "RightLeft"] to get a random path from these
    // or you could pass "LeftRight" and get back "LeftRight".
    // This is used to simplify the creation of waves.
    this.getWaveParamValue = function(obj) {
        // Check if it is an array, return a random element if it is
        if (Object.prototype.toString.call(obj) === '[object Array]')
            return obj[Math.floor(Math.random() * obj.length)];
        else
            return obj;
    };

    this.getStartPosForPath = function(path) {
        if (this.posForPath[path]) return this.posForPath[path];
        else throw "Path's starting position not defined.";
    };
};
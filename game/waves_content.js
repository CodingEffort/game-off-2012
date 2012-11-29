var GRUNT_PATHS = ["LeftRight", "RightLeft", "TopBottom", "BottomTop"];
var PATROL_PATHS = ["PatrolHorizontalStartLeft", "PatrolHorizontalStartRight"];
var TRAPEZE_PATHS = ["PatrolHorizontalStartLeft", "PatrolHorizontalStartRight"];
var DELTOID_PATHS = ["LeftRight", "RightLeft", "TopBottom", "BottomTop", "PatrolHorizontalStartLeft", "PatrolHorizontalStartRight"];
var RECTBOX_PATHS = ["PatrolHorizontalStartLeft", "PatrolHorizontalStartRight"];
var HALFCIRCLE_PATHS = ["CircleStartLeft", "CircleStartRight"];
var BOSS1_A_PATHS = ["ZigZagStartLeft", "ZigZagStartRight"];
var BOSS1_B_PATHS = ["CircleStartLeft", "CircleStartRight"];
var BOSS2_PATHS = ["CircleStartLeft", "CircleStartRight"];
var BOSS3_PATHS = ["CircleStartLeft", "CircleStartRight"];
var LAST_BOSS_PATHS = ["CircleStartLeft", "CircleStartRight"];

var GRUNT_GUNS = ["NoPewPew", "LameEnemyPewPew", "LameShotgunEnemyPewPew"];
var PATROL_GUNS = ["LameEnemyPewPew", "LameConeEnemyPewPew", "LameShotgunEnemyPewPew"];
var TRAPEZE_GUNS = ["LameEnemyPewPew", "LameConeEnemyPewPew", "LameShotgunEnemyPewPew"];
var DELTOID_GUNS = ["LameEnemyPewPew", "LameConeEnemyPewPew", "LameShotgunEnemyPewPew"];
var RECTBOX_GUNS = "DiagonalEnemyPewPew";
var HALFCIRCLE_GUNS = ["LameConeEnemyPewPew", "LameShotgunEnemyPewPew"];
var BOSS1_GUNS = "LameLargeShotgunEnemyPewPew";
var BOSS2_GUNS = "CircularEnemyPewPew";
var BOSS3_GUNS = "PulseEnemyPewPew";
var LAST_BOSS_GUNS = "HighPulseEnemyPewPew";

var GRUNT = { type: 'Grunt', gun: GRUNT_GUNS, path: GRUNT_PATHS, cash: 5 };
var PATROL = { type: 'Patrol', gun: PATROL_GUNS, path: PATROL_PATHS, cash: 10 };
var TRAPEZE = { type: 'Trapeze', gun: TRAPEZE_GUNS, path: TRAPEZE_PATHS, cash: 15 };
var DELTOID = { type: 'Trapeze', gun: DELTOID_GUNS, path: DELTOID_PATHS, cash: 25 };
var RECTBOX = { type: 'RectBox', gun: RECTBOX_GUNS, path: RECTBOX_PATHS, cash: 50 };
var HALFCIRCLE = { type: 'HalfCircle', gun: HALFCIRCLE_GUNS, path: HALFCIRCLE_PATHS, cash: 65 };
var BOSS1_A = { type: 'EasiestBoss', gun: BOSS1_GUNS, path: BOSS1_A_PATHS, cash: 100 };
var BOSS1_B = { type: 'EasiestBossAiming', gun: BOSS1_GUNS, path: BOSS1_B_PATHS, cash: 150 };
var BOSS2 = { type: 'EasyBoss', gun: BOSS2_GUNS, path: BOSS2_PATHS, cash: 200 };
var BOSS3 = { type: 'NormalBoss', gun: BOSS3_GUNS, path: BOSS3_PATHS, cash: 300 };
var LAST_BOSS = { type: 'BigBoss', gun:LAST_BOSS_GUNS, path: LAST_BOSS_PATHS, cash: 500 };

var SMALL_PAUSE = 1000;
var NORMAL_PAUSE = 2000;

function rand(min, max) {
  return (Math.random()*(max-min)) + min;
}

module.exports = {
  self: this,
    // The list of all the possible waves, ordered by their difficulty
    waves: [
        {
            enemies: [GRUNT,GRUNT],
            pause: SMALL_PAUSE
        },

        {
            enemies: [GRUNT,GRUNT,GRUNT],
            pause: SMALL_PAUSE
        },

        {
            enemies: [GRUNT,GRUNT,PATROL],
            pause: SMALL_PAUSE
        },

        {
            enemies: [GRUNT,GRUNT,PATROL,PATROL],
            pause: SMALL_PAUSE
        },

        {
            enemies: [GRUNT,GRUNT,GRUNT,PATROL,PATROL],
            pause: SMALL_PAUSE
        },

        {
            enemies: [PATROL, PATROL, PATROL],
            pause: SMALL_PAUSE
        },

        {
            enemies: [GRUNT,GRUNT,TRAPEZE],
            pause: SMALL_PAUSE
        },

        {
            enemies: [GRUNT,GRUNT,PATROL,TRAPEZE],
            pause: SMALL_PAUSE
        },

        {
            enemies: [PATROL,PATROL,TRAPEZE,TRAPEZE,TRAPEZE],
            pause: SMALL_PAUSE
        },

        {
            enemies: [PATROL,PATROL,DELTOID,DELTOID],
            pause: SMALL_PAUSE
        },

        {
            enemies: [DELTOID,DELTOID,TRAPEZE],
            pause: SMALL_PAUSE
        },

        {
            enemies: [RECTBOX, GRUNT, GRUNT],
            pause: SMALL_PAUSE
        },

        {
            enemies: [RECTBOX, RECTBOX],
            pause:SMALL_PAUSE
        },

        {
            enemies: [BOSS1_A, GRUNT, GRUNT],
            pause:NORMAL_PAUSE,
            boss: true
        },

        {
            enemies: [BOSS1_B, PATROL, PATROL],
            pause:NORMAL_PAUSE,
            boss: true
        },

        {
            enemies: [RECTBOX, RECTBOX, PATROL],
            pause:SMALL_PAUSE
        },

        {
            enemies: [RECTBOX, RECTBOX, PATROL, PATROL,GRUNT],
            pause:SMALL_PAUSE
        },

        {
            enemies: [RECTBOX, RECTBOX, PATROL,GRUNT,GRUNT,GRUNT],
            pause:SMALL_PAUSE
        },

        {
            enemies: [BOSS2],
            pause:NORMAL_PAUSE,
            boss: true
        },

        {
            enemies: [GRUNT,GRUNT,GRUNT,GRUNT,GRUNT,GRUNT,GRUNT,GRUNT],
            pause:SMALL_PAUSE
        },

        {
            enemies: [HALFCIRCLE,HALFCIRCLE],
            pause:SMALL_PAUSE
        },

        {
            enemies: [PATROL,RECTBOX,TRAPEZE,HALFCIRCLE,HALFCIRCLE],
            pause:SMALL_PAUSE
        },

        {
            enemies: [RECTBOX,RECTBOX,HALFCIRCLE,HALFCIRCLE],
            pause:SMALL_PAUSE
        },

        {
            enemies: [BOSS3],
            pause:NORMAL_PAUSE,
            boss: true
        },

        {
            enemies: [LAST_BOSS],
            pause: 0,
            boss: true
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

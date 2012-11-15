/** enemy_paths.js
 * Jesse Emond
 * 12/11/2012

 Contains the path's mathematical definitions that the enemies can follow.

 For a list of the different paths and their definitions, see:

                        *****************
                        * EnemyPaths.md *
                        *****************

 */

function getPath(pathType, startX, startY) {
    var DIAGONAL_FRAMES = 120; // frames required for the whole diagonal path
    var DIAGONAL_TARGETY = SCREEN_H+50;

    var HORIZONTAL_FRAMES = 90; // frames required for the whole horizontal path
    var VERTICAL_FRAMES = HORIZONTAL_FRAMES; // frames required for the whole horizontal path

    if (pathType == "TopLeftBottomRight")
    {
        var LEFT_DIAGONAL_TARGETX = SCREEN_W+50; // target coords
        // function parameters calculated with the specified start&target parameters
        // at+b for the x coord, where b is the starting x pos
        var LEFT_DIAGONAL_X_B = startX;
        var LEFT_DIAGONAL_X_A = (LEFT_DIAGONAL_TARGETX - LEFT_DIAGONAL_X_B) / DIAGONAL_FRAMES;
        // a t^2 + k for the y coord, where k is the starting y pos
        var LEFT_DIAGONAL_Y_K = startY;
        var LEFT_DIAGONAL_Y_A = (DIAGONAL_TARGETY - LEFT_DIAGONAL_Y_K) / (DIAGONAL_FRAMES * DIAGONAL_FRAMES);
        // final result
        return function(t) {
            return {
                x: LEFT_DIAGONAL_X_A * t + LEFT_DIAGONAL_X_B,
                y: LEFT_DIAGONAL_Y_A * t * t + LEFT_DIAGONAL_Y_K
            };
        };
    }

    else if (pathType == "TopRightBottomLeft")
    {
        var RIGHT_DIAGONAL_TARGETX = -50; // target coords
        // function parameters calculated with the specified start&target parameters
        // at+b for the x coord, where b is the starting x pos
        var RIGHT_DIAGONAL_X_B = startX;
        var RIGHT_DIAGONAL_X_A = (RIGHT_DIAGONAL_TARGETX - RIGHT_DIAGONAL_X_B) / DIAGONAL_FRAMES;
        // a t^2 + k for the y coord, where k is the starting y pos
        var RIGHT_DIAGONAL_Y_K = startY;
        var RIGHT_DIAGONAL_Y_A = (DIAGONAL_TARGETY - RIGHT_DIAGONAL_Y_K) / (DIAGONAL_FRAMES * DIAGONAL_FRAMES);
        // final result
        return function(t) {
            return {
                x: RIGHT_DIAGONAL_X_A * t + RIGHT_DIAGONAL_X_B,
                y: RIGHT_DIAGONAL_Y_A * t * t + RIGHT_DIAGONAL_Y_K
            };
        };
    }

    else if (pathType == "LeftRight")
    {
        var LEFT_HORIZONTAL_TARGETX = SCREEN_W+50;
        var LEFT_HORIZONTAL_X_A = (LEFT_HORIZONTAL_TARGETX - startX) / HORIZONTAL_FRAMES;

        return function(t) {
            return {
                x: LEFT_HORIZONTAL_X_A * t + startX,
                y: startY
            };
        };
    }

    else if (pathType == "RightLeft")
    {
        var RIGHT_HORIZONTAL_TARGETX = -50;
        var RIGHT_HORIZONTAL_X_A = (RIGHT_HORIZONTAL_TARGETX - startX) / HORIZONTAL_FRAMES;

        return function(t) {
            return {
                x: RIGHT_HORIZONTAL_X_A * t + startX,
                y: startY
            };
        };
    }

    else if (pathType == "TopBottom")
    {
        var TOP_VERTICAL_TARGETY = SCREEN_W+50;
        var TOP_VERTICAL_Y_A = (TOP_VERTICAL_TARGETY - startY) / VERTICAL_FRAMES;

        return function(t) {
            return {
                x: startX,
                y: TOP_VERTICAL_Y_A * t + startY
            };
        };
    }

    else if (pathType == "BottomTop")
    {
        var BOTTOM_VERTICAL_TARGETY = -50;
        var BOTTOM_VERTICAL_Y_A = (BOTTOM_VERTICAL_TARGETY - startY) / VERTICAL_FRAMES;

        return function(t) {
            return {
                x: startX,
                y: BOTTOM_VERTICAL_Y_A * t + startY
            };
        };
    }

    else if (pathType == "PatrolHorizontal")
    {
        var PATROL_REACH_UPPER_FRAMES = 40;
        var PATROL_UPPER_Y = 100;

        var PATROL_TOTAL_FRAMES = 400;
        var PATROL_MIN_X = 50;
        var PATROL_MAX_X = SCREEN_W-50;

        var PATROL_X_K = (PATROL_MAX_X + PATROL_MIN_X) / 2;
        var PATROL_X_A = (Crafty.math.randomInt(0, 1) === 0 ? 1 : -1) * //COOLEST FEATURE EVER DO NOT REMOVEEEEE
            (PATROL_MAX_X - PATROL_MIN_X) / 2;
        var PATROL_X_B = 2 * Math.PI / PATROL_TOTAL_FRAMES;
        return function(t) {
            
            if (t <= PATROL_REACH_UPPER_FRAMES) // frames to reach the upper screen
            {
                var patrolHorizA = (PATROL_UPPER_Y - startY) / PATROL_REACH_UPPER_FRAMES;
                return {
                    x: startX,
                    y: patrolHorizA * t + startY
                };
            }
            else // we should patrol instead
            {
                // Update to take into account our startX
                PATROL_X_H = -(Math.asin( (startX - PATROL_X_K) / PATROL_X_A ) / PATROL_X_B);
                return {
                    x: PATROL_X_A * Math.sin(PATROL_X_B * (t - PATROL_REACH_UPPER_FRAMES - PATROL_X_H)) + PATROL_X_K,
                    y: PATROL_UPPER_Y
                };
            }
        };
    }

    else
        throw("Path '" + pathType + "' is not implemented.");
}
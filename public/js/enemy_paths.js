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
        var PATROL_UPPER_Y = Crafty.math.randomInt(100, 200);

        var PATROL_TOTAL_FRAMES = 400;
        var PATROL_MIN_X = 50;
        var PATROL_MAX_X = SCREEN_W-50;

        var PATROL_X_K = (PATROL_MAX_X + PATROL_MIN_X) / 2;
        var PATROL_X_A = (Crafty.math.randomInt(0, 1) === 0 ? 1 : -1) * //Put IN function for ghost patrol
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

    else if (pathType === "ZigZag")
    {
        var ZIGZAG_REACH_UPPER_FRAMES = 40;
        var ZIGZAG_UPPER_Y = 100;
        var ZIGZAG_DOWN_Y = SCREEN_H-100;

        var ZIGZAG_TOTAL_FRAMES = 400;
        var ZIGZAG_MIN_X = 50;
        var ZIGZAG_MAX_X = SCREEN_W-50;

        var ZIGZAG_X_K = (ZIGZAG_MAX_X + ZIGZAG_MIN_X) / 2;
        var ZIGZAG_X_A = (Crafty.math.randomInt(0, 1) === 0 ? 1 : -1) * //Put IN function for ghost patrol
            (ZIGZAG_MAX_X - ZIGZAG_MIN_X) / 2;
        var ZIGZAG_X_B = 2 * Math.PI / ZIGZAG_TOTAL_FRAMES;

        var ZIGZAG_Y_K = (ZIGZAG_DOWN_Y + ZIGZAG_UPPER_Y) / 2;
        var ZIGZAG_Y_A = (ZIGZAG_DOWN_Y - ZIGZAG_UPPER_Y) / 2;
        var ZIGZAG_Y_B = 2 * Math.PI / (ZIGZAG_TOTAL_FRAMES * 3);


        return function(t) {
            
            if (t <= ZIGZAG_REACH_UPPER_FRAMES) // frames to reach the upper screen
            {
                var patrolHorizA = (ZIGZAG_UPPER_Y - startY) / ZIGZAG_REACH_UPPER_FRAMES;
                return {
                    x: startX,
                    y: patrolHorizA * t + startY
                };
            }
            else // we should patrol instead
            {
                // Update to take into account our startX
                ZIGZAG_X_H = -(Math.asin( (startX - ZIGZAG_X_K) / ZIGZAG_X_A ) / ZIGZAG_X_B);
                ZIGZAG_Y_H = -(Math.asin( (ZIGZAG_UPPER_Y - ZIGZAG_Y_K) / ZIGZAG_Y_A ) / ZIGZAG_Y_B);
                return {
                    x: ZIGZAG_X_A * Math.sin(ZIGZAG_X_B * (t - ZIGZAG_REACH_UPPER_FRAMES - ZIGZAG_X_H)) + ZIGZAG_X_K,
                    y: ZIGZAG_Y_A * Math.sin(ZIGZAG_Y_B * (t - ZIGZAG_REACH_UPPER_FRAMES - ZIGZAG_Y_H)) + ZIGZAG_Y_K
                };
            }
        };
    }

    else if (pathType === "Circle")
    {
        var CIRCLE_REACH_UPPER_FRAMES = 40;
        var CIRCLE_UPPER_Y = 100;
        var CIRCLE_DOWN_Y = SCREEN_H-100;

        var CIRCLE_TOTAL_FRAMES = 400;
        var CIRCLE_MIN_X = 50;
        var CIRCLE_MAX_X = SCREEN_W-50;

        var CIRCLE_X_K = (CIRCLE_MAX_X + CIRCLE_MIN_X) / 2;
        var CIRCLE_X_A = (Crafty.math.randomInt(0, 1) === 0 ? 1 : -1) * //Put IN function for ghost patrol
            (CIRCLE_MAX_X - CIRCLE_MIN_X) / 2;
        var CIRCLE_X_B = 2 * Math.PI / CIRCLE_TOTAL_FRAMES;

        var CIRCLE_Y_K = (CIRCLE_DOWN_Y + CIRCLE_UPPER_Y) / 2;
        var CIRCLE_Y_A = (CIRCLE_DOWN_Y - CIRCLE_UPPER_Y) / 2;
        var CIRCLE_Y_B = 2 * Math.PI / CIRCLE_TOTAL_FRAMES;


        return function(t) {
            
            if (t <= CIRCLE_REACH_UPPER_FRAMES) // frames to reach the upper screen
            {
                var patrolHorizA = (CIRCLE_UPPER_Y - startY) / CIRCLE_REACH_UPPER_FRAMES;
                return {
                    x: startX,
                    y: patrolHorizA * t + startY
                };
            }
            else // we should patrol instead
            {
                // Update to take into account our startX
                CIRCLE_X_H = -(Math.asin( (startX - CIRCLE_X_K) / CIRCLE_X_A ) / CIRCLE_X_B);
                CIRCLE_Y_H = -(Math.asin( (CIRCLE_UPPER_Y - CIRCLE_Y_K) / CIRCLE_Y_A ) / CIRCLE_Y_B);
                return {
                    x: CIRCLE_X_A * Math.sin(CIRCLE_X_B * (t - CIRCLE_REACH_UPPER_FRAMES - CIRCLE_X_H)) + CIRCLE_X_K,
                    y: CIRCLE_Y_A * Math.sin(CIRCLE_Y_B * (t - CIRCLE_REACH_UPPER_FRAMES - CIRCLE_Y_H)) + CIRCLE_Y_K
                };
            }
        };
    }

    else
        throw("Path '" + pathType + "' is not implemented.");
}
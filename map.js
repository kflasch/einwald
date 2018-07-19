// various map drawing utilties

Game.Map = function(width, height) {
    this._width =  width || Game.mapWidth;
    this._height = height || Game.mapHeight;
};

Game.Map.fillMap = function(width, height, value) {
    var map = [];
    for (var x=0; x < width; x++) {
        map[x] = [];
        for (var y=0; y < height; y++) {
            map[x][y] = value;
        }
    }
    return map;
};

Game.Map.filledSquare = function(x, y, size, value, map) {
    for (var i=0; i < size; i++) {
        for (var j=0; j < size; j++) {
            map[x+i][y+j] = value;
        }
    }
    return map;
};

Game.Map.voronoiRelaxation = function(width, height, points) {

    var regions = [];
    for (var p=0; p<points.length; p++)
        regions.push([points[p],1]);

    for (var y=0; y<height; y++) {
        for (var x=0; x<width; x++) {
            var pos = [x,y];
            var nearest = -1;
            var nearestDist = 99999999;

            for (var i=0; i<points.length; i++) {
                // vector subtraction
                var subX = points[i][0] - pos[0];
                var subY = points[i][1] - pos[1];
                // square length
                var distance = subX * subX + subY * subY;
                if (distance < nearestDist) {
                    nearest = i;
                    nearestDist = distance;
                }
            }

            var regionPoint = regions[nearest][0];
            var newPoint = [regionPoint[0] + pos[0], regionPoint[1] + pos[1]];
            regions[nearest][0] = newPoint;
            regions[nearest][1] += 1;
        }
    }

    for (var j=0; j<points.length; j++) {
        regionPoint = regions[j][0];
        points[j] = [Math.round(regionPoint[0]/regions[j][1]),
                     Math.round(regionPoint[1]/regions[j][1])];
    }

    return points;
};

// creates paths between all points in map
Game.Map.connectPoints = function(map, pointsToConnect) {
    var connected = [];
    var points = pointsToConnect.slice();

    connected.push(points.pop());

    while (points.length) {

        var bestFromPoint;
        var bestToIndex = -1;
        var bestDistance = 9999999;
        
        for (var i=0; i<connected.length; i++) {
            for (var j=0; j<points.length; j++) {
                // vector subtraction
                var subX = points[j][0] - connected[i][0];
                var subY = points[j][1] - connected[i][1];
                // square length
                var distance = subX * subX + subY * subY;

                if (distance < bestDistance) {
                    bestFromPoint = connected[i].slice();
                    bestToIndex = j;
                    bestDistance = distance;
                }
            }
        }

        var toPoint = points[bestToIndex].slice();

        Game.Map.carvePath(map, bestFromPoint, toPoint);

        connected.push(toPoint.slice());
        points.splice(bestToIndex, 1);
    }

};

Game.Map.carvePath = function(map, from, to) {

    var line = Game.Map.getLine(from, to);
    var mapWidth = map.length;
    var mapHeight = map[0].length;

    for (var i=0; i<line.length; i++) {
        var point = line[i];
        map[point[0]][point[1]] = 0;

        // make the path a bit wider
        if (point[0] + 1 < mapWidth - 1)
            map[point[0]+1][point[1]] = 0;
        if (point[1] + 1 < mapHeight - 1)
            map[point[0]][point[1]+1] = 0;
    }
};

Game.Map.carveCircle = function(map, center, radius) {

    var mapWidth = map.length;
    var mapHeight = map[0].length;

    var left = Math.max(1, center[0] - radius);
    var top = Math.max(1, center[1] - radius);
    var right = Math.min(center[0] + radius, mapWidth - 2);
    var bottom = Math.min(center[1] + radius, mapHeight - 2);

    for (var y=top; y<=bottom; y++) {
        for (var x=left; x<=right; x++) {
            var subX = x - center[0];
            var subY = y - center[1];
            var lenSquared = subX * subX + subY * subY;
            if (lenSquared < (radius * radius))
                map[x][y] = 0;
        }
    }
};

Game.Map.erode = function(map, iterations) {
    
    var mapWidth = map.length;
    var mapHeight = map[0].length;

    var dirs = ROT.DIRS[8];

    for (var i=0; i<iterations; i++) {
        var x = Math.ceil(ROT.RNG.getUniform() * (Game.mapWidth - 2));
        var y = Math.ceil(ROT.RNG.getUniform() * (Game.mapHeight - 2));

        if (map[x][y] !== 1)
            continue;

        var floors = 0;

        for (var j=0;j<dirs.length;j++) {
            var dir = dirs[j];
            if (map[x + dir[0]][y+dir[1]] === 0)
                floors += 1;
        }

        var frnd = Math.floor(ROT.RNG.getUniform() * (9 - floors));
        
        if (floors >= 2 && frnd == 0)
            map[x][y] = 0;

    }
};

Game.Map.smoothMap = function(map) {

    var mapWidth = map.length;
    var mapHeight = map[0].length;

    for (var y=1; y<=mapHeight-2; y++) {
        for (var x=1; x<=mapWidth-2; x++) {
            if (map[x][y] === 1 && ROT.RNG.getPercentage() < 35)
                map[x][y] = 0;
        }
    }

    for (var i=0; i<3; i++)
        Game.Map.genCutoff2(map, 5, 2);
    for (i=0; i<3; i++)
        Game.Map.genCutoff(map, 5);

};

Game.Map.genCutoff = function(map, r1cutoff) {
    var mapWidth = map.length;
    var mapHeight = map[0].length;

    for (var y=1; y<=mapHeight-2; y++) {
        for (var x=1; x<=mapWidth-2; x++) {
            var r1 = Game.Map.countTilesAround(map, 1, x, y);

            if (r1 >= r1cutoff) {
                map[x][y] = 1;
            } else {
                map[x][y] = 0;
            }
                
        }
    }
};

Game.Map.genCutoff2 = function(map, r1cutoff, r2cutoff) {
    var mapWidth = map.length;
    var mapHeight = map[0].length;

    for (var y=1; y<=mapHeight-2; y++) {
        for (var x=1; x<=mapWidth-2; x++) {
            var r1 = 0, r2 = 0;

            for (var dy=-2; dy<=2; dy++) {
                for (var dx=-2; dx<=2; dx++) {
                    var ax = Math.abs(dx);
                    var ay = Math.abs(dy);

                    if (ax == 2 && ay == 2)
                        continue;

                    var newx = x+dx;
                    var newy = y+dy;
                    
                    if (Game.Map.inBounds(map, newx, newy) && map[newx][newy] === 1) {
                        if (ax <= 1 & ay <= 1)
                            r1 += 1;
                        r2 += 1;
                    }

                    
                }
            }

            if (r1 >= r1cutoff || r2 <= r2cutoff) {
                map[x][y] = 1;
            } else {
                map[x][y] = 0;
            }

        }
    }
};

Game.Map.inBounds = function(map, x, y) {
    if (x < 0 || y < 0 || x >= map.length || y >= map[0].length)
        return false;
    return true;
};

Game.Map.countTilesAround = function(map, tileVal, x, y) {
    var count = 0;
    for (var dy=-1; dy<=1; dy++) {
        for (var dx=-1; dx<=1; dx++) {
            var newx = x+dx;
            var newy = y+dy;
            if (map[newx][newy] === tileVal)
                count++;
        }
    }

    return count;
};

// use rot's digLine instead??
Game.Map.getLine = function(from, to) {

    var orthogonalSteps = false;
    
    var delta = [to[0] - from[0], to[1] - from[1]];

    // line octanct
    var primaryStep = [Math.sign(delta[0]), 0];
    var secondaryStep = [0, Math.sign(delta[1])];

    var primary = Math.abs(delta[0]);
    var secondary = Math.abs(delta[1]);

    // swap order if y magnitude is greater
    if (secondary > primary) {
        secondary = [primary, primary = secondary][0];
        secondaryStep = [primaryStep, primaryStep = secondaryStep][0];
    }

    var line = [];
    var current = from;
    var error = 0;

    while (true) {

        line.push(current.slice());

        if (current[0] == to[0] && current[1] == to[1])
            break;

        current[0] = current[0] + primaryStep[0];
        current[1] = current[1] + primaryStep[1];
        error = error + secondary;

        if (error * 2 >= primary) {
            if (orthogonalSteps)
                line.push(current.slice());

            current[0] = current[0] + secondaryStep[0];
            current[1] = current[1] + secondaryStep[1];
            error = error - primary;
        }
    }

    return line;
};


// find closet map value of tileVal starting from x,y
Game.Map.findClosest = function(map, x, y, tileVal) {

    var dirs = ROT.DIRS[8];
    var mult = 1;
    do {
        for (var j=0;j<dirs.length;j++) {
            var dir = dirs[j];
            var lookAtX = x + (dir[0] * mult);
            var lookAtY = y + (dir[1] * mult);
            if (map[lookAtX] != null && map[lookAtX][lookAtY] != null
                && map[lookAtX][lookAtY] === tileVal)
                return [lookAtX, lookAtY];
        }
        mult++;
    } while(mult <= map.length);
    return [x,y];
};


Game.Map.addRoom = function(x, y, w, h, wallVal, floorVal, map) {
    w--;
    h--;
    for (var i=0; i <= w; i++) {
        for (var j=0; j <= h; j++) {
            var empty = (i && j && i<w && j<h);
            if (empty) map[x+i][y+j] = floorVal;
            else map[x+i][y+j] = wallVal;
        }
    }
    return map;
};

Game.Map.createRoom = function(x, y, w, h, wallVal, floorVal, map) {
    var left = x;
    var right = x+w;
    var top = y;
    var bottom = y+h;

    for (var i=left; i<=right; i++) {
        for (var j=top; j<=bottom; j++) {
            if (i == left | i == right || j == top || j == bottom) {
                map[i][j] = wallVal;
            } else {
                map[i][j] = floorVal;
            }
        }
    }
    
    return map;
};

Game.Map.buildCrypt = function(map, sx, sy) {

    var width = ROT.RNG.getUniformInt(3, 8);
    var height = ROT.RNG.getUniformInt(3, 8);

    var x1 = sx - Math.floor(ROT.RNG.getUniform() * width);
    var y1 = sy - Math.floor(ROT.RNG.getUniform() * height);
    var x2 = x1 + width - 1;
    var y2 = y1 + height - 1;
};


Game.Map.ForestBuilder = function(width, height) {
    Game.Map.call(this, width, height);
};

Game.Map.ForestBuilder.extend(Game.Map);

Game.Map.ForestBuilder.prototype.create = function(callback) {
    // fill with trees
    var map = Game.Map.fillMap(this._width, this._height, 1);

    // create center points of meadows
    var meadows = [];
    for (var i=0; i<10; i++) {
        var x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 1));
        var y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 1));
        meadows.push([x,y]);
    }

    // use Voronoi diagram to even out meadow centers
    for (i=0; i<5; i++)
        meadows = Game.Map.voronoiRelaxation(this._width, this._height, meadows);
    // create meadows around center
    for (i=0; i<meadows.length; i++)
        Game.Map.carveCircle(map, meadows[i], 5);
    // connect meadows
    Game.Map.connectPoints(map, meadows);
    // erode map to give it a more natural look
    Game.Map.erode(map, 10000);

    Game.Map.smoothMap(map);
    
    // lake/pond
    //var lakeSize = ROT.RNG.getUniformInt(3, 6);
    //var x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 3));
    //var y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 3));
    //map = Game.Map.filledSquare(meadows[0][0], meadows[0][1], lakeSize, 2, map);
    //map = Game.Map.filledSquare(x, y, lakeSize, 2, map);
    
    // crypt entrance
    // find spot in forest to create, then build path to it
    var check = 0, maxCheck = 2000, found=false;
    do {
        x = ROT.RNG.getUniformInt(1, Game.mapWidth - 4);
        y = ROT.RNG.getUniformInt(1, Game.mapHeight - 4);
        if (map[x][y] === 1) {
            // TODO: erode section?
            map = Game.Map.addRoom(x, y, 3, 3, 6, 6, map);
            map[x+1][y+1] = 3; // stair
            map[x+1][y+2] = 6; // opening
            var toPoint = Game.Map.findClosest(map, x+1, y+2, 0);
            Game.Map.carvePath(map, [x+1,y+2], toPoint);
            found = true;
        }
        check++;
    } while (!found && check<=maxCheck);

    // create exit
    x = 0;
    y = ROT.RNG.getUniformInt(10, Game.mapHeight - 10);
    found = false;
    var failed = 0;
    do {
        if (map[x][y] === 0) {
            found = true;
        } else if (x > Game.mapWidth) {
            // uh oh, couldn't create path, try with a more constrained y
            y = ROT.RNG.getUniformInt(20, Game.mapHeight - 20);
            x = 0;
        } else {
            map[x][y] = 7;
            x++;
        }
    } while (!found && failed < 3);

    if (failed >= 3) {
        // TODO
        // game unwinnable
    }
    
    // callback to fill out the tiles
    for (i=0; i<this._width; i++) {
        for (var j=0; j<this._height; j++) {
            callback(i, j, map[i][j]);
        }
    }
};

Game.Map.ForestBuilder.prototype.createOld = function(callback) {
    var map = Game.Map.fillMap(this._width, this._height, 0);
    for (var i=1; i<this._width; i++) {
        for (var j=1; j<this._height; j++) {
            if (map[i-1][j] === 1 ||
                map[i][j-1] === 1 ||
                map[i-1][j-1] === 1) {
                if (ROT.RNG.getPercentage() <= 40) {
                    map[i][j] = 1;
                }
            } else if (ROT.RNG.getPercentage() <= 5) {
                map[i][j] = 1;
            }
        }
    }

    // pond
    var size = Math.floor(ROT.RNG.getUniform() * 10);
    var x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 3));
    var y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 3));
    map = Game.Map.filledSquare(x, y, size, 4, map);

    // crypt entrance
    x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 3));
    y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 4));
    map = Game.Map.addRoom(x, y, 3, 3, 3, 4, map);
    map[x+1][y+1] = 3; // stair down
    map[x+1][y+2] = 6; // opening
    
    for (var i=0; i<this._width; i++) {
        for (var j=0; j<this._height; j++) {            
            callback(i, j, map[i][j]);
        }
    }
};

Game.Map.CryptBuilder = function(width, height) {
    Game.Map.call(this, width, height);
};

Game.Map.CryptBuilder.extend(Game.Map);

Game.Map.CryptBuilder.prototype.create = function(callback) {
    
    var map = Game.Map.fillMap(this._width, this._height, 1);

    var gen = new ROT.Map.Digger(this._width, this._height);
    gen.create(function(x, y, value) {
        map[x][y] = value;
    }.bind(this));

    var rooms = gen.getRooms();
    // place staircase back up
    var stairsUp = rooms[0].getCenter();
    map[stairsUp[0]][stairsUp[1]] = 2;

    // place staircase to next level
    var stairsDown = rooms[rooms.length-1].getCenter();
    map[stairsDown[0]][stairsDown[1]] = 3;

    // add doors
    var putDoor = function(x, y) {
        var num = ROT.RNG.getUniform();
        if (num < 0.25) {
            map[x][y]= 9;
        } else if (num < 0.5) {
            map[x][y]= 8;
        }
    };
    for (var i=0; i<rooms.length; i++) {
        var room = rooms[i];
        room.getDoors(putDoor);
    }
    
    for (var i=0; i<this._width; i++) {
        for (var j=0; j<this._height; j++) {            
            callback(i, j, map[i][j]);
        }
    }
};

Game.Map.SanctumBuilder = function(width, height) {
    Game.Map.call(this, width, height);
};

Game.Map.SanctumBuilder.extend(Game.Map);

Game.Map.SanctumBuilder.prototype.create = function(callback) {
    
    var map = Game.Map.fillMap(this._width, this._height, 1);

    var x = 40;
    var y = 10;
    map = Game.Map.addRoom(x, y, 25, 15, 1, 0, map);

    // place staircase back up
    do {
        x = Math.floor(ROT.RNG.getUniform() * this._width);
        y = Math.floor(ROT.RNG.getUniform() * this._height);
        console.log(map[x][y]);
    } while (map[x][y] != 0);
    map[x][y] = 2;

    for (var i=0; i<this._width; i++) {
        for (var j=0; j<this._height; j++) {            
            callback(i, j, map[i][j]);
        }
    }
};

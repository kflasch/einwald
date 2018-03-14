// various map drawing utilties

Game.Map = function(width, height) {
    this._width =  width || Game.mapWidth;
    this._height = height || Game.mapHeight;

    this._startx = undefined;
    this._starty = undefined;
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

Game.Map.voroniRelaxation = function(width, height, points) {

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

Game.Map.connectPoints = function(map, points) {
    var connected = [];

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
        //console.log(point[0] + ' ' + point[1]);
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

    //console.log(line);
    return line;
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

    var meadows = [];
    for (var i=0; i<10; i++) {
        var x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 1));
        var y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 1));
        meadows.push([x,y]);
    }

    for (var v=0; v<5; v++)
        meadows = Game.Map.voroniRelaxation(this._width, this._height, meadows);
    for (var i=0; i<meadows.length; i++)
        Game.Map.carveCircle(map, meadows[i], 5);
    Game.Map.connectPoints(map, meadows);
    Game.Map.erode(map, 10000);

    // pond
    var size = Math.floor(ROT.RNG.getUniform() * 10);
    var x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 3));
    var y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 3));
    map = Game.Map.filledSquare(x, y, size, 2, map);

    // crypt entrance
    x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 3));
    y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 4));
    map = Game.Map.addRoom(x, y, 3, 3, 3, 4, map);
    map[x+1][y+1] = 5; // stair
    map[x+1][y+2] = 4; // opening
    
    for (var i=0; i<this._width; i++) {
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
    map = Game.Map.filledSquare(x, y, size, 2, map);

    // crypt entrance
    x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 3));
    y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 4));
    map = Game.Map.addRoom(x, y, 3, 3, 3, 4, map);
    map[x+1][y+1] = 5; // stair
    map[x+1][y+2] = 4; // opening
    
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

    var sx = this._startx - 5;
    if (sx < 0) sx = 0;
    var sy = this._starty - 5;
    if (sy < 0) sy = 0;
    
    map = Game.Map.addRoom(sx, sy, 11, 11, 1, 0, map);
    
    for (var i=0; i<this._width; i++) {
        for (var j=0; j<this._height; j++) {            
            callback(i, j, map[i][j]);
        }
    }
};

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

Game.Map.ForestBuilder = function(width, height) {
    Game.Map.call(this, width, height);
};

Game.Map.ForestBuilder.extend(Game.Map);

Game.Map.ForestBuilder.prototype.create = function(callback) {
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
    x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 3));
    y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 3));
    map = Game.Map.filledSquare(x, y, size, 2, map);

    // crypt entrance
    x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 3));
    y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 4));
    map[x][y] = 3;
    map[x+1][y] = 3;
    map[x+2][y] = 3;
    map[x][y+1] = 3;
    map[x][y+2] = 3;
    map[x+2][y+1] = 3;
    map[x+2][y+2] = 3;
    map[x+1][y+1] = 5; // stair
    map[x+1][y+2] = 4;
    console.log(x + ', ' + y);
    
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

    var map = Game.Map.fillMap(this._width, this._height, 0);

    for (var i=0; i<this._width; i++) {
        for (var j=0; j<this._height; j++) {            
            callback(i, j, map[i][j]);
        }
    }

};

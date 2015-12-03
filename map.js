Game.Map = function(tiles, width, height) {

    this._tiles = tiles;

    this._width = width || Game.mapWidth;
    this._height = height || Game.mapHeight;

    this._items = {};
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

Map.prototype.checkNext = function(x, y) {    
};


Game.Map.Forest = function(width, height) {

    Game.Map.call(this, [], width, height);
    
//    this._width = width || Game.mapWidth;
//    this._height = height || Game.mapHeight;
};

Game.Map.Forest.prototype.create = function(callback) {
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
    
    x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 2));
    y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 2));
    map[x][y] = 2;
    map[x+1][y] = 2;
    map[x][y+1] = 2;
    map[x+1][y+1] = 2;

    x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 2));
    y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 2));
    var key = x + ',' + y;
    this._items[key] = Game.ItemRepository.createRandom();
    
    for (var i=0; i<this._width; i++) {
        for (var j=0; j<this._height; j++) {            
            callback(i, j, map[i][j]);
        }
    }
};


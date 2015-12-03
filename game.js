var Game = {
    mapWidth: 80,
    mapHeight: 24,
    display: null,
    engine: null,
    tiles: [],
    player: null,
    turns: 0,
    message: '',
    items: {},

    init: function() {
        this.display = new ROT.Display({fontFamily:"droid sans mono, monospace",
                                        fontSize: 18, width:100, height:40});

        document.body.appendChild(this.display.getContainer());
        
        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);

        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    _generateMap: function() {

        // initialze nested array
        for (var x=0; x < Game.mapWidth; x++) {
            this.tiles[x] = [];
            for (var y=0; y < Game.mapHeight; y++) {
                this.tiles[x][y] = Tile.nullTile;
            }
        }
        /*
        var generator = new ROT.Map.Cellular(Game.mapWidth, Game.mapHeight);
        generator.randomize(0.5);
        for (var i=0; i<3; i++) {
            generator.create();
        }
        generator.create(function(x, y, value) {
            if (value === 1) {
                this.tiles[x][y] = Tile.caveFloorTile;
            } else {
                this.tiles[x][y] = Tile.caveWallTile;
            }
        }.bind(this));
        */
        var generator = new Game.Map.Forest(Game.mapWidth, Game.mapHeight);
        generator.create(function(x, y, value) {
            if (value === 1) {
                this.tiles[x][y] = Tile.tree;
            } else if (value === 2) {
                this.tiles[x][y] = Tile.water;
            } else {
                this.tiles[x][y] = Tile.grass;
            }
        }.bind(this));

        
//        this._drawWholeMap();

        this._createPlayer();

        this._createItems();

        this.refresh();
    },

    _drawWholeMap: function() {
        for (var x = 0; x < Game.mapWidth; x++) {
            for (var y = 0; y < Game.mapHeight; y++) {
                var glyph = this.tiles[x][y]._glyph;
                this.display.draw(x, y, glyph._char,
                                  glyph._foreground, glyph._background);
            }
        }
    },

    _drawEntities: function() {
        this.player._draw();
    },

    _findEmptyPosition: function() {
        var x, y;
        do {
            x = Math.floor(ROT.RNG.getUniform() * Game.mapWidth);
            y = Math.floor(ROT.RNG.getUniform() * Game.mapHeight);
        } while (!this._isPassable(x,y));
        return {x: x, y: y};
    },

    // check if given coordinates are passable (passable terrain and empty)
    _isPassable: function(x, y) {
        if (this.tiles[x] === undefined ||
            this.tiles[x][y] === undefined ||
            this.tiles[x][y]._passable == false) {
            return false;
        } else {
            return true;
        }
    },
    
    _createPlayer: function() {
        var pos = this._findEmptyPosition();
        this.player = new Player(pos.x, pos.y);
    },

    _createItems: function() {
        var pos = this._findEmptyPosition();
        //Item = new Item
    },

    _updateStatus: function() {
        Game.display.drawText(2, 26, "Name: ");
        Game.display.drawText(2, 27, "Turns: " + Game.turns);

        Game.display.drawText(2, 29, Game.message);
    },

    refresh: function() {
        Game.display.clear();
        Game._drawWholeMap();
        Game._drawEntities();
        Game._updateStatus();
    }
};

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
};

Player.prototype.act = function() {
    Game.engine.lock();
    window.addEventListener("keydown", this);
};

Player.prototype.handleEvent = function(e) {
    var keyMap = {};
    keyMap[38] = 0;
    keyMap[33] = 1;
    keyMap[39] = 2;
    keyMap[34] = 3;
    keyMap[40] = 4;
    keyMap[35] = 5;
    keyMap[37] = 6;
    keyMap[36] = 7;

    var code = e.keyCode;
    if (!(code in keyMap)) { return; }

    Game.turns++;

    var dir = ROT.DIRS[8][keyMap[code]];
    var newX = this._x + dir[0];
    var newY = this._y + dir[1];
    var eventDesc = '';
    
    if (Game._isPassable(newX, newY)) {
        var glyph = Game.tiles[this._x][this._y]._glyph;
//        Game.display.draw(this._x, this._y, glyph._char,
//                      glyph._foreground, glyph._background);
        this._x = newX;
        this._y = newY;
//        this._draw();
        Game.message = 'You pass through ' + Game.tiles[newX][newY]._desc + '.';
    } else {
        if (Game.tiles[newX] === undefined ||
            Game.tiles[newX][newY] === undefined) {
            Game.message = 'You cannot pass this way.';
        } else {
            Game.message = (Game.tiles[newX][newY]._desc || 'Something') + ' is in the way.';
            Game.message = Game.message.capitalize();
        }
    }

    Game.refresh();
    
    window.removeEventListener("keydown", this);
    Game.engine.unlock();
};

Player.prototype._draw = function() {
    Game.display.draw(this._x, this._y, "@", "#ff0");
};

window.onload = function() {
    if (!ROT.isSupported()) {
        alert("Your browser is not supported.");
    } else {
        Game.init();
    }
};

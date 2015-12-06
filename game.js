var Game = {
    mapWidth: 80,
    mapHeight: 24,
    display: null,
    engine: null,
    player: null,
    player2: null,
    turns: 0,
    message: '',
    zone: null,
    items: {},

    init: function() {
        this.display = new ROT.Display({fontFamily:"droid sans mono, monospace",
                                        fontSize: 18, width:100, height:40});

        document.body.appendChild(this.display.getContainer());
        
        this.player = new Game.Entity(Game.PlayerTemplate);

        this._generateMap();

        var scheduler = new ROT.Scheduler.Simple();
        scheduler.add(this.player, true);

        this.engine = new ROT.Engine(scheduler);
        this.engine.start();
    },

    _generateMap: function() {

        // initialze nested array
        var tiles = [];
        for (var x=0; x < Game.mapWidth; x++) {
            tiles[x] = [];
            for (var y=0; y < Game.mapHeight; y++) {
                tiles[x][y] = Tile.nullTile;
            }
        }

        this.zone = new Game.Zone.Forest(tiles);
        
        var pos = this._findEmptyPosition();
        //this.player = new Player(pos.x, pos.y);
        this.player._x = pos.x;
        this.player._y = pos.y;

        this.refresh();
    },

    _renderZone: function() {
        for (var x = 0; x < Game.mapWidth; x++) {
            for (var y = 0; y < Game.mapHeight; y++) {
                var glyph = this.zone._tiles[x][y]._glyph;
                this.display.draw(x, y, glyph._char,
                                  glyph._foreground, glyph._background);
            }
        }
    },
    
    _drawWholeMap: function() {
        for (var x = 0; x < Game.mapWidth; x++) {
            for (var y = 0; y < Game.mapHeight; y++) {
                var glyph = this.zone._tiles[x][y]._glyph;
                this.display.draw(x, y, glyph._char,
                                  glyph._foreground, glyph._background);
            }
        }
    },

    _drawItems: function() {

        var items = this.zone._items;
        for (key in items) {
            var parts = key.split(',');
            var item = items[key];
            this.display.draw(parseInt(parts[0]), parseInt(parts[1]),
                              item._char, item._foreground, item._background);
        }
    },

    _drawEntities: function() {
        this.player.draw();
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
        if (this.zone._tiles[x] === undefined ||
            this.zone._tiles[x][y] === undefined ||
            this.zone._tiles[x][y]._passable == false) {
            return false;
        } else {
            return true;
        }
    },
    
    _updateStatus: function() {
        Game.display.drawText(2, 26, "Name: ");
        Game.display.drawText(2, 27, "Turns: " + Game.turns);

        Game.display.drawText(2, 29, Game.message);
    },

    refresh: function() {
        Game.display.clear();
        Game._renderZone();
        //Game._drawWholeMap();
        //Game._drawItems();
        //Game._drawEntities();
        Game._updateStatus();
    }
};

var Player = function(x, y) {
    this._x = x;
    this._y = y;
    this._draw();
};

/*
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
        var glyph = Game.zone._tiles[this._x][this._y]._glyph;
        this._x = newX;
        this._y = newY;
        Game.message = 'You pass through ' + Game.zone._tiles[newX][newY]._desc + '.';
    } else {
        if (Game.zone._tiles[newX] === undefined ||
            Game.zone._tiles[newX][newY] === undefined) {
            Game.message = 'You cannot pass this way.';
        } else {
            Game.message = (Game.zone._tiles[newX][newY]._desc || 'Something') + ' is in the way.';
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
*/

window.onload = function() {
    if (!ROT.isSupported()) {
        alert("Your browser is not supported.");
    } else {
        Game.init();
    }
};

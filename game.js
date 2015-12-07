var Game = {
    mapWidth: 80,
    mapHeight: 24,
    display: null,
    engine: null,
    player: null,
    turns: 0,
    message: '',
    zone: null,
    items: {},

    init: function() {
        this.display = new ROT.Display({fontFamily:"droid sans mono, monospace",
                                        fontSize: 18, width:100, height:40});

        document.body.appendChild(this.display.getContainer());
        
        // do we need to remove these while processing game events?
        var bindEvent = function(event) {
            window.addEventListener(event, function(e) {
                Game.handleInput(event, e);
            });
        };
        bindEvent('keydown');
        bindEvent('keypress');
        
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

        this.player._zone = this.zone;
        var pos = this._findEmptyPosition();
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
    
    _drawItems: function() {

        var zoneItems = this.zone._items;
        for (key in zoneItems) {
            var parts = key.split(',');
            var itemsAt = zoneItems[key];
            if (itemsAt) {
                var item = itemsAt[0];
                this.display.draw(parseInt(parts[0]), parseInt(parts[1]),
                              item._char, item._foreground, item._background);
            }
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
        Game._drawItems();
        Game._drawEntities();
        Game._updateStatus();
    }
};

Game.movePlayer = function(dX, dY) {
    var newX = Game.player._x + dX;
    var newY = Game.player._y + dY;
    Game.player.tryMove(newX, newY, Game.zone);
};

Game.handleInput = function(inputType, inputData) {
    if (inputType === 'keydown') {
        /*
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

        var dir = ROT.DIRS[8][keyMap[code]];
        var newX = this._x + dir[0];
        var newY = this._y + dir[1];
        */
        if (inputData.keyCode === ROT.VK_LEFT) {
            Game.movePlayer(-1, 0);
        } else if (inputData.keyCode === ROT.VK_RIGHT) {
            Game.movePlayer(1, 0);
        } else if (inputData.keyCode === ROT.VK_UP) {
            Game.movePlayer(0, -1);
        } else if (inputData.keyCode === ROT.VK_DOWN) {
            Game.movePlayer(0, 1);
        } else if (inputData.keyCode === ROT.VK_G) {
            var items = Game.zone.getItemsAt(Game.player._x, Game.player._y);
            if (items && items.length === 1) {
                var item = items[0];
                if (Game.player.pickupItems()) {
                    Game.message = "You pick up a " + item.describe() + ".";
                }
            } else {
                Game.message = "There is nothing here to pick up.";
            }
        } else {
            return;
        }
        
        Game.engine.unlock();
    } else if (inputType === 'keypress') {
        // for multi-key input (shift-char, etc)
        var keyChar = String.fromCharCode(inputData.charCode);
        if (keyChar === '?') {
            Game.message = 'help';
        } else {
            return;
        }
        
        Game.engine.unlock();
    }

};

window.onload = function() {
    if (!ROT.isSupported()) {
        alert("Your browser is not supported.");
    } else {
        Game.init();
    }
};

var Game = {
    mapWidth: 80,
    mapHeight: 24,
    display: null,
    engine: null,
    scheduler: null,
    player: null,
    turns: 0,
    message: '',
    zone: null,
    items: {},

    init: function() {
        this.display = new ROT.Display({fontFamily:"droid sans mono, monospace",
                                        fontSize: 18, width:90, height:40});

        document.getElementById('ROTDisplay').appendChild(this.display.getContainer());
        
        // do we need to remove these while processing game events?
        var bindEvent = function(event) {
            window.addEventListener(event, function(e) {
                Game.handleInput(event, e);
            });
        };
        bindEvent('keydown');
        bindEvent('keypress');
        
        this.scheduler = new ROT.Scheduler.Simple();

        this.player = new Game.Entity(Game.PlayerTemplate);

        this._generateMap();

        this.scheduler.add(this.player, true);

        this.engine = new ROT.Engine(this.scheduler);
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

        this.zone = new Game.Zone.Forest(tiles, this.player);

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
        var zoneEntities = Game.zone._entities;
        for (key in zoneEntities) {
            var parts = key.split(',');
            var entity = zoneEntities[key];
            if (entity) {
                this.display.draw(parseInt(parts[0]), parseInt(parts[1]),
                                  entity._char, entity._foreground, entity._background);
            }
        }


    },

    refresh: function() {
        Game.display.clear();
        Game._renderZone();
        Game._drawItems();
        Game._drawEntities();
        Game.UI.update();
    },

    keyMap: {
        38: 0,
        33: 1,
        39: 2,
        34: 3,
        40: 4,
        35: 5,
        37: 6,
        36: 7
    }
};

Game.dialog = function() {

    Game.display.clear();
    for (var i=3; i<40; i++) {
        Game.display.draw(i, 2, '-',
                          'white', 'black');
    }
    
};

Game.movePlayer = function(dX, dY) {
    var newX = Game.player._x + dX;
    var newY = Game.player._y + dY;
    Game.player.tryMove(newX, newY, Game.zone);
};

Game.handleInput = function(inputType, inputData) {
    if (inputType === 'keydown') {

        if (inputData.keyCode in Game.keyMap) {
            var dir = ROT.DIRS[8][Game.keyMap[inputData.keyCode]];
            Game.movePlayer(dir[0], dir[1]);
        } else if (inputData.keyCode === ROT.VK_D) {
            Game.message = "You can't figure out how to drop anything.";
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
//            Game.dialog();
            Game.message = "'g' to pick up";
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

var Game = {
    canvasWidth: 80,
    canvasHeight: 24,
    mapWidth: 100,
    mapHeight: 30,
    display: null,
    engine: null,
    scheduler: null,
    player: null,
    turns: 0,
    world: null,
    zone: null,
    currentDialog: null,
    debug: false,
    zoneMap: new Map(),

    init: function() {
        this.display = new ROT.Display({fontFamily:"droid sans mono, monospace",
                                        fontSize: 18, width:this.canvasWidth, height:this.canvasHeight});

        document.getElementById('ROTDisplay').appendChild(this.display.getContainer());
        
        // do we need to remove these while processing game events?
        var bindEvent = function(event) {
            window.addEventListener(event, function(e) {
                if (Game.currentDialog) {
                    Game.currentDialog.handleInput(event, e);
                } else {
                    Game.handleInput(event, e);
                }
            });
        };
        bindEvent('keydown');
        bindEvent('keypress');

        //window.addEventListener("beforeunload", function(e) {
        //    e.returnValue = "Quit?";
        //});
        
        Game.currentDialog = new Game.Dialog.MainMenu();
        Game.currentDialog.show();
    },

    _startGame: function(load=false) {

        document.getElementById('wrapper').style.visibility = 'visible';
        
        this.scheduler = new ROT.Scheduler.Simple();

        if (load) {
            this.player = new Game.Entity(Game.PlayerTemplate);
            //this._generateMap();
            this._loadGame();
        } else {
            this.player = new Game.Entity(Game.PlayerTemplate);
            this.player._name = Names.genPlayerName();
            this._generateMap();
        }

        this._generateQuest();

        this.scheduler.add(this.player, true);

        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();            
    },
    
    _saveGame: function() {
        localStorage.setItem("einwald_turns", this.turns);
        localStorage.setItem("einwald_player", this.player.exportToString());
        localStorage.setItem("einwald_zone", this.zone.exportToString());        
    },

    _loadGame: function() {

        this.turns = localStorage.getItem("einwald_turns");
        
        var savedPlayer = JSON.parse(localStorage.getItem("einwald_player"));
        for (var key in savedPlayer) {
            this.player[key] = savedPlayer[key];
        }

        var savedZone = JSON.parse(localStorage.getItem("einwald_zone"));
        this.zone = new Game.Zone(savedZone._tiles);
        for (var xyloc in savedZone._items) {
            var itemArr = savedZone._items[xyloc];
            for (var i=0;i<itemArr.length; i++) {
                var savedItem = itemArr[i];
                //console.log(savedItem);
                var newItem = new Game.Item();
                for (var itemProp in savedItem)
                    newItem[itemProp] = savedItem[itemProp];
                this.zone.addItem(xyloc, newItem);
            }
            
                //newItem[itemProp] = savedZone._items[itemProp];
        
        }
        this.zone.addEntity(this.player);
        for (var key in savedZone) {
            //console.log(key);
        }

        this.refresh();
    },
    
    _generateMap: function() {

        // initialize nested array
        var tiles = [];
        for (var x=0; x < Game.mapWidth; x++) {
            tiles[x] = [];
            for (var y=0; y < Game.mapHeight; y++) {
                tiles[x][y] = Game.Tile.nullTile;
            }
        }

        this.zone = new Game.Zone.Forest(tiles, this.player);

        this.refresh();
    },

    _generateQuest: function() {
    },

    _renderZone: function() {

        var offsets = this._getCanvasOffsets();
        var topLeftX = offsets.x;
        var topLeftY = offsets.y;

        var visCells = {};
        var thisZone = this.zone;
        this.zone._fov.compute(
            this.player._x, this.player._y,
            this.player._sightRadius,
            function(x, y, radius, visibility) {
                //var dx = x - this.player._x;
                //var dy = y - this.player._y;
                //if (dx*dx+dy*dy*Math.sqrt(3) > this.player._sightRadius*this.player._sightRadius)
                //    return;
                visCells[x + "," + y] = true;
                //visCells[x + "," + y] = visibility;
                thisZone.setExplored(x, y, true);
            });

        for (var x = topLeftX; x < topLeftX + Game.canvasWidth; x++) {
            for (var y = topLeftY; y < topLeftY + Game.canvasHeight; y++) {
                if (this.zone.isExplored(x, y)) {
                    var glyph = this.zone.getTile(x, y);
                    if (glyph !== Game.Tile.nullTile) {
                        var fg = glyph._darkfg;
                        if (visCells[x + "," + y]) {
                            var items = this.zone.getItemsAt(x, y);
                            if (items) 
                                glyph = items[items.length - 1];
                            var entity = this.zone.getEntityAt(x, y);
                            if (entity)
                                glyph = entity;
                            fg = glyph._foreground;
                            //fg = Game.shadeColor(glyph._foreground, visCells[x + "," + y]);
                        }
                        this.display.draw(x - topLeftX, y - topLeftY, glyph._char,
                                          fg, glyph._background);
                    }
                }
            }
        }
        
    },
    
    _getCanvasOffsets: function() {
        var topLeftX = Math.max(0, this.player._x - (Game.canvasWidth / 2));
        topLeftX = Math.min(topLeftX, Game.mapWidth - Game.canvasWidth);
        var topLeftY = Math.max(0, this.player._y - (Game.canvasHeight / 2));
        topLeftY = Math.min(topLeftY, Game.mapHeight - Game.canvasHeight);
        return { x: topLeftX, y: topLeftY };
    },
    
    refresh: function() {
        Game.display.clear();
        Game._renderZone();
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

Game.shadeColor = function(colStr, vis) {
    var colArr = ROT.Color.fromString(colStr);
    //    var shadeCol = [255*vis, 255*vis, 255*vis];
    colArr = [colArr[0]*vis, colArr[1]*vis, colArr[2]*vis];
    return ROT.Color.toHex(colArr);
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
        } else if (inputData.keyCode === ROT.VK_I) {
            Game.currentDialog = new Game.Dialog.Items(Game.Dialog.invProp, Game.player._items);
            Game.currentDialog.show();
            return;
        } else if (inputData.keyCode === ROT.VK_D) {
            if (Game.player.getInvSize() === 0) {
                Game.UI.addMessage("You have nothing to drop.");                
            } else {
                var dropItems = Game.player._items;
                Game.currentDialog = new Game.Dialog.Items(Game.Dialog.dropProp, dropItems);
                Game.currentDialog.show();
            }
            return;
        } else if (inputData.keyCode === ROT.VK_G) {
            var getItems = Game.zone.getItemsAt(Game.player._x, Game.player._y);
            if (getItems && getItems.length === 1) {
                var item = getItems[0];
                if (Game.player.pickupItems([0])) {
                    Game.UI.addMessage("You pick up a " + item.getName() + ".");
                } else {
                    Game.UI.addMessage("You can't pick the " + item.getName() + " up.");
                }
            } else if (getItems && getItems.length > 0) {
                Game.currentDialog = new Game.Dialog.Items(Game.Dialog.pickupProp, getItems);
                Game.currentDialog.show();
            } else {
                Game.UI.addMessage("There is nothing here to pick up.");
            }
            return;
        } else if (inputData.keyCode === ROT.VK_PERIOD) {
            // skip turn
            Game.engine.unlock();
            return;
        } else if (inputData.keyCode === ROT.VK_S) {
            this._saveGame();
            Game.UI.addMessage("Game saved.");
            return;
        } else if (inputData.keyCode === ROT.VK_BACK_SLASH) {
            Game.debug = (Game.debug === false) ? true : false;
        } else {
            return;
        }

        // expend a turn if we got here
        Game.engine.unlock();
    } else if (inputType === 'keypress') {
        // for multi-key input (shift-char, etc)
        var keyChar = String.fromCharCode(inputData.charCode);
        if (keyChar === '?') {
            Game.currentDialog = new Game.Dialog.Help();
            Game.currentDialog.show();
        } else {
            return;
        }        
    }

};

window.onload = function() {
    if (!ROT.isSupported() || typeof(Storage) === 'undefined') {
        alert("Your browser is not supported.");
    } else {
        Game.init();
    }
};

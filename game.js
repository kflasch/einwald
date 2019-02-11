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
    seed: null,
    world: null,
    zone: null,
    currentDialog: null,
    pendingDirInput: null,
    visibleEntities: [],
    debug: false,

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
            this._loadGame();
        } else {
            this.seed = ROT.RNG.getSeed();
            this._generatePlayer();
            this._generateWorld();
            Game.UI.addMessage("Welcome to Einwald, adventurer!");
            Game.UI.addMessage("Find a way to escape from the forest...");
        }

        this.scheduler.add(this.player, true);

        this.engine = new ROT.Engine(this.scheduler);
        this.engine.start();            
    },
    
    _saveGame: function() {
        localStorage.setItem("einwald_seed", this.seed);
        localStorage.setItem("einwald_turns", this.turns);
        localStorage.setItem("einwald_world", this.world.exportToString());        
    },

    _loadGame: function() {

        this.seed = parseInt(localStorage.getItem("einwald_seed"), 10);
        this.turns = localStorage.getItem("einwald_turns");

        ROT.RNG.setSeed(this.seed);
        
        var savedWorld = JSON.parse(localStorage.getItem("einwald_world"));
        this.world = new Game.World();
        this.world._name = savedWorld._name;
        
        for (var z=0;z<savedWorld._zones.length;z++) {
            var savedZone = savedWorld._zones[z];
            var zone = new Game.Zone(savedZone._tiles);
            zone._name = savedZone._name;
            zone._id = savedZone._id;
            zone._explored = savedZone._explored;
            zone._connections = savedZone._connections;
            
            for (var xyloc in savedZone._items) {
                var itemArr = savedZone._items[xyloc];
                for (var i=0;i<itemArr.length; i++) {
                    var savedItem = itemArr[i];
                    var template = Game.ItemRepository.getTemplate(savedItem._templateName);
                    var newItem = new Game.Item(template);
                    for (var itemProp in savedItem)
                        newItem[itemProp] = savedItem[itemProp];
                    zone.addItem(xyloc, newItem);
                }            
            }

            for (var xyloc in savedZone._entities) {
                var savedEnt = savedZone._entities[xyloc];
                var newEnt = null;
                if (savedEnt._attachedMixins['PlayerActor']) {
                    newEnt = new Game.Entity(Game.PlayerTemplate);
                    this.player = newEnt;
                } else {
                    var entTemplate = Game.EntityRepository.getTemplate(savedEnt._templateName);
                    newEnt = new Game.Entity(entTemplate);
                }
                for (var entProp in savedEnt) {
                    newEnt[entProp] = savedEnt[entProp];
                }
                if (savedEnt._items) {
                    for (var i=0;i<savedEnt._items.length; i++) {
                        var savedItem = savedEnt._items[i];
                        if (savedItem) {
                            var template = Game.ItemRepository.getTemplate(savedItem._templateName);
                            var newItem = new Game.Item(template);                        
                            for (var itemProp in savedItem)
                                newItem[itemProp] = savedItem[itemProp];
                            newEnt._items[i] = newItem;
                        }
                    }
                }
                
                zone.addEntity(newEnt);
            }

            // add reconstructed zone to world
            this.world._zones[z] = zone;

        }

        // set current player zone
        this.zone = this.player._zone;
        
        this.refresh();
    },

    _generatePlayer: function() {
        this.player = new Game.Entity(Game.PlayerTemplate);
        this.player._name = Names.genPlayerName();
        this.player.addItem(Game.ItemRepository.create('traveleroutfit'));
        this.player.wear(0);
        this.player.addItem(Game.ItemRepository.create('dagger'));
        this.player.wield(1);
        this.player.addItem(Game.ItemRepository.create('healingherb'));
    },

    _generateWorld: function() {

        this.world = new Game.World();
        this.world._init(this.player);
        this.zone = this.world._zones[0];

        this.refresh();
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

        Game.visibleEntities = [];
        for (var x = topLeftX; x < topLeftX + Game.canvasWidth; x++) {
            for (var y = topLeftY; y < topLeftY + Game.canvasHeight; y++) {
                if (this.zone.isExplored(x, y) || Game.debug) {
                    var glyph = this.zone.getTile(x, y);
                    if (glyph !== Game.Tile.nullTile) {
                        var fg = glyph._darkfg;
                        if (visCells[x + "," + y] || Game.debug) {
                            var items = this.zone.getItemsAt(x, y);
                            if (items) 
                                glyph = items[items.length - 1];
                            var entity = this.zone.getEntityAt(x, y);
                            if (entity) {
                                if (!entity.hasMixin(Game.EntityMixins.PlayerActor))
                                    Game.visibleEntities.push(entity);
                                glyph = entity;
                            }
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
        104: 0,
        33: 1,
        105: 1,
        39: 2,
        102: 2,
        34: 3,
        99: 3,
        40: 4,
        98: 4,
        35: 5,
        97: 5,
        37: 6,
        100: 6,
        36: 7,
        103: 7
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

Game.changeCurrentZone = function() {
    var newZoneID = Game.player.changeZone();
    if (Number.isInteger(newZoneID)) {
        Game.zone = Game.world._zones[newZoneID];
        Game.player._zone = Game.zone;
        this.refresh();
    }       
};

Game.wonGame = function() {
    Game.currentDialog = new Game.Dialog.WonGame();
    Game.currentDialog.show();
};

Game.lostGame = function() {
    Game.currentDialog = new Game.Dialog.LostGame();
    Game.currentDialog.show();
};

Game.handleInput = function(inputType, inputData) {
    
    if (inputType === 'keydown') {

        //console.log(inputData.keyCode);
        //console.log(inputData.charCode);

        // handle compound actions that require direction
        if (Game.pendingDirInput) {
            var didDirAction = Game.handleDirInput(inputData);
            Game.pendingDirInput = null;
            if (didDirAction)
                Game.engine.unlock();
            return;
        }

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
        } else if (inputData.keyCode === ROT.VK_O) {
            Game.pendingDirInput = 'open';
            return;
        } else if (inputData.keyCode === ROT.VK_PERIOD || inputData.keyCode === ROT.VK_NUMPAD5) {
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
        } else if (keyChar === '>') {
            Game.changeCurrentZone();
        } else if (keyChar === '<') {
            Game.changeCurrentZone();
        } else {
            return;
        }        
    }

};

// handle compound directional actions (e.g., open door in specific dir)
Game.handleDirInput = function(inputData) {
    if (inputData.keyCode in Game.keyMap) {
        var dir = ROT.DIRS[8][Game.keyMap[inputData.keyCode]];
        var x = Game.player._x + dir[0];
        var y = Game.player._y + dir[1];
        Game.player.tryDoor(x, y, Game.zone);
        return true;
    } else {
        // don't expend a turn, no action
        return false;
    }
};

window.onload = function() {
    if (!ROT.isSupported() || typeof(Storage) === 'undefined') {
        alert("Your browser is not supported.");
    } else {
        Game.init();
    }
};

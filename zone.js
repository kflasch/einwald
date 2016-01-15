Game.Zone = function(tiles) {

    this._name = "";
    
    this._tiles = tiles;

    this._width =  tiles.length || Game.mapWidth;
    this._height = tiles[0].length || Game.mapHeight;

    this._fov = this._setupFOV();

    // map of 'x,y' to items, entities
    this._items = {};
    this._entities = {};

    this._explored = this._setupExplored();
};

Game.Zone.prototype.getTile = function(x, y) {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
        return Game.Tile.nullTile;
    } else {
        return this._tiles[x][y] || Game.Tile.nullTile;
    }
};

Game.Zone.prototype._setupFOV = function() {
    var thisZone = this;
    return new ROT.FOV.PreciseShadowcasting(function(x, y) {
        return !thisZone.getTile(x, y)._blocksLight;
    }, {topology: 8});
};

Game.Zone.prototype._setupExplored = function() {
    var arr = [];
    for (var x=0; x < this._width; x++) {
        arr[x] = [];
        for (var y=0; y < this._height; y++) {
            arr[x][y] = false;
        }
    }
    return arr;
};

Game.Zone.prototype.setExplored = function(x, y, state) {
    if (this.getTile(x, y) !== Game.Tile.nullTile) {
        this._explored[x][y] = state;
    }
};

Game.Zone.prototype.isExplored = function(x, y) {
    if (this.getTile(x, y) !== Game.Tile.nullTile) {
        return this._explored[x][y];
    } else {
        return false;
    }
};

Game.Zone.prototype.getItemsAt = function(x, y) {
    return this._items[x + ',' + y];
};

Game.Zone.prototype.setItemsAt = function(x, y, items) {
    var key = x + ',' + y;
    if (items.length === 0) {
        // if no items, clear out this key if it exists
        if (this._items[key]) {
            delete this._items[key];
        }
    } else {
        this._items[key] = items;
    }
};

Game.Zone.prototype.addItem = function(x, y, item) {
    var key = x + ',' + y;
    if (this._items[key]) {
        this._items[key].push(item);
    } else {
        this._items[key] = [item];
    }
};

Game.Zone.prototype.getEmptyRandomPosition = function() {
    var x, y;
    do {
        x = Math.floor(ROT.RNG.getUniform() * this._width);
        y = Math.floor(ROT.RNG.getUniform() * this._height);
    } while (!this.isPassable(x,y));
    return {x: x, y: y};
};

Game.Zone.prototype.getEmptyRandomPositionNear = function(nx, ny, dist) {
    var x, y;
    var maxx = nx + dist, maxy = ny + dist;
    var minx = nx - dist, miny = ny - dist;
    var maxCheck = Math.pow((dist + dist + 1), 2), check = 0;
    do {
        //x = Math.floor(ROT.RNG.getUniform() * (maxx - minx + 1)) + min;
        x = ROT.RNG.getUniformInt(minx, maxx);
        y = ROT.RNG.getUniformInt(miny, maxy);
        check++;
    } while (!this.isPassable(x, y) && check<=maxCheck);
    if (check >= maxCheck) return null;
    return {x: x, y: y};
};

// true if given pos is passable and has no entities
Game.Zone.prototype.isPassable = function(x, y) {
    return this.getTile(x, y)._passable &&
        !this.getEntityAt(x, y);
};

Game.Zone.prototype.getEntityAt = function(x, y) {
    return this._entities[x + ',' + y];
};

Game.Zone.prototype.addEntityAtRandomPosition = function(entity) {
    var pos = this.getEmptyRandomPosition();
    entity._x = pos.x;
    entity._y = pos.y;
    this.addEntity(entity);
};

Game.Zone.prototype.addEntity = function(entity) {
    entity._zone = this;

    this.updateEntityPosition(entity);

    if (entity.hasMixin('Actor')) {
        Game.scheduler.add(entity, true);
    }

    //if (entity.hasMixin('PlayerActor')) {
    //    Game.player = entity;
    //}

};

Game.Zone.prototype.updateEntityPosition = function(entity, oldX, oldY) {

    // if coords passed in, deleted old key 
    if (typeof oldX === 'number') {
        var oldKey = oldX + ',' + oldY;
        if (this._entities[oldKey] == entity) {
            delete this._entities[oldKey];
        }
    }
    
    if (entity._x < 0 || entity._x >= this._width ||
        entity._y < 0 || entity._y >= this._height) {
        throw new Error("Entity's position is out of bounds.");
    }

    var key = entity._x + ',' + entity._y;
    if (this._entities[key]) {
        throw new Error('Tried to add entity to location with another entity.');
    }

    this._entities[key] = entity;
};




Game.Zone.Forest = function(tiles, player) {

    Game.Zone.call(this, tiles);

    this._name = "Forest";
    
    var generator = new Game.Map.ForestBuilder();
    generator.create(function(x, y, value) {
        if (value === 1) {
            this._tiles[x][y] = Game.Tile.tree;
        } else if (value === 2) {
            this._tiles[x][y] = Game.Tile.water;
        } else {
            this._tiles[x][y] = Game.Tile.grass;
        }
    }.bind(this));

    this.addEntityAtRandomPosition(player);

    for (var i=0; i<10; i++) {
        x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 2));
        y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 2));
        if (this.getTile(x, y)._passable) {
            var entity = Game.EntityRepository.createRandom();
            this.addEntityAtRandomPosition(entity);
        }
    }
    var itemLoc = this.getEmptyRandomPositionNear(player._x, player._y, 2);
    if (itemLoc) {
        this._items[itemLoc.x + ',' + itemLoc.y] = [Game.ItemRepository.create('knife')];
    }

    for (var i=0; i<50; i++) {
        x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 2));
        y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 2));
        if (this.getTile(x, y)._passable) {
            var key = x + ',' + y;
            this._items[key] = [Game.ItemRepository.createRandom()];
        }
    }


};

Game.Zone.Forest.extend(Game.Zone);


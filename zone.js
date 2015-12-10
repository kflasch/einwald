Game.Zone = function(tiles) {

    this._tiles = tiles;

    this._width =  tiles.length || Game.mapWidth;
    this._height = tiles[0].length || Game.mapHeight;

    // map of 'x,y' to items, entities
    this._items = {};
    this._entities = {};
};

Game.Zone.prototype.getTile = function(x, y) {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
        return Tile.nullTile;
    } else {
        return this._tiles[x][y] || Tile.nullTile;
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

Game.Zone.prototype.getEmptyRandomPosition = function() {
    var x, y;
    do {
        x = Math.floor(ROT.RNG.getUniform() * this._width);
        y = Math.floor(ROT.RNG.getUniform() * this._height);
    } while (!this.isPassable(x,y));
    return {x: x, y: y};
};

// true if given pos is passable and has no entities
Game.Zone.prototype.isPassable = function(x, y) {
    return this.getTile(x, y)._passable &&
        !this.getEntityAt(x, y);
    /*
    if (this.zone._tiles[x] === undefined ||
        this.zone._tiles[x][y] === undefined ||
        this.zone._tiles[x][y]._passable == false) {
        return false;
    } else {
        return true;
    }
    */
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

    var generator = new Game.Map.ForestBuilder();
    generator.create(function(x, y, value) {
        if (value === 1) {
            this._tiles[x][y] = Tile.tree;
        } else if (value === 2) {
            this._tiles[x][y] = Tile.water;
        } else {
            this._tiles[x][y] = Tile.grass;
        }
    }.bind(this));

    this.addEntityAtRandomPosition(player);

    var entity = Game.EntityRepository.createRandom();
    this.addEntityAtRandomPosition(entity);

    for (var i=0; i<20; i++) {
        x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 2));
        y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 2));
        if (this.getTile(x, y)._passable) {
            var key = x + ',' + y;
            this._items[key] = [Game.ItemRepository.createRandom()];
        }
    }


};

Game.Zone.Forest.extend(Game.Zone);


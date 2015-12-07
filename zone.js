Game.Zone = function(tiles) {

    this._tiles = tiles;

    this._width =  tiles.length || Game.mapWidth;
    this._height = tiles[0].length || Game.mapHeight;

    // map of 'x,y' to items
    this._items = {};
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

Game.Zone.Forest = function(tiles) {

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

    x = Math.floor(ROT.RNG.getUniform() * (Game.mapWidth - 2));
    y = Math.floor(ROT.RNG.getUniform() * (Game.mapHeight - 2));
    var key = x + ',' + y;
    this._items[key] = [Game.ItemRepository.createRandom()];
};

Game.Zone.Forest.extend(Game.Zone);


Game.Zone = function(tiles) {

    this._tiles = tiles;

    this._width =  tiles.length || Game.mapWidth;
    this._height = tiles[0].length || Game.mapHeight;

    this._items = {};
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
    this._items[key] = Game.ItemRepository.createRandom();
};

Game.Zone.Forest.extend(Game.Zone);


Game.World = function() {

    this._zones = null;

    // initialze nested array
    var tiles = [];
    for (var x=0; x < Game.mapWidth; x++) {
        tiles[x] = [];
        for (var y=0; y < Game.mapHeight; y++) {
            tiles[x][y] = Game.Tile.nullTile;
        }
    }

    this.zone = new Game.Zone.Forest(tiles, this.player);
};



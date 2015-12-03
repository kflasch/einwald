Tile = function(properties) {
    properties = properties || {};
    
    this._glyph = new Game.Glyph(properties);
    this._passable = properties['passable'] || false;
    this._desc = properties['desc'] || '';
};


Tile.nullTile = new Tile({
});
Tile.tree = new Tile({
    chr: 'T',
    fg: 'green',
    passable: false,
    desc: 'a tree'
});
Tile.grass = new Tile({
    chr: '.',
    fg: 'green',
    passable: true,
    desc: 'grass'
});
Tile.water = new Tile({
    chr: '~',
    fg: 'blue',
    passable: true,
    desc: 'water'
});
Tile.caveFloorTile = new Tile({
    chr: '.',
    fg: 'white',
    passable: true
});
Tile.caveWallTile = new Tile({
    chr: '#',
    fg: 'goldenrod',
    passable: false
});

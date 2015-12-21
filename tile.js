Game.Tile = function(properties) {
    properties = properties || {};

    Game.Glyph.call(this, properties);
    
    this._passable = properties['passable'] || false;
    this._desc = properties['desc'] || '';
};

Game.Tile.extend(Game.Glyph);

Game.Tile.nullTile = new Game.Tile({
});
Game.Tile.tree = new Game.Tile({
    chr: '♣', // ♠
    fg: 'green',
    passable: false,
    desc: 'a tree'
});
Game.Tile.grass = new Game.Tile({
    chr: '.',
    fg: 'green',
    passable: true,
    desc: 'grass'
});
Game.Tile.water = new Game.Tile({
    chr: '~',
    fg: 'blue',
    passable: true,
    desc: 'water'
});
Game.Tile.caveFloorTile = new Game.Tile({
    chr: '.',
    fg: 'white',
    passable: true
});
Game.Tile.caveWallTile = new Game.Tile({
    chr: '#',
    fg: 'goldenrod',
    passable: false
});

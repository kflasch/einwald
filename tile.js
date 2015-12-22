Game.Tile = function(properties) {
    properties = properties || {};

    Game.Glyph.call(this, properties);
    
    this._passable = properties['passable'] || false;
    this._blocksLight = (properties['blocksLight'] !== undefined) ?
        properties['blocksLight'] : true;
    this._desc = properties['desc'] || '';
};

Game.Tile.extend(Game.Glyph);

Game.Tile.nullTile = new Game.Tile({
});
Game.Tile.tree = new Game.Tile({
    chr: '♣', // ♠
    fg: 'green',
    passable: false,
    blocksLight: true,
    desc: 'a tree'
});
Game.Tile.grass = new Game.Tile({
    chr: '.',
    fg: 'green',
    passable: true,
    blocksLight: false,
    desc: 'grass'
});
Game.Tile.water = new Game.Tile({
    chr: '~',
    fg: 'blue',
    passable: true,
    blocksLight: false,
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

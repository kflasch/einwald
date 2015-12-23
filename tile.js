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
    fg: 'rgb(0,128,0)',
    dfg: ROT.Color.toHex(ROT.Color.multiply([0,128,0], [20, 100, 15])),
    passable: false,
    blocksLight: true,
    desc: 'a tree'
});
Game.Tile.grass = new Game.Tile({
    chr: '.',
    fg: 'rgb(0,128,0)',
    dfg: ROT.Color.toHex(ROT.Color.multiply([0,128,0], [20, 100, 15])),
    passable: true,
    blocksLight: false,
    desc: 'grass'
});
Game.Tile.water = new Game.Tile({
    chr: '~',
    fg: 'rgb(0, 0, 160)',
    dfg: ROT.Color.toHex(ROT.Color.multiply([0,0,160], [20, 100, 100])),
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

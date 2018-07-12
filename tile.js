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
Game.Tile.stoneWall = new Game.Tile({
    chr: '#',
    fg: 'rgb(96,96,96)',
    dfg: ROT.Color.toHex(ROT.Color.multiply([96,96,96], [80, 80, 80])),
    passable: false,
    blocksLight: true,
    desc: 'a stone wall'
});
Game.Tile.stoneFloor = new Game.Tile({
    chr: '.',
    fg: 'rgb(90,90,90)',
    dfg: ROT.Color.toHex(ROT.Color.multiply([90,90,90], [80, 80, 80])),
    passable: true,
    blocksLight: false,
    desc: 'stone floor'
});
Game.Tile.stairDown = new Game.Tile({
    chr: '>',
    fg: 'rgb(120,120,120)',
    dfg: ROT.Color.toHex(ROT.Color.multiply([120,120,120], [80, 80, 80])),
    passable: true,
    blocksLight: false,
    desc: 'descending stairs'
});
Game.Tile.stairUp = new Game.Tile({
    chr: '<',
    fg: 'rgb(120,120,120)',
    dfg: ROT.Color.toHex(ROT.Color.multiply([120,120,120], [80, 80, 80])),
    passable: true,
    blocksLight: false,
    desc: 'ascending stairs'
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
Game.Tile.magicBarrier = new Game.Tile({
    chr: '#',
    fg: 'rgb(127,0,255)',
    dfg: ROT.Color.toHex(ROT.Color.multiply([96,96,96], [80, 80, 80])),
    passable: false,
    blocksLight: false,
    desc: 'a magic barrier'
});


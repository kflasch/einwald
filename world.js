Game.World = function() {

    this._name = 'Generic World';
    
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

Game.Quest = function() {

    this._name = 'Generic Quest';
    this._success = 0;
    
};

Game.KillQuest = function() {

    Game.Quest.call(this);

    this._target = Game.EntityRepository.createRandom();      
};

Game.KillQuest.extend(Game.Quest);


Game.GetQuest = function() {

    Game.Quest.call(this);

    this._target = Game.ItemRepository.createRandom();      
};

Game.GetQuest.extend(Game.Quest);

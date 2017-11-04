Game.World = function(player) {

    this._name = 'Einwald World';
    
    this._zones = [];
    
    var fzone = new Game.Zone.Forest(this._getNewTiles(), player);
    this._zones.push(fzone);
    fzone._id = 0;

};

Game.World.prototype._getNewTiles = function() {
    // initialize nested array
    var tiles = [];
    for (var x=0; x < Game.mapWidth; x++) {
        tiles[x] = [];
        for (var y=0; y < Game.mapHeight; y++) {
            tiles[x][y] = Game.Tile.nullTile;
        }
    }
    return tiles;
};

Game.World.prototype.generateNewZone = function(name, fromZoneID, x, y) {

    if (!Game.Zone[name]) {
        console.log("No such zone type: " + name);
        return undefined;
    }
    
    var newZone = new Game.Zone[name](this._getNewTiles());
    var newID = this._zones.push(newZone) - 1;
    newZone._id = newID;
    newZone.addConnection(x, y, Game.Tile.stairUp, fromZoneID);
    return newID;    
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

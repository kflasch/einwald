Game.Entity = function(properties) {
    properties = properties || {};

    Game.DynamicGlyph.call(this, properties);

    this._x = properties['x'] || 0;
    this._y = properties['y'] || 0;

    this._zone = null;
    this._alive = true;

};

Game.Entity.extend(Game.DynamicGlyph);

Game.Entity.prototype.tryMove = function(x, y, zone) {
};

// mixins

Game.EntityMixins = {};

Game.EntityMixins.PlayerActor = {
    name: 'PlayerActor',
    groupName: 'Actor',
    act: function() {
        Game.engine.lock();
        window.addEventListener("keydown", this);
    },
    handleEvent:  function(e) {
        var keyMap = {};
        keyMap[38] = 0;
        keyMap[33] = 1;
        keyMap[39] = 2;
        keyMap[34] = 3;
        keyMap[40] = 4;
        keyMap[35] = 5;
        keyMap[37] = 6;
        keyMap[36] = 7;

        var code = e.keyCode;
        if (!(code in keyMap)) { return; }

        Game.turns++;

        var dir = ROT.DIRS[8][keyMap[code]];
        var newX = this._x + dir[0];
        var newY = this._y + dir[1];
        var eventDesc = '';
        
        if (Game._isPassable(newX, newY)) {
            var glyph = Game.zone._tiles[this._x][this._y]._glyph;
            this._x = newX;
            this._y = newY;
            Game.message = 'You pass through ' + Game.zone._tiles[newX][newY]._desc + '.';
        } else {
            if (Game.zone._tiles[newX] === undefined ||
                Game.zone._tiles[newX][newY] === undefined) {
                Game.message = 'You cannot pass this way.';
            } else {
                Game.message = (Game.zone._tiles[newX][newY]._desc || 'Something') + ' is in the way.';
                Game.message = Game.message.capitalize();
            }
        }

        Game.refresh();
        
        window.removeEventListener("keydown", this);
        Game.engine.unlock();
    },
    draw: function() {
        Game.display.draw(this._x, this._y, "@", "#ff0");
    }

};


// entities

Game.PlayerTemplate = {
    name: 'player',
    character: '@',
    foreground: '#ff0',
    mixins: [Game.EntityMixins.PlayerActor]
};

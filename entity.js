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
    var tile = zone.getTile(x, y);
    if (tile._passable) {
        this._x = x;
        this._y = y;
        Game.message = 'You pass through ' + tile._desc + '.';
    } else {
        if (tile == Tile.nullTile) {
            Game.message = "You cannot pass this way.";
        } else {
            Game.message = (tile._desc || 'Something') + ' is in the way.';
            Game.message = Game.message.capitalize();
        }
    }
};

// mixins

Game.EntityMixins = {};

Game.EntityMixins.PlayerActor = {
    name: 'PlayerActor',
    groupName: 'Actor',
    act: function() {
        Game.turns++;
        Game.refresh();
        Game.engine.lock();
    },
    draw: function() {
        Game.display.draw(this._x, this._y, "@", "#ff0");
    }

};

Game.EntityMixins.InventoryHolder = {
    name: 'InventoryHolder',
    init: function(template) {
        this._items = new Array(10);
    },
    getItems: function() {
        return this._items;
    },
    getItem: function(i) {
        return this._items[i];
    },
    addItem: function(item) {
        //this._items.find(function (a) {
        //    return a === undefined;
        //});
        for (var i = 0; i < this._items.length; i++) {
            if (!this._items[i]) {
                this._items[i] = item;
                return true;
            }
        }
        return false;
    },
    pickupItems: function() {
        var zoneItems = this._zone.getItemsAt(this._x, this._y);
        
        if (this.addItem(zoneItems[0])) {
            zoneItems.splice([0], 1);
        } else {
            return false;
        }

        this._zone.setItemsAt(this._x, this._y, zoneItems);
        return true;
    }
};


// entities

Game.PlayerTemplate = {
    name: 'player',
    character: '@',
    foreground: '#ff0',
    mixins: [Game.EntityMixins.PlayerActor,
             Game.EntityMixins.InventoryHolder]
};

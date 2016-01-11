Game.Entity = function(properties) {
    properties = properties || {};

    Game.DynamicGlyph.call(this, properties);

    this._x = properties['x'] || 0;
    this._y = properties['y'] || 0;
    this._sightRadius = properties['sightRadius'] || 0;

    this._zone = null;
    this._alive = true;

};

Game.Entity.extend(Game.DynamicGlyph);

Game.Entity.prototype.setPosition = function(x, y) {
    var oldX = this._x;
    var oldY = this._y;

    this._x = x;
    this._y = y;

    if (this._zone)
        this._zone.updateEntityPosition(this, oldX, oldY);
};

// todo: combine player with entities, zone arg?
Game.Entity.prototype.tryMove = function(x, y, zone) {
    var tile = this._zone.getTile(x, y);
    var isPlayer = this.hasMixin(Game.EntityMixins.PlayerActor);
    var descMsg = null;
    var target = this._zone.getEntityAt(x, y);
    if (target) {
        if (isPlayer) {
            descMsg = "You touch " + target._name + ".";
        }
    } else if (tile._passable) {
        this.setPosition(x, y);

        var items = this._zone.getItemsAt(x, y);
        if (items) {
            if (items.length === 1) {
                descMsg = "You see a " + items[0].describe() + ".";
            } else {
                descMsg = "You see several objects here.";
            }
        } else {
             descMsg = 'You pass through ' + tile._desc + '.';
        }
    } else {
        if (tile == Game.Tile.nullTile) {
             descMsg = "You cannot pass this way.";
        } else {
             descMsg = (tile._desc || 'Something') + ' is in the way.';
             descMsg = descMsg.capitalize();
        }
    }
    if (isPlayer && descMsg)
        Game.UI.addMessage(descMsg);
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
    removeItem: function(i) {
        // TODO: unequip/etc
        this._items[i] = null;
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
    },
    pickupItems: function(indices) {
        var zoneItems = this._zone.getItemsAt(this._x, this._y);
        var added = 0;
        for (var i=0; i < indices.length; i++) {
            // need to modify index since splice removes element from zoneItems
            if (this.addItem(zoneItems[indices[i] - added])) {
                zoneItems.splice(indices[i] - added, 1);
                added++;
            } else {
                // can't pick up item
                console.log("can't pick up item");
                break;
            }
        }
        this._zone.setItemsAt(this._x, this._y, zoneItems);
        return added === indices.length;
    },
    dropItems: function(indices) {
        for (var i=0; i < indices.length; i++) {
            if (this._items[i]) {
                if (this._zone)
                    this._zone.addItem(this._x, this._y, this._items[i]);
                this.removeItem(i);
            }
        }
    }
};

Game.EntityMixins.TaskActor = {
    name: 'TaskActor',
    groupName: 'Actor',
    init: function(template) {
        this._tasks = template['tasks'] || ['wander'];
    },
    act: function() {
        for (var i = 0; i < this._tasks.length; i++) {
            if (this.canDoTask(this._tasks[i])) {
                this[this._tasks[i]]();
                return;
            }
        }
    },
    canDoTask: function(task) {
        return true;
    },
    wander: function() {
        var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
        if (Math.round(Math.random()) === 1) {
            this.tryMove(this._x + moveOffset, this._y);
        } else {
            this.tryMove(this._x, this._y + moveOffset);
        }
    }
};

Game.EntityMixins.Killable = {
    name: 'Killable',
    init: function(template) {
        this._maxHP = template['maxHP'] || 10;
        this._hp = template['hp'] || this._maxHP;
    }
};

Game.EntityMixins.ExperienceGainer = {
    name: 'ExperienceGainer',
    init: function(template) {
        this._level = template['level'] || 1;
        this._xp = template['xp'] || 0;
    }
};

// entities

Game.PlayerTemplate = {
    name: 'player',
    chr: '@',
    fg: '#ff0',
    sightRadius: 6,
    mixins: [Game.EntityMixins.PlayerActor,
             Game.EntityMixins.Killable,
             Game.EntityMixins.ExperienceGainer,
             Game.EntityMixins.InventoryHolder]
};


Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('sb', {
    name: 'sb',
    chr: 's',
    fg: 'red',
    sightRadius: 6,
    mixins: [Game.EntityMixins.TaskActor]
});

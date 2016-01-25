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
        if (this.hasMixin('Attacker')) {
            if (this.isHostile(target)) {
                this.attack(target);
                return true;
            } else {
                descMsg = target.getName() + " is in the way.";
            }
        }
    } else if (tile._passable) {
        this.setPosition(x, y);

        var items = this._zone.getItemsAt(x, y);
        if (items) {
            if (items.length === 1) {
                descMsg = "You see a " + items[0].getName() + ".";
            } else {
                descMsg = "You see several objects here.";
            }
        } else {
             //descMsg = 'You pass through ' + tile._desc + '.';
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

Game.Entity.prototype.isHostile = function(target) {
    var isPlayer = this.hasMixin(Game.EntityMixins.PlayerActor);
    if (isPlayer || target.hasMixin(Game.EntityMixins.PlayerActor))
        return true;
    else return false;
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
        // if item is equippable, make sure it is unequipped before dropping
        if (this._items[i] && this.hasMixin(Game.EntityMixins.Equipper))
            this.unequip(this._items[i]);
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
        var removed = 0;
        var itemName = "";
        for (var i=0; i < indices.length; i++) {
            if (this._items[indices[i]]) {
                if (this._zone)
                    this._zone.addItem(this._x, this._y, this._items[indices[i]]);
                itemName = this._items[indices[i]].getName();
                this.removeItem(indices[i]);
                removed++;
            }
        }
        if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
            if (removed === 1) {
                Game.UI.addMessage("You dropped a " + itemName + ".");
            } else if (removed > 1) {
                Game.UI.addMessage("You dropped " + removed + " items.");
            } else {
                Game.UI.addMessage("You don't drop anything.");
            }
        }
    },
    dropItem: function(i) {
        if (this._items[i]) {
            var itemName = this._items[i].getName();
            if (this._zone)
                this._zone.addItem(this._x, this._y, this._items[i]);
            this.removeItem(i);
            if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
                Game.UI.addMessage("You dropped a " + itemName + ".");
            }
        }
    },
    getInvSize: function() {
        var count = 0;
        for (var i=0; i < this._items.length; i++) {
            if (this._items[i])
                count++;
        }
        return count;
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
        this._defenseValue = template['defenseValue'] || 0;
    },
    modifyHP: function(thing, delta) {
        this._hp += delta;
        if (this._hp > this._maxHP) {
            this._hp = this._maxHP;
        } else if (this._hp <= 0) {
            // entity has died
        }
    },
    getDefenseValue: function() {
        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getArmor()) {
                return this.getArmor().getDefenseValue();
            }
        }
        return this._defenseValue;
    }
};

Game.EntityMixins.ExperienceGainer = {
    name: 'ExperienceGainer',
    init: function(template) {
        this._level = template['level'] || 1;
        this._xp = template['xp'] || 0;
    }
};

Game.EntityMixins.Equipper = {
    name: 'Equipper',
    init: function(template) {
        this._armor = null;
        this._handOne = null;
        this._handTwo = null;
    },
    wield: function(item) {
        this._handOne = item;
    },
    unwield: function() {
        this._handOne = null;        
    },
    wear: function(item) {
        this._armor = item;
    },
    takeOff: function() {
        this._armor = null;
    },
    getWeapon: function() {
        return this._handOne;
    },
    getArmor: function() {
        return this._armor;
    },
    unequip: function(item) {
        if (this._handOne === item) {
            this.unwield();
        } else if (this._armor === item) {
            this.takeOff();
        }
    },
    isEquipped: function(item) {
        if (this._armor === item)
            return true;
        if (this._handOne === item)
            return true;
        return false;
    }
};

Game.EntityMixins.Attacker = {
    name: 'Attacker',
    groupName: 'Attacker',
    init: function(template) {
        this._attackValue = template['attackValue'] || 1;
    },
    getAttackValue: function() {
        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getWeapon()) {
                console.log(this.getWeapon());
                return this.getWeapon().getAttackValue();
            }
        }
        return this._attackValue;
    },
    attack: function(target) {
        if (target.hasMixin('Killable')) {
            var attVal = this.getAttackValue();
            var defVal = target.getDefenseValue();
            var max = Math.max(0, attVal - defVal);
            var damage = 1 + Math.floor(Math.random() * max);

            if (this.hasMixin('PlayerActor')) {
                Game.UI.addMessage("You strike the " + target.getName()
                                   + " for " + damage + " damage!");
            } else {
                Game.UI.addMessage("The " + target.getName() + " strikes you for "
                                   + damage + " damage!");
            }

            target.modifyHP(this, damage);
        }
    }
};

// entities

Game.PlayerTemplate = {
    name: 'player',
    chr: '@',
    fg: '#ffa',
    sightRadius: 6,
    hp: 7,
    mixins: [Game.EntityMixins.PlayerActor,
             Game.EntityMixins.Equipper,
             Game.EntityMixins.Killable,
             Game.EntityMixins.Attacker,
             Game.EntityMixins.ExperienceGainer,
             Game.EntityMixins.InventoryHolder]
};


Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('spider', {
    name: 'spider',
    chr: 's',
    fg: 'brown',
    sightRadius: 6,
    mixins: [Game.EntityMixins.TaskActor,
             Game.EntityMixins.Killable]
});

Game.EntityRepository.define('wolf', {
    name: 'wolf',
    chr: 'w',
    fg: 'grey',
    sightRadius: 6,
    mixins: [Game.EntityMixins.TaskActor,
             Game.EntityMixins.Killable]
});

Game.EntityRepository.define('wanderer', {
    name: 'wanderer',
    chr: '@',
    fg: '#ff0',
    sightRadius: 6,
    mixins: [Game.EntityMixins.TaskActor,
             Game.EntityMixins.Killable,
             Game.EntityMixins.Equipper]
});

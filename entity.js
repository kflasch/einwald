Game.Entity = function Entity(properties) {
    properties = properties || {};

    Game.DynamicGlyph.call(this, properties);
    this._templateName = properties['templateName'] || '';
    this._x = properties['x'] || 0;
    this._y = properties['y'] || 0;
    this._sightRadius = properties['sightRadius'] || 0;

    this._zone = null;
    this._alive = true;
};

Game.Entity.extend(Game.DynamicGlyph);

Game.Entity.prototype.setPosition = function(x, y, zone) {
    var oldX = this._x;
    var oldY = this._y;

    this._x = x;
    this._y = y;
    zone.updateEntityPosition(this, oldX, oldY);
};

// todo: combine player with entities, zone arg?
Game.Entity.prototype.tryMove = function(x, y, zone) {
    var tile = zone.getTile(x, y);
    var isPlayer = this.hasMixin(Game.EntityMixins.PlayerActor);
    var descMsg = null;
    var target = zone.getEntityAt(x, y);
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
        this.setPosition(x, y, zone);

        var items = zone.getItemsAt(x, y);
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
        // win condition!
        if (isPlayer && zone._id === 0 && x === -1) {
            Game.wonGame();
            return undefined;
        } if (tile == Game.Tile.nullTile) {
             descMsg = "You cannot pass this way.";
        } else {
             descMsg = (tile._desc || 'Something') + ' is in the way.';
             descMsg = descMsg.capitalize();
        }
    }
    if (isPlayer && descMsg)
        Game.UI.addMessage(descMsg);
};

// TODO: clean this function up
Game.Entity.prototype.changeZone = function() {
    var tile = this._zone.getTile(this._x, this._y);
    var key = this._x + ',' + this._y;
    var zoneVal = this._zone._connections[key];
    if (typeof zoneVal != 'undefined') {
        if (this._zone._entities[key] == this) {
            delete this._zone._entities[key];
        } else {
            console.log("Error: cannot remove entity from current zone.");
            return undefined;
        }
        if (Number.isInteger(zoneVal)) {
            var entranceKey = Game.world._zones[zoneVal].getConnectionForZone(this._zone._id);
            this._x = Number(entranceKey.split(',')[0]);
            this._y = Number(entranceKey.split(',')[1]);
            Game.world._zones[zoneVal].updateEntityPosition(this);
            this._zone = Game.world._zones[zoneVal];
            if (this._zone._isMultiLevel)
                Game.UI.addMessage("You enter the " + this._zone._name.toLowerCase()
                                   + ", depth " + this._zone._depth + ".");
            else
                Game.UI.addMessage("You enter the " + this._zone._name.toLowerCase() + ".");                
            return zoneVal;
        } else {
            var newZoneID = Game.world.generateNewZone(zoneVal, this._zone._id);
            this._zone._connections[key] = newZoneID;
            var entranceKeyNew = Game.world._zones[newZoneID].getConnectionForZone(this._zone._id);
            var oldX = this._x;
            var oldY = this._y;
            this._x = Number(entranceKeyNew.split(',')[0]);
            this._y = Number(entranceKeyNew.split(',')[1]);
            Game.world._zones[newZoneID].updateEntityPosition(this, oldX, oldY);
            this._zone = Game.world._zones[newZoneID];
            if (this._zone._isMultiLevel)
                Game.UI.addMessage("You enter the " + this._zone._name.toLowerCase()
                                   + ", depth " + this._zone._depth + ".");
            else
                Game.UI.addMessage("You enter the " + this._zone._name.toLowerCase() + ".");
            return newZoneID;
        }
    } else {
        Game.UI.addMessage("You can't go there.");
        return undefined;
    }
};

Game.Entity.prototype.kill = function(message, zone) {
    if (!this._alive) {
        console.log("tried to kill already dead entity " + this);
        return;
    }

    this._alive = false;

    if (this.hasMixin(Game.EntityMixins.PlayerActor)) {
        // player died
        if (message == null)
            message = "You have died!";
        Game.UI.addMessage(message);
    } else {
        zone.removeEntity(this);
    }
};

Game.Entity.prototype.isHostile = function(target) {
    var isPlayer = this.hasMixin(Game.EntityMixins.PlayerActor);
    if (isPlayer || target.hasMixin(Game.EntityMixins.PlayerActor))
        return true;
    else return false;
};

Game.Entity.prototype.exportToString = function() {    
    function replacer(key, value) {
        if (key === '_zone') {
            return undefined;
        }
        return value;
    };

    return JSON.stringify(this, replacer);
};

Game.Entity.prototype.exportToStringOld = function() {
    var proplist = [];
    for (var key in this) {
        if (typeof key !== 'function' && typeof this[key] !== 'function') {
            if (typeof this[key] === 'object') {
                if (key !== '_zone') 
                    proplist.push('"'+key+'":' + JSON.stringify(this[key]));
            } else {
                proplist.push('"'+key+'":' + '"'+this[key]+'"');
            }
        }        
    }
    return "{" + proplist.toString() + "}";    
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
        this._items = template['items'] || new Array(10);
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
            this.unequip(i);
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
        if (task === 'hunt') {
            // entities will only hunt player 
            return this.hasMixin('Sight') && this.canSee(Game.player);
        } else if (task === 'wander') {
            return true;
        } else {
            throw new Error('Tried to perform undefined task ' + task);
        }
    },
    wander: function() {
        var moveOffset = (Math.round(Math.random()) === 1) ? 1 : -1;
        if (Math.round(Math.random()) === 1) {
            this.tryMove(this._x + moveOffset, this._y, this._zone);
        } else {
            this.tryMove(this._x, this._y + moveOffset, this._zone);
        }
    },
    hunt: function() {
        // TODO: extend this to allow non-players to be hunted
        var target = Game.player;
//        console.log(this._name + ' hunting ' + target._name);
        
        // check adjacent
        // TODO: fix diagonal offset
        var offset = Math.abs(target._x - this._x)
            + Math.abs(target._y - this._y);
//        console.log(offset);
        if (offset === 1) {
            if (this.hasMixin('Attacker')) {
                this.attack(target);
                return;
            }
        }

        // gen path towards target and move
        var source = this;
        var path = new ROT.Path.AStar(target._x, target._y, function(x, y) {
            // if another (non-target) entity is in the way, can't move there
            var entity = source._zone.getEntityAt(x, y);
            if (entity && entity !== target && entity !== source)
                return false;
            return source._zone.getTile(x, y)._passable;            
        });

        var count = 0;
        path.compute(source._x, source._y, function(x, y) {
            if (count == 1)
                source.tryMove(x, y, source._zone);
            count++;
        });
    }
};

Game.EntityMixins.Sight = {
    name: 'Sight',
    groupName: 'Sight',
    init: function(template) {
        this._sightRadius = template['sightRadius'] || 5;
    },
    getSightRadius: function() {
        return this._sightRadius;
    },
    canSee: function(entity) {
        // check if entity exists or is in the same zone
        if (!entity || this._zone !== entity._zone) {
            return false;
        }

        var entX = entity._x;
        var entY = entity._y;

        // check if within the bounds of the fov square
        if ((entX - this._x) * (entX - this._x) +
            (entY - this._y) * (entY - this._y) >
            this._sightRadius * this._sightRadius) {
            return false;
        }

        // compute fov and see if entity's coords are within it
        var found = false;
        this._zone._fov.compute(
            this._x, this._y, this._sightRadius,
            function(x, y, radius, visibility) {
                if (x === entX && y === entY)
                    found = true;
            }
        );
        return found;
    }
};


Game.EntityMixins.Killable = {
    name: 'Killable',
    init: function(template) {
        this._maxHP = template['maxHP'] || 10;
        this._hp = template['hp'] || this._maxHP;
        this._defenseValue = template['defenseValue'] || 0;
    },
    // agent is the object that changed hp
    modifyHP: function(agent, delta) {
        this._hp += delta;
        if (this._hp > this._maxHP) {
            this._hp = this._maxHP;
        } else if (this._hp <= 0) {
            this.raiseEvent('onDeath', agent);
            agent.raiseEvent('onKill', this);
            this.kill(null, this._zone);
            /*
            if (this.hasMixin('PlayerActor')) {
                // player has died
                Game.UI.addMessage("You've died...");
            } else if (agent.hasMixin('PlayerActor')) {
                // player has killed entity
            }
            */
        }
    },
    getDefenseValue: function() {
        var def = 0;
        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getArmor()) {
                def = this.getArmor().getDefenseValue();
            }
        }
        return def + this._defenseValue;
    }
};

Game.EntityMixins.ExperienceGainer = {
    name: 'ExperienceGainer',
    init: function(template) {
        this._level = template['level'] || 1;
        this._xp = template['xp'] || 0;
    },
    getNextLevelExperience: function() {
        return this._level * this._level * 10;
    },
    giveExperience: function(xp) {
        var levelsGained = 0;
        var pointsGained = 0;
        var hpGained = 0;
        // loop through xp gained to level up, possibly multiple times if enough xp
        while (xp > 0) {            
            if (this._xp + xp >= this.getNextLevelExperience()) {
                var usedXP = this.getNextLevelExperience() - this._xp;
                xp = xp - usedXP;
                this._xp += usedXP;
                this._level++;
                levelsGained++;
                this._attackValue++;
                this._defenseValue++;
                this._maxHP += 5;
                this._hp = this._maxHP;
                pointsGained++;
                hpGained += 5;
            } else {
                this._xp += xp;
                xp = 0;
            }
        }
        if (levelsGained > 0) {
            Game.UI.addMessage("You advance to level " + this._level + "! "
                               + "You gained " + pointsGained + " attack and defense points "
                               + " and " + hpGained + " HP.");
        }
    },
    listeners: {
        onKill: function(victim) {
            var xp = 1;
            xp += victim.getDefenseValue();
            if (victim.hasMixin('Attacker'))
                xp += victim.getAttackValue();
            if (xp > 0)
                this.giveExperience(xp);           
        }
    }

};

Game.EntityMixins.CorpseDropper = {
    name: 'CorpseDropper',
    init: function(template) {
        // Chance of dropping a cropse (out of 100).
        this._corpseDropRate = template['corpseDropRate'] || 100;
    },
    listeners: {
        onDeath: function(attacker) {
            // Check if we should drop a corpse.
            if (Math.round(Math.random() * 100) <= this._corpseDropRate) {
                this._zone.addItem(this._x, this._y,
                    Game.ItemRepository.create('corpse', {
                        name: this._name + ' corpse',
                        fg: this._foreground
                    }));
            }    
        }
    }
};

Game.EntityMixins.Equipper = {
    name: 'Equipper',
    init: function(template) {
        this._armor = null;
        this._handOne = null;
        this._handTwo = null;
    },
    wield: function(i) {
        this._handOne = i;
    },
    unwield: function() {
        this._handOne = null;        
    },
    wear: function(i) {
        this._armor = i;
    },
    takeOff: function() {
        this._armor = null;
    },
    getWeapon: function() {
        if (this._items)
            return this._items[this._handOne];
        else
            return null;
    },
    getArmor: function() {
        if (this._items)
            return this._items[this._armor];
        else
            return null;
    },
    unequip: function(i) {
        if (this._handOne == i) {
            this.unwield();
            if (this.hasMixin('PlayerActor'))
                Game.UI.addMessage("You unequip your " + this._items[i]._name + ".");
            else
                Game.UI.addMessage(this._name + " unequips their " + this._items[i]._name + ".");
        } else if (this._armor == i) {
            this.takeOff();
            if (this.hasMixin('PlayerActor'))
                Game.UI.addMessage("You remove your " + this._items[i]._name + ".");
            else
                Game.UI.addMessage(this._name + " removes their " + this._items[i]._name + ".");
        }
    },
    equip: function(i) {
        if (this._items[i]._wearable) {
            this.wear(i);
            if (this.hasMixin('PlayerActor'))
                Game.UI.addMessage("You wear the " + this._items[i]._name + ".");
            else
                Game.UI.addMessage(this._name + " puts on " + this._items[i]._name + ".");
        } else if (this._items[i]._wieldable) {
            this.wield(i);
            if (this.hasMixin('PlayerActor'))
                Game.UI.addMessage("You wield the " + this._items[i]._name + ".");
            else
                Game.UI.addMessage(this._name + " wields their " + this._items[i]._name + ".");
        }
    },

    isEquipped: function(i) {
        if (this._armor == i)
            return true;
        if (this._handOne == i)
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
        var att = 0;
        if (this.hasMixin(Game.EntityMixins.Equipper)) {
            if (this.getWeapon()) {
                att = this.getWeapon().getAttackValue();
            }
        }
        return att + this._attackValue;
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
                Game.UI.addMessage("The " + this.getName() + " strikes you for "
                                   + damage + " damage!");
            }

            target.modifyHP(this, -damage);
        }
    }
};

// entities

Game.PlayerTemplate = {
    name: 'player',
    chr: '@',
    fg: '#ffa',
    sightRadius: 6,
    hp: 10,
    maxHP: 10,
    attackValue: 1,
    defenseValue: 1,
    mixins: [Game.EntityMixins.PlayerActor,
             Game.EntityMixins.Sight,
             Game.EntityMixins.Equipper,
             Game.EntityMixins.Killable,
             Game.EntityMixins.Attacker,
             Game.EntityMixins.ExperienceGainer,
             Game.EntityMixins.InventoryHolder]
};


Game.EntityRepository = new Game.Repository('entities', Game.Entity);

Game.EntityRepository.define('spider', {
    name: 'giant spider',
    chr: 's',
    fg: 'brown',
    sightRadius: 6,
    maxHP: 3,
    attackValue: 1,
    defenseValue: 1,
    mixins: [Game.EntityMixins.TaskActor,
             Game.EntityMixins.Sight,
             Game.EntityMixins.Killable,
             Game.EntityMixins.Attacker,
             Game.EntityMixins.CorpseDropper]
});

Game.EntityRepository.define('wolf', {
    name: 'wolf',
    chr: 'w',
    fg: 'grey',
    sightRadius: 6,
    maxHP: 5,
    attackValue: 2,
    defenseValue: 1,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor,
             Game.EntityMixins.Sight,
             Game.EntityMixins.Killable,
             Game.EntityMixins.Attacker,
             Game.EntityMixins.CorpseDropper]
});

Game.EntityRepository.define('wanderer', {
    name: 'wanderer',
    chr: '@',
    fg: '#ff0',
    sightRadius: 6,
    maxHP: 10,
    attackValue: 2,
    defenseValue: 2,
    mixins: [Game.EntityMixins.TaskActor,
             Game.EntityMixins.Sight,
             Game.EntityMixins.Killable,
             Game.EntityMixins.Attacker,
             Game.EntityMixins.CorpseDropper,
             Game.EntityMixins.Equipper]
});

Game.EntityRepository.define('skeleton', {
    name: 'skeleton',
    chr: 'S',
    fg: 'white',
    sightRadius: 6,
    maxHP: 12,
    attackValue: 3,
    defenseValue: 3,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor,
             Game.EntityMixins.Sight,
             Game.EntityMixins.Killable,
             Game.EntityMixins.Attacker,
             Game.EntityMixins.CorpseDropper,
             Game.EntityMixins.Equipper]
});

Game.EntityRepository.define('lich', {
    name: 'lich',
    chr: 'L',
    fg: 'white',
    sightRadius: 8,
    maxHP: 30,
    attackValue: 6,
    defenseValue: 10,
    tasks: ['hunt', 'wander'],
    mixins: [Game.EntityMixins.TaskActor,
             Game.EntityMixins.Sight,
             Game.EntityMixins.Killable,
             Game.EntityMixins.Attacker,
             Game.EntityMixins.CorpseDropper,
             Game.EntityMixins.Equipper]
});

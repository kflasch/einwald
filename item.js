Game.Item = function(properties) {
    properties = properties || {};
    
    Game.DynamicGlyph.call(this, properties);
    this._templateName = properties['templateName'] || '';
    this._passable = properties['passable'] || true;
    this._name = properties['name'] || '';
    this._desc = properties['desc'] || '';
    this._foundIn = properties['foundIn'] || [];

    this._x = null;
    this._y = null;
};

Game.Item.extend(Game.DynamicGlyph);

Game.Item.prototype.getName = function() {
    return this._name;
};

// item mixins

Game.ItemMixins = {};

Game.ItemMixins.Edible = {
    name: 'Edible',
    init: function(template) {
        this.foodVal = template['foodVal'] || 0;
        this.hpVal = template['hpVal'] || 0;
    },
    eat: function(entity, invIndex) {
        if (entity.hasMixin('Killable')) {
            entity.modifyHP(this, this.hpVal);
        }
        entity.removeItem(invIndex);
    }
};

Game.ItemMixins.Drinkable = {
    name: 'Drinkable',
    init: function(template) {
        this.type = template['type'] || 0;
        this.value = template['value'] || 1;
        this.duration = template['duration'] || 10;
    },
    drink: function(entity, invIndex) {
        if (entity.hasMixin('Effectable')) {
            entity.addEffect(this.type, this.value, this.duration);
        }
        entity.removeItem(invIndex);
    }
};

Game.ItemMixins.Equippable = {
    name: 'Equippable',
    init: function(template) {
        this._attackVal = template['attackVal'] || 0;
        this._defenseVal = template['defenseVal'] || 0;
        this._wieldable = template['wieldable'] || false;
        this._wearable = template['wearable'] || false;        
    },
    getAttackValue: function() {
        return this._attackVal;
    },
    getDefenseValue: function() {
        return this._defenseVal;
    }
};

Game.ItemMixins.Throwable = {
    name: 'Throwable',
    init: function(template) {
    }
};


// item repo & definitions

Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.ItemRepository.define('smallrock', {
    name: 'small rock',
    chr: '*',
    fg: 'gray',
    desc: 'A small, sharp rock.',
    foundIn: ['Forest', 'Crypt'],
    mixins: [Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('book', {
    name: 'book',
    chr: '+',
    fg: 'brown',
    desc: 'A worn leather-bound tome with strange symbols on the cover.',
    foundIn: [],
    mixins: [Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('mushroom', {
    name: 'mushroom',
    chr: '\,',
    fg: 'darkkhaki',
    foodVal: 1,
    hpVal: 2,
    desc: 'A small, wild mushroom.',
    foundIn: ['Forest', 'Crypt'],
    mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('healingherb', {
    name: 'healing herb',
    chr: '%,',
    fg: 'green',
    foodVal: 0,
    hpVal: 2,
    desc: 'A small green herb with medicinal properties.',
    foundIn: ['Forest'],
    mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('defensepotion', {
    name: 'potion of defense',
    chr: '!,',
    fg: 'blue',
    type: 'defense',
    duration: 10,
    value: 4,
    desc: 'A potion that will temporarily bolster your defense.',
    mixins: [Game.ItemMixins.Drinkable]
});

Game.ItemRepository.define('attackpotion', {
    name: 'potion of attack',
    chr: '!,',
    fg: 'red',
    type: 'attack',
    duration: 10,
    value: 3,
    desc: 'A potion that will temporarily bolster your attack power.',
    mixins: [Game.ItemMixins.Drinkable]
});

Game.ItemRepository.define('dagger', {
    name: 'dagger',
    chr: ')',
    fg: 'grey',
    wieldable: true,
    attackVal: 1,
    desc: 'A well-balanced iron dagger.',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, { disableRandomCreation: true });

Game.ItemRepository.define('shortsword', {
    name: 'shortsword',
    chr: ')',
    fg: 'grey',
    wieldable: true,
    attackVal: 2,
    desc: 'A short sword.',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, { disableRandomCreation: true });

Game.ItemRepository.define('traveleroutfit', {
    name: 'traveler outfit',
    chr: '[',
    fg: 'orange',
    wearable: true,
    defenseVal: 1,
    desc: 'Common traveler outfit.',
    mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

Game.ItemRepository.define('leatherarmor', {
    name: 'leather armor',
    chr: '[',
    fg: 'brown',
    wearable: true,
    defenseVal: 2,
    desc: 'Leather armor.',
    mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

Game.ItemRepository.define('chainmail', {
    name: 'chain mail',
    chr: '[',
    fg: 'silver',
    wearable: true,
    defenseVal: 3,
    desc: 'Chain mail.',
    mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });


Game.ItemRepository.define('corpse', {
    name: 'corpse',
    chr: '%',
    foodValue: 75,
    consumptions: 1,
    mixins: [Game.ItemMixins.Edible]
}, { disableRandomCreation: true });

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
    foundIn: ['Forest', 'Crypt'],
    mixins: [Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('book', {
    name: 'book',
    chr: '+',
    fg: 'brown',
    foundIn: [],
    mixins: [Game.ItemMixins.Throwable]
});

Game.ItemRepository.define('mushroom', {
    name: 'mushroom',
    chr: '\,',
    fg: 'darkkhaki',
    foodVal: 1,
    hpVal: 2,
    foundIn: ['Forest', 'Crypt'],
    mixins: [Game.ItemMixins.Edible]
});

Game.ItemRepository.define('healingherb', {
    name: 'healing herb',
    chr: '%,',
    fg: 'green',
    foodVal: 0,
    hpVal: 2,
    foundIn: ['Forest'],
    mixins: [Game.ItemMixins.Edible]
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

Game.ItemRepository.define('traveleroutfit', {
    name: 'traveler outfit',
    chr: '[',
    fg: 'brown',
    wearable: true,
    defenseVal: 1,
    desc: 'Common traveler outfit.',
    mixins: [Game.ItemMixins.Equippable, Game.ItemMixins.Throwable]
}, { disableRandomCreation: true });


Game.ItemRepository.define('corpse', {
    name: 'corpse',
    chr: '%',
    foodValue: 75,
    consumptions: 1,
    mixins: [Game.ItemMixins.Edible]
}, { disableRandomCreation: true });

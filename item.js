Game.Item = function(properties) {
    properties = properties || {};
    
    Game.DynamicGlyph.call(this, properties);
    this._passable = properties['passable'] || true;
    this._name = properties['name'] || '';

    this._x = null;
    this._y = null;
};

Game.Item.extend(Game.DynamicGlyph);

Game.Item.prototype.describe = function() {
    return this._name;
};


// item mixins

Game.ItemMixins = {};

Game.ItemMixins.Edible = {
};

Game.ItemMixins.Equippable = {
    name: 'Equippable',
    init: function(template) {
        this._attackVal = template['attackVal'] || 0;
        this._wieldable = template['wieldable'] || false;
        this._wearable = template['wearable'] || false;        
    }
};

// item repo & definitions

Game.ItemRepository = new Game.Repository('items', Game.Item);

Game.ItemRepository.define('smallrock', {
    name: 'small rock',
    chr: '*',
    fg: 'gray'
});

Game.ItemRepository.define('book', {
    name: 'book',
    chr: '+',
    fg: 'brown'
});

Game.ItemRepository.define('mushroom', {
    name: 'mushroom',
    chr: '\,',
    fg: 'darkkhaki'
});

Game.ItemRepository.define('knife', {
    name: 'knife',
    chr: ')',
    fg: 'grey',
    wieldable: true,
    mixins: [Game.ItemMixins.Equippable]
}, { disableRandomCreation: true });

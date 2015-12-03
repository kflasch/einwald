Game.Item = function(properties) {
    properties = properties || {};
    
    Game.DynamicGlyph.call(this, properties);
    this._passable = properties['passable'] || true;
    this._name = properties['name'] || '';
};

Game.Item.extend(Game.DynamicGlyph);

Game.Item.prototype.describe = function() {
    return this._name;
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


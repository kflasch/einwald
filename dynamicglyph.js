Game.DynamicGlyph = function(properties) {
    properties = properties || {};

    Game.Glyph.call(this, properties);

    this._name = properties['name'] || '';

    this._listeners = {};
};

Game.DynamicGlyph.extend(Game.Glyph);

Game.DynamicGlyph.describe = function() {
    return this._name;
};

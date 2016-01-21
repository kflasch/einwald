Game.DynamicGlyph = function(properties) {
    properties = properties || {};

    Game.Glyph.call(this, properties);

    this._name = properties['name'] || '';

    this._attachedMixins = {}; // mixins based on name
    this._attachedMixinGroups = {};
    this._listeners = {}; // callbacks

    var mixins = properties['mixins'] || [];
    for (var i = 0; i < mixins.length; i++) {
        // copy all properties from each mixin but init/name/listeners
        // and don't override an already existing property
        for (var key in mixins[i]) {
            if (key != 'init' && key != 'name' && key != 'listeners'
                && !this.hasOwnProperty(key)) {
                this[key] = mixins[i][key];
            }
        }

        this._attachedMixins[mixins[i].name] = true;

        if (mixins[i].groupName)
            this._attachedMixinGroups[mixins[i].groupName] = true;

        if (mixins[i].listeners) {
            for (var key in mixins[i].listeners) {
                if (!this._listeners[key])
                    this._listeners[key] = [];

                this._listeners[key].push(mixins[i].listeners[key]);
            }
        }

        if (mixins[i].init)
            mixins[i].init.call(this, properties);
    }
};

Game.DynamicGlyph.extend(Game.Glyph);

Game.DynamicGlyph.prototype.hasMixin = function(obj) {
    // Allow passing the mixin itself or the name / group name as a string
    if (typeof obj === 'object') {
        return this._attachedMixins[obj.name];
    } else {
        return this._attachedMixins[obj] || this._attachedMixinGroups[obj];
    }
};

Game.DynamicGlyph.prototype.getName = function() {
    return this._name;
};

Game.DynamicGlyph.prototype.raiseEvent = function(event) {
    if (!this._listeners[event])
        return null;

    var args = Array.prototype.slice.call(arguments, 1);

    var results = [];

    for (var i = 0; i < this._listeners[event].length; i++) {
        results.push(this._listeners[event][i].apply(this, args));
    }
    return results;
};

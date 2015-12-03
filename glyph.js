Game.Glyph = function(properties) {
    properties = properties || {};

    this._char = properties['chr'] || ' ';
    this._foreground = properties['fg'] || 'white';
    this._background = properties['bg'] || 'black';
};

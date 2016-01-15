Game.Dialog = function(properties) {

    properties = properties || {};
    
    this._title = properties['title'] || '';
    //this._modal = true;
    this._subwin = false;
};

Game.Dialog.prototype.show = function() {
    var elem = document.getElementById("overlay");
    elem.style.visibility = "visible";
    output = "<div id='main'>";
    output += "<span style='color:orange'>" + this._title + "</span> <br />";
    output += this.getOutput() + "</div>";
    output += "<div id='sub'>";
    output += "<span style='color:orange'>" + "---" + "</span> <br />";
    output += "</div>";
    elem.innerHTML = output;
    Game.currentDialog = this;
};

Game.Dialog.prototype.hide = function() {
    var elem = document.getElementById("overlay");
    elem.innerHTML = "";
    elem.style.visibility = "hidden";
    Game.currentDialog = null;
};

Game.Dialog.prototype.hideSub = function() {
    var elem = document.getElementById("sub");
    elem.innerHTML = "";
    elem.style.visibility = "hidden";
};

Game.Dialog.prototype.showSub = function() {
    var elem = document.getElementById("sub");
    elem.style.visibility = "visible";
};

Game.Dialog.prototype.handleInput = function(inputType, inputData) {
};

// default action for hitting enter/etc
Game.Dialog.prototype.doMainAction = function() {
    this.hide();
};

Game.Dialog.prototype.getOutput = function() {
    return "placeholder";
};


Game.Dialog.Help = function() {
    var properties = { title: 'Help' };
    Game.Dialog.call(this, properties);
};

Game.Dialog.Help.extend(Game.Dialog);

Game.Dialog.Help.prototype.getOutput = function() {
    var output = "arrow keys or numpad to move <br />";
    output += "'g' to get / pick up <br />";
    output += "'d' to drop <br />";
    output += "'i' to show inventory <br />";
    output += "'ESC' to exit screens <br />";
    return output;
};

Game.Dialog.Help.prototype.handleInput = function(inputType, inputData) {
    if (inputType === 'keydown') {
        if (inputData.keyCode === ROT.VK_ESCAPE) {
            this.hide();
        }
    } else if (inputType === 'keypress') {
        var keyChar = String.fromCharCode(inputData.charCode);
        if (keyChar === '?') {
            this.hide();
        }        
    }
};


// item dialogs

Game.Dialog.Items = function(properties, items) {
    this._selectedIndices = {};
    this._mainAction = properties['mainAction'];
    this._canSelectMultiple = properties['canSelectMultiple'];
    this._items = items;
    Game.Dialog.call(this, properties);
};

Game.Dialog.Items.extend(Game.Dialog);

Game.Dialog.Items.prototype.getOutput = function() {
    var output = this.getItemOutput();
    return output;
};

Game.Dialog.Items.prototype.getItemOutput = function() {
    var itemListText = "";
    if (this._items && this._items.length > 0) {
        for (var i = 0; i < this._items.length; i++) {
            if (this._items[i]) {
                var letter = String.fromCharCode(i+97);
                var status = "";
                var selectionState = this._selectedIndices[i] ? ' + ' : ' - ';
                var itemText = letter + selectionState + this._items[i].describe() + status;
                itemListText = itemListText + itemText + "<br />";
            }
        }
    }
    return itemListText;
};

Game.Dialog.Items.prototype.doMainAction = function() {
    var selItems = {};
    for (var key in this._selectedIndices) {
        selItems[key] = this._items[key];
    }
    this._mainAction(selItems);
};

Game.Dialog.Items.prototype.handleInput = function(inputType, inputData) {
    if (this._subwin) this.handleInputSub(inputType, inputData);
    if (inputType === 'keydown') {
        if (inputData.keyCode === ROT.VK_ESCAPE) {
            this.hide();
        } else if (inputData.keyCode >= ROT.VK_A &&
                   inputData.keyCode <= ROT.VK_Z) {
            var itemIndex = inputData.keyCode - ROT.VK_A;
            if (this._items[itemIndex]) {
                if (this._canSelectMultiple) {
                    if (this._selectedIndices[itemIndex]) {
                        delete this._selectedIndices[itemIndex];
                    } else {
                        this._selectedIndices[itemIndex] = true;
                    }
                    this.show();
                } else {
                    this._selectedIndices[itemIndex] = true;
                    this.show();
                    this.doMainAction();
                }
            }
        } else if (inputData.keyCode === ROT.VK_RETURN) {
            this.doMainAction();
        }
    }
};

// subwindow input
Game.Dialog.Items.prototype.handleInputSub = function(inputType, inputData) {
    if (inputType === 'keydown') {
        if (inputData.keyCode === ROT.VK_ESCAPE) {
            this.hide();
        } else if (inputData.keyCode >= ROT.VK_A &&
                   inputData.keyCode <= ROT.VK_Z) {
            var itemIndex = inputData.keyCode - ROT.VK_A;
            if (this._items[itemIndex]) {
                if (this._selectedIndices[itemIndex]) {
                    delete this._selectedIndices[itemIndex];
                } else {
                    this._selectedIndices[itemIndex] = true;
                }
                this.show();
            }
        } else if (inputData.keyCode === ROT.VK_RETURN) {
            this.doMainAction();
        }
    }
};

Game.Dialog.Items.prototype.showSubWin = function(item) {
    var elem = document.getElementById("sub");
    elem.style.visibility = "visible";

};

/*
Game.Dialog.invDialog = new Game.Dialog.Items({
    title: 'Inventory',
    canSelectMultiple: false
});

Game.Dialog.dropDialog = new Game.Dialog.Items({
    title: 'Drop',
    mainAction: function(selItems) {
        Game.player.dropItems(Object.keys(selItems));
        this.hide();
        Game.engine.unlock();
    }
});
*/

Game.Dialog.invProp = {
    title: 'Inventory',
    canSelectMultiple: false,
    mainAction: function(selItems) {
        this._subwin = true;
        this.showSubWin(selItems[0]);
    }
};

Game.Dialog.dropProp = {
    title: 'Drop',
    canSelectMultiple: true,
    mainAction: function(selItems) {
        Game.player.dropItems(Object.keys(selItems));
        this.hide();
        Game.engine.unlock();
    }
};

Game.Dialog.pickupProp = {
    title: 'Pick Up',
    canSelectMultiple: true,
    mainAction: function(selItems) {
        Game.player.pickupItems(Object.keys(selItems));
        this.hide();
        Game.engine.unlock();
    }
};

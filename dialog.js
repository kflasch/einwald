Game.Dialog = function(properties) {

    properties = properties || {};
    
    this._title = properties['title'] || '';
    this._subwin = false;
};

Game.Dialog.prototype.show = function() {
    var elem = document.getElementById("overlay");
    elem.style.visibility = "visible";
    output = "<div id='main'>";
    output += "<span style='color:orange'>" + this._title + "</span> <br />";
    output += this.getOutput() + "</div>";
    output += "<div id='sub'>";
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


Game.Dialog.prototype.hideSubWin = function() {
    var elem = document.getElementById("sub");
    elem.innerHTML = "";
    elem.style.visibility = "hidden";
    this._subwin = false;
};

/*
Game.Dialog.prototype.showSub = function() {
    var elem = document.getElementById("sub");
    elem.style.visibility = "visible";
};
*/

Game.Dialog.prototype.handleInput = function(inputType, inputData) {
};

// default action for hitting enter/etc
Game.Dialog.prototype.doMainAction = function() {
    this.hide();
};

Game.Dialog.prototype.getOutput = function() {
    return "placeholder";
};

// help menu

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
    output += "'.' to wait a turn <br />";
    output += "'ESC' to exit screens <br />";
    return output;
    // Apply, Equip, Remove, Throw, and Drop
    
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

// main menu

Game.Dialog.MainMenu = function() {
    var properties = { title: 'Einwald' };
    Game.Dialog.call(this, properties);
};

Game.Dialog.MainMenu.extend(Game.Dialog);

Game.Dialog.MainMenu.prototype.getOutput = function() {
    var output = " <br />" ;
    output += " [<span style='color:cyan'>s</span>]tart a new game <br />";
    if (localStorage.getItem("einwald_zone"))
        output += " [<span style='color:cyan'>l</span>]oad <br />";    
    output += " <br />";
    return output;
};

Game.Dialog.MainMenu.prototype.handleInput = function(inputType, inputData) {
    if (inputType === 'keydown') {
        if (inputData.keyCode === ROT.VK_S) {
            this.hide();
            Game._startGame();
        } else if (inputData.keyCode === ROT.VK_L) {
            if (localStorage.getItem("einwald_zone")) {
                this.hide();
                Game._startGame(true);
            }
        }
    } else if (inputType === 'keypress') {
        var keyChar = String.fromCharCode(inputData.charCode);
        if (keyChar === '?') {
            //this.hide();
        }        
    }
};

// win screen
Game.Dialog.WonGame = function() {
    var properties = { title: '' };
    Game.Dialog.call(this, properties);
};

Game.Dialog.WonGame.extend(Game.Dialog);

Game.Dialog.WonGame.prototype.getOutput = function() {
    var output = " <br />" ;
    output += " <span style='color:purple'>Congratulations!</span> <br />";
    output += " You escaped the forest!<br />";    
    output += " <br />";
    return output;
};

Game.Dialog.WonGame.prototype.handleInput = function(inputType, inputData) {
    // TODO: show message log option?
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
                var status = this.getItemStatus(i);
                var selectionState = " - ";
                var hl = "";
                if (this._selectedIndices[i]) {
                    hl = "class='highlight'";
                    selectionState = " + ";
                }
                var itemText = "<span " + hl + ">"
                    + letter + selectionState + this._items[i].getName()
                    + " " + status + "</span> <br />";
                //itemText = letter + selectionState + this._items[i].getName()
                //    + " " + status;
                
                itemListText = itemListText + itemText;
//                var itemText = letter + selectionState + this._items[i].getName()
//                    + " " + status;
//                itemListText = itemListText + itemText + "<br />";
//                itemListText = "<p class='highlight'>"
//                    + itemListText + itemText + "</p>";//<br />";
            }
        }
    }
    //return "<ul style='list-style-type:none'>" + itemListText + "</ul>";
    return itemListText;
};

Game.Dialog.Items.prototype.getItemStatus = function(i) {
    //var output = "";
    if (Game.player._handOne === i)
        return "(wielding)";
    if (Game.player._armor === i)
        return "(wearing)";
    return "";
};

Game.Dialog.Items.prototype.doMainAction = function() {
    var selItems = {};
    for (var key in this._selectedIndices) {
        selItems[key] = this._items[key];
    }
    this._mainAction(selItems);
};

Game.Dialog.Items.prototype.handleInput = function(inputType, inputData) {
    if (this._subwin) {
        this.handleInputSub(inputType, inputData);
        return;
    }
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
            this._selectedIndices = {};
            this.hideSubWin();
            this.show();
        } else if (inputData.keyCode === ROT.VK_W) {
            if (this._currentItem && this._currentItem.hasMixin('Equippable')) {
                if (Game.player.isEquipped(this._currentItemIndex)) {
                    Game.player.unequip(this._currentItemIndex);
                    Game.UI.addMessage("You unequip the " + this._currentItem._name + ".");
                    this.hide();                    
                } else {
                    //Game.player.unequip(this._currentItemIndex);
                    Game.player.wield(this._currentItemIndex);
                    Game.UI.addMessage("You equip the " + this._currentItem._name + ".");
                    this.hide();
                }
            }
        } else if (inputData.keyCode === ROT.VK_D) {
            Game.player.dropItem(this._currentItemIndex);
            this.hide();
        } else if (inputData.keyCode === ROT.VK_E) {
            if (this._currentItem && this._currentItem.hasMixin('Edible')) {
                this._currentItem.eat(Game.player, this._currentItemIndex);
                this.hide();
                Game.engine.unlock();
            }
        } 
    }
};

Game.Dialog.Items.prototype.showSubWin = function(item, itemIndex) {
    var elem = document.getElementById("sub");
    elem.style.visibility = "visible";
    var output = "<span style='color:#CCCC00'>" + item.getName() + "</span> <br />";
    output += "<br />";
    output += item._desc;
    output += "<span style='position:absolute; bottom:30px; left:20px'> ";
    output += this.getActions(item, itemIndex);
//    output += "[ESC] to close ";
    output += "</span>";
    elem.innerHTML = output;
};

Game.Dialog.Items.prototype.getActions = function(item, itemIndex) {
    var output = "";
    if (item.hasMixin('Equippable')) {
        if (Game.player.isEquipped(itemIndex)) {
            if (item._wieldable)
                output += " un[<span style='color:cyan'>w</span>]ield";
            else
                output += " un[<span style='color:cyan'>w</span>]ear";
        } else {
            if (item._wieldable)
                output += " [<span style='color:cyan'>w</span>]ield";
            else
                output += " [<span style='color:cyan'>w</span>]ear";
        }
    }
    if (item.hasMixin('Edible'))
        output += " [<span style='color:cyan'>e</span>]at";
    if (item.hasMixin('Drinkable'))
        output += " [<span style='color:cyan'>q</span>]uaff";
    if (item.hasMixin('Usable'))
        output += " [<span style='color:cyan'>u</span>]se";
    output += " [<span style='color:cyan'>d</span>]rop";
    return output;
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
        this._currentItemIndex = Number(Object.keys(selItems)[0]);
        this._currentItem = this._items[this._currentItemIndex];
        if (this._currentItem) {
            this._subwin = true;
            this.showSubWin(this._currentItem, this._currentItemIndex);
        }
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

Game.Dialog = function(properties) {

    properties = properties || {};
    
    this._title = '';
    this._modal = true;
};

Game.Dialog.prototype.show = function() {
    var elem = document.getElementById("overlay");
    elem.style.visibility = "visible";
    output = "<div>" + this.getOutput() + "</div>";
    elem.innerHTML = output;
    Game.currentDialog = this;
};

Game.Dialog.prototype.hide = function() {
    var elem = document.getElementById("overlay");
    elem.innerHTML = "";
    elem.style.visibility = "hidden";
    Game.currentDialog = null;
};

Game.Dialog.prototype.handleInput = function(inputType, inputData) {
};

Game.Dialog.prototype.getOutput = function() {
    return "placeholder";
};

Game.Dialog.Help = function() {
    Game.Dialog.call(this);
};

Game.Dialog.Help.extend(Game.Dialog);

Game.Dialog.Help.prototype.getOutput = function() {
    var output = "<span style='color:orange'>Help</span> <br />";
    output += "arrow keys or numpad to move <br />";
    output += "'g' to pick up <br />";
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


Game.Dialog.Inv = function() {
    Game.Dialog.call(this);
};

Game.Dialog.Inv.extend(Game.Dialog);

Game.Dialog.Inv.prototype.getOutput = function() {
    var output = "<span style='color:orange'>Inventory</span> <br />";
    output += " <br />";
    output += " <br />";
    return output;
};

Game.Dialog.Inv.prototype.handleInput = function(inputType, inputData) {
    if (inputType === 'keydown') {
        if (inputData.keyCode === ROT.VK_ESCAPE) {
            this.hide();
        } else if (inputData.keyCode === ROT.VK_I) {
        }
    }
};

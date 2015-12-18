Game.UI = {
    init: function() {
        
    },

    update: function() {
        Game.UI.Status.update();
        Game.UI.Messages.update();
    }
};

Game.UI.Status = {
    update: function() {
        var elem = document.getElementById('status');
        elem.innerHTML = Game.UI.Status.getOutput();
    },

    getOutput: function() {
        var player = Game.player;
        var output = "<span style='color:orange'>Name</span>";
        output += "<br />";
        output += "Level: " + player._level;
        output += "<br />";
        output += "HP: " + player._hp + " / " + player._maxHP;
        output += "<br />";
        output += "Turns: " + Game.turns;
        output += "<br />";
        output += "<br />";
        output += "Location: " + Game.zone._name;
        output += "<br />";
        output += "<br />";
        output += "Inventory: <br />";
        output += this.getInv();
        return output;
    },

    getInv: function() {    
        var items = Game.player._items;
        var itemList = "";
        if (items && items.length > 0) {
            for (var i = 0; i < items.length; i++) {
                if (items[i])
                    if (itemList.length === 0) {
                        itemList = items[i].describe();
                    } else {
                        itemList = itemList + "<br /> " + items[i].describe();
                    }
            }
        }
        return itemList;
    }

};

Game.UI.Messages = {

    msgArray : ['', '', '', '', ''],
    
    update: function() {
        var elem = document.getElementById('messages');
        elem.innerHTML = Game.UI.Messages.getOutput();
    },

    getOutput: function() {
        this.msgArray.pop();
        this.msgArray.unshift(Game.message);
        var output = Game.message;
        output += "<br />";
        output += "<span style='color:grey'>";
        for (var i=1; i < this.msgArray.length; i++) {
            output += this.msgArray[i] + "<br />";
        }
        output += "</span>";
        return output;        
    }
};

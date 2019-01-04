Game.UI = {
    update: function() {
        Game.UI.Status.update();
        Game.UI.Messages.update(); // necessary?
    },

    addMessage: function(msg) {
        Game.UI.Messages.pushMessage(msg);
        Game.UI.Messages.update();
    }
};

Game.UI.Status = {
    update: function() {
        var elemStatus = document.getElementById('status');
        elemStatus.innerHTML = Game.UI.Status.getStatus();
        var elemLegend = document.getElementById('legend');
        elemLegend.innerHTML = Game.UI.Status.getLegend();
    },

    getStatus: function() {
        var player = Game.player;
        //var output = "<span style='color:orange'>" + Game.player._name + "</span>";
        //output += "<br />";
        var output = "Level: " + player._level;
        output += "<br />";
        output +=" XP: " + player._xp;
        output += " / " + player.getNextLevelExperience();
        output += "<br />";
        if (player._hp < (player._maxHP * 0.25))
            output += "HP: <span style='color:red'>" + player._hp + "</span> / " + player._maxHP;
        else
            output += "HP: " + player._hp + " / " + player._maxHP;
        output += "<br />";
        output += "Attack: " + player.getAttackValue();
        output += "<br />";
        output += "Defense: " + player.getDefenseValue();
        output += "<br />";
        output += "Turns: " + Game.turns;
        output += "<br />";
        output += "<br />";
        output += "Location: " + Game.zone._name;
        output += "<br />";
        if (Game.zone._isMultiLevel)
            output += "Depth: " + Game.zone._depth;
        output += "<br />";
        return output;
    },

    getLegend: function() {
        var output = "<span style='color:orange'>Legend</span>";
        output += "<br />";
        output += "<br />";
        for (var i=0; i<Game.visibleEntities.length; i++) {
            var entity = Game.visibleEntities[i];
            output += "<span style='color:" + entity._foreground + "'>" + entity._char + "</span>  ";
            output += entity._name + " ";
            output += "<br />";
        }
        return output;
    }
};

Game.UI.Messages = {

    msgArray : ['', '', '', '', ''],
    
    update: function() {
        var elem = document.getElementById('messages');
        elem.innerHTML = Game.UI.Messages.getOutput();
    },

    getOutput: function() {
        var output = "<span style='color:grey'>";
        for (var i=0; i < this.msgArray.length-1; i++) {
            output += this.msgArray[i] + "<br />";
        }
        output += "</span>";
        output += this.msgArray[4];
        return output;
    },

    pushMessage: function(msg) {
        this.msgArray.shift();
        this.msgArray.push(msg);        
    }

};

Game.UI.Overlay = {

    toggle: function() {
        var elem = document.getElementById("overlay");
        elem.style.visibility = (elem.style.visibility == "visible") ? "hidden" : "visible";
    },

    show: function(text) {
        var elem = document.getElementById("overlay");
        elem.style.visibility = "visible";
        output = "<div>" + text + "</div>";
        elem.innerHTML = output;
    },

    hide: function() {
        var elem = document.getElementById("overlay");
        elem.innerHTML = "";
        elem.style.visibility = "hidden";
    },

    showHelp: function() {
        var elem = document.getElementById("overlay");
        // if help screen already open, clear it and hide
        if (elem.style.visibility == "visible") {
            elem.style.visibility = "hidden";
            elem.innerHTML = "";
            return;
        }
        elem.style.visibility = "visible";
        var output = "<div>";
        output += "<span style='color:orange'>Help</span> <br />";
        output += "arrow keys or numpad to move <br />";
        output += "'g' to pick up <br />";
        output += "</div>";
        elem.innerHTML = output;        
    },

    handleInput: function() {
    }
    
};

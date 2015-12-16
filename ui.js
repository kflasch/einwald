Game.UI = {
    init: function() {
        
    },

    update: function() {
        Game.UI.Status.update();
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
        return output;
    }
    
};

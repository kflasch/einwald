var Names =  {

    genPlayerName: function() {
        //var names = ["Alfonso", "Fredrick", "Henrietta", "Penelope"];
        //var x = Math.floor(Math.random() * names.length);
        //return names[x];

        return DonjonNames.generateName('default');

        
    }
};

// http://www.roguebasin.com/index.php?title=Names_from_a_high_order_Markov_Process_and_a_simplified_Katz_back-off_scheme

Categorical = function(support, prior) {
    this._counts = {};
    for (let x of support)
        this._counts[x] = prior;
    this._total = Object.keys(this._counts).length;
};

Categorical.prototype.observe = function(event, count=1) {
    this._counts[event] += count;
    this._total += count;
};

Categorical.prototype.sample = function(dice) {
    var sample = Math.random() * this._total;
    Object.keys(self._counts).forEach(function(key,index) {
        if (sample <= this._counts[key])
            return key;
        sample -= this._counts[key];
    });
};

MarkovModel = function(support) {
    this._support = support;
    this._order = 3;
    this._prefix = '';
    this._postfix = '';
    this._counts = {};
};

MarkovModel.prototype.categorical = function(context) {
    if (!(context in this._counts)) {
        this._counts.a = null;
    }
    return this._counts.context;
};

MarkovModel.prototype.observe = function(sequence, count=1) {
    sequence = sequence.split('');
    sequence = [this._prefix,...sequence,this._postfix];
//    sequence = sequence.unshift(this._prefix);
//    sequence = sequence.push(this._postfix);
    var orderarr = [...Array(this._order).keys()];
    for (var i=this._order; i<sequence.length; i++) {
//        context = tuple(sequence[i - self.order:i])
        var context = sequence.slice(i-self._order,i);
        var event = sequence[i];
        for (var j=0; j<context.length; j++) {
            // self._categorical(context[j:]).observe(event, count)
        }
    }
};


// markov stuff copied from
// https://donjon.bin.sh/code/name/name_generator.js

var DonjonNames = {

    
    nameSet: {'default': ["Alfonso", "Fredrick", "Henrietta", "Penelope", "Vlad-Tepes", "Erik", "Annie", "Chadwick",
                          "Greta", "Viktor", "Sally"]},
    chainCache: {},
    
    generateName: function(type) {
        var chain;
        if (chain = this.markovChain(type)) {
            return this.markovName(chain);
        }
        return '';
    },
    
    markovChain: function(type) {
        var chain;
        if (chain = this.chainCache[type]) {
            return chain;
        } else {
            var list;
            if (list = this.nameSet[type]) {
                if (chain = this.constructChain(list)) {
                    this.chainCache[type] = chain;
                    return chain;
                }
            }
        }

        return false;
    },
    
    constructChain: function(list) {
        var chain = {};

        for (var i=0; i<list.length; i++) {
            var names = list[i].split(/\s+/);
            chain = this.incrChain(chain, 'parts', names.length);

            for (var j=0; j < names.length; j++) {
                var name = names[j];
                chain = this.incrChain(chain, 'nameLen', name.length);

                var c = name.substr(0,1);
                chain = this.incrChain(chain, 'initial', c);

                var string = name.substr(1);
                var lastC = c;

                while (string.length > 0) {
                    c = string.substr(0,1);
                    chain = this.incrChain(chain, lastC, c);

                    string = string.substr(1);
                    lastC = c;
                }
            }
        }

        return this.scaleChain(chain);
    },

    incrChain: function(chain, key, token) {
        if (chain[key]) {
            if (chain[key][token]) {
                chain[key][token]++;
            } else {
                chain[key][token] = 1;
            }
        } else {
            chain[key] = {};
            chain[key][token] = 1;
        }
        return chain;
    },

    scaleChain: function(chain) {
        var tableLen = {};

        for (var key in chain) {
            tableLen[key] = 0;

            for (var token in chain[key]) {
                var count = chain[key][token];
                var weighted = Math.floor(Math.pow(count, 1.3));

                chain[key][token] = weighted;
                tableLen[key] += weighted;
            }
        }

        chain['tableLen'] = tableLen;
        return chain;
    },

    markovName: function(chain) {
        var parts = this.selectLink(chain, 'parts');
        var names = [];

        for (var i=0; i<parts; i++) {
            var nameLen = this.selectLink(chain, 'nameLen');
            var c = this.selectLink(chain,'initial');
            var name = c;
            var lastC = c;

            while (name.length < nameLen) {
                c = this.selectLink(chain, lastC);
                name += c;
                lastC = c;
            }
            names.push(name);
        }

        return names.join(' ');
    },

    selectLink: function(chain, key) {
        var len = chain['tableLen'][key];
        var idx = Math.floor(Math.random() * len);

        var t = 0;
        for (var token in chain[key]) {
            t += chain[key][token];
            if (idx < t)
                return token;            
        }

        return '-';
    }
};

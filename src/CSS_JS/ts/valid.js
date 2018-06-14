var Valid = (function () {
    function Valid() {
        this.states = ['u', 's', 'i', 'w', 'e'];
        this.classes = {
            u: '',
            w: 'has-warning',
            e: 'has-error',
            s: '',
            i: 'has-info'
        };
        this.valid = 'u';
        this.msg = null;
    }
    Valid.prototype.setActual = function (state) {
        if (this.states.indexOf(state) > this.states.indexOf(this.valid)) {
            this.valid = state;
            this.msg.type = state;
        }
    };
    Valid.prototype.add = function (valid) {
        this.setActual(valid.valid);
        if (valid.msg) {
            this.msg.addChild(valid.msg);
        }
    };
    Valid.prototype.clear = function () {
        this.valid = 'u';
        this.msg = null;
    };
    Valid.prototype.getClass = function (all) {
        if (all) {
            var c = [];
            for (var t in this.classes) {
                if (this.classes[t] !== '') {
                    c.push(this.classes[t]);
                }
            }
            return c.join(' ');
        }
        return this.classes[this.valid];
    };
    Valid.prototype.init = function (type, msg) {
        if (type && msg) {
            this.valid = type;
            this.msg = new Msg(msg, type);
        }
        else {
            this.clear();
        }
    };
    return Valid;
}());
//# sourceMappingURL=valid.js.map
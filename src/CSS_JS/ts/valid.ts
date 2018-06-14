// import { Msg } from './messages';

class Valid {
    states = ['u', 's', 'i', 'w', 'e'];
    classes = {
        u: '',
        w: 'has-warning',
        e: 'has-error',
        s: '',
        i: 'has-info'
    };
    valid='u';
    msg: Msg=null;
    setActual(state : string) {
        if (this.states.indexOf(state) > this.states.indexOf(this.valid)) {
            this.valid = state;
            this.msg.type = state;
        }
    }
    add(valid: Valid ) {
        this.setActual(valid.valid);
        if (valid.msg) {
            this.msg.addChild(valid.msg);
        }
    }
    clear() {
        this.valid = 'u';
        this.msg = null;
    }
    getClass(all) {
        if (all) {
            let c = [];
            for (let t in this.classes) {
                if (this.classes[t] !== '') {
                    c.push(this.classes[t]);
                }
            }
            return c.join(' ');
        }
        return this.classes[this.valid];
    }
    init(type?: string, msg?: any) {
        if (type && msg) {
            this.valid = type;
            this.msg = new Msg(msg, type);
        } else {
            this.clear();
        }
    }
}



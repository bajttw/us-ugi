(function($, B) {
    'use strict';
    $.extend(true, B, {
        basicWidget: {
            options: {
                animate: 'fast',
                locale:{},
                fnActionsPrefix: '_btnAction',
                actions: [],
                customActions:[]
            },
            _create: function() {
                this._custom()
                    ._createBasicControls()
                    ._createBasicOptions()
                    ._build()
                    ._createData();
                this._callFunction('_customCreate');
                this._bind();
            },
            _addBind:function(bindNames, bindObject){
                if(!B.obj.is(bindObject)){
                    bindObject={};
                }
                if(B.obj.is(bindNames)){
                    for(var e in bindNames){
                        if(typeof bindNames[e] === 'function'){
                            bindObject[e]=bindNames[e];
                        }else if(undefined !== this[bindNames[e]]){
                            bindObject[e]=this[bindNames[e]];
                        }
                    }        
                }
                return bindObject;
            },
            _bindButtons:function(btns, prefix){
                if(!B.obj.is(btns)){
                    btns=this.actionButtons;
                }               
                if (B.obj.is(btns)) {
                    prefix= typeof prefix === 'string' ? prefix : this.options.fnActionsPrefix, '_btnAction';
                    for (var a in btns) {
                        if (B.obj.is$(btns[a])) {
                            this._on(
                                btns[a],
                                this._addBind({ click: prefix + B.str.firstUpper(a) })
                            );
                        }
                    }
                }
                return this;
            },
            _build: function() {
                return this;
            },           
            _callFunction: function(name) {
                if (typeof this[name] !== 'function') {
                    return null;
                }
                var args = [];
                for (var i = 1; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                return this[name].apply(this, args);
            },
            _createBasicControls: function() {
                this.$errors = this.element.find('.errors');
                this.$messages = this.element.find('.messages');
                this._callFunction('_customCreateBasicControls');
                return this;
            },
            _createBasicOptions: function() {
                var o = this.options;
                $.extend(true, o, this.element.data('options'));
                o.entitySettings = B.getEntitySettings(o.ecn);
                this._callFunction('_customCreateBasicOptions');
                return this;
            },
            _createData: function() {
                $.extend(this, 
                    this.options.initData || {}
                );
                return this;
            },
            _custom: function() {
                var o = this.options;
                if (B.obj.is(o.custom)) {
                    for (var n in o.custom) {
                        this[n] = o.custom[n];
                    }
                }
                return this;
            },
            _fromDictionary: function(value, options) {
                if (B.obj.is(options)) {
                    if (!options.hasOwnProperty('name')) {
                        options.name = 'n';
                    }
                } else {
                    options = { name: 'n' };
                }
                return B.dic.from(this.options.dictionary, B.getValue(value, ['v', 'id', 'value']), options);
            },
            _locale: function(name, def) {
                return B.obj.getValue(name, this.options.locale, def || '');
            },
            getDictionary: function(name) {
                return B.dic.get(name, this.options.ecn);
            },
            getEntitySetting: function(name) {
                return B.obj.getValue(name, this.options.entitySettings);
            },
            getParameters: function(name) {
                return B.obj.getValue(name, this.options.entitySettings);
            },
            showErrors: function(errors) {
                this.$errors.showMessages(errors);
            },
            showMessages: function(messages) {
                this.$messages.showMessages(messages);
            }
        }
    });
})(jQuery, Bajt);

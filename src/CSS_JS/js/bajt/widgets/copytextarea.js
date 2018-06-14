(function($, B) {
    $.widget('bajt.copyTextarea', {
        options: {
            scheme: 0,
            entitySettings: null,
            autoModal: true,
            templates: {
                info:
                    '<div class="alert alert-info"><span style="margin-left:1rem;">Kopiuj do schowka Ctrl+C</span></div>',
                btnSelect: '<button type="buttton" class="btn btn-info">Zaznacz</button>',
                schemSelect: '<input type="text">'
            }
        },
        _create: function() {
            var o = this.options;
            this.data = null;
            this.$modal = this.element.closest('.modal');
            this.$container = this.element.parent();
            this.$info = $(o.templates.info);
            this.$schemeSelect = $(o.templates.schemSelect);
            this.$btnSelect = $(o.templates.btnSelect);
            this.$info.prepend(this.$btnSelect);
            this.$info.insertBefore(this.element);
            this.$schemeSelect.insertBefore(this.element).combobox();
            this.schemeSelect = this.$schemeSelect.data('bajtCombobox');
            this.init();
            this._bind();
            console.log('copy area created');
        },
        _bind: function() {
            var that = this;
            this._on(this.$btnSelect, {
                click: this.select
            });
            this._on(this.$schemeSelect, {
                change: this._changeScheme
            });
            if (B.obj.is$(this.$modal)) {
                this.$modal.on('shown.bs.modal', function() {
                    that.select();
                });
            }
        },
        init: function(options) {
            console.log('copy area init');
            this._setOptions(
                $.extend(
                    {
                        scheme: 0
                    },
                    options || {}
                )
            );
            var o = this.options;
            var exp = B.obj.getValue('entitySettings.exports', o);
            var dic = [];
            if (exp) {
                for (var i in exp) {
                    dic.push({
                        v: i,
                        n: exp[i].title,
                        d: exp[i].title
                    });
                }
            }
            this.schemeSelect.reloadDictionary(dic, o.scheme);
        },
        _changeScheme: function() {
            this.options.scheme = this.$schemeSelect.val() || 0;
            this.exportData();
            console.log('changed schema');
        },
        _toText: function(expScheme) {
            var text = '',
                convStr = function(txt) {
                    var ct = {
                        '%t': '\t',
                        '%n': '\n'
                    };
                    for (var c in ct) {
                        txt = txt.replace(c, ct[c]);
                    }
                    return txt;
                },
                convScheme = function(scheme) {
                    if (B.obj.isIterate(scheme)) {
                        for (var i in scheme) {
                            if (typeof scheme[i] === 'string') {
                                scheme[i] = convStr(scheme[i]);
                            }
                        }
                    }
                },
                toStr = function(scheme, data, parent) {
                    var val;
                    if (typeof scheme === 'string') {
                        text += scheme;
                    } else if (B.obj.is(scheme)) {
                        if (B.obj.isIterate(scheme)) {
                            for (var i in scheme) {
                                toStr(scheme[i], data, parent);
                            }
                        } else {
                            if (scheme.hasOwnProperty('parent')) {
                                toStr(scheme.parent, parent, parent);
                            } else if (scheme.hasOwnProperty('key')) {
                                if ((val = B.obj.getValue(scheme.key, data))) {
                                    if (scheme.hasOwnProperty('child')) {
                                        var child = scheme.child;
                                        convScheme(child);
                                        if (B.obj.isIterate(val)) {
                                            for (var j in val) {
                                                toStr(child, val[j], parent);
                                            }
                                        } else {
                                            toStr(child, val, parent);
                                        }
                                    } else {
                                        text += val;
                                    }
                                }
                            }
                        }
                    }
                },
                o = this.options;
            if (this.data && o.entitySettings) {
                if (!expScheme) {
                    expScheme = o.entitySettings.exports[o.scheme].scheme;
                }
                convScheme(expScheme);
                toStr(expScheme, this.data, this.data);
            }
            return text;
        },
        exportData: function(data, options) {
            if (data) {
                this.data = data;
            }
            if (B.obj.is(options)) {
                this.init(options);
            } else {
                this.element.val(this._toText());
                if (this.options.autoModal && B.obj.is$(this.$modal)) {
                    this.$modal.modal('show');
                    console.log('modal show');
                } else {
                    this.select();
                }
            }
        },
        select: function() {
            this.element[0].focus();
            this.element[0].select();
            // console.log('export selected');
            // if (this.element.is(':visible')){
            //     console.log('is visible');
            // }
        }
    });

    $.fn.initCopyTextarea = function(options) {
        var $textarea = $(this);
        if (!$textarea.is(':data("bajt-copyTextarea")')) {
            options = $.extend({}, $textarea.data() || {}, B.obj.is(options) ? options : {});
            $textarea.copyTextarea(options);
        } else {
            $textarea.copyTextarea('init', B.obj.is(options) ? options : {});
        }
    };
})(jQuery, Bajt);

(function($, B) {
    'use strict';

    $.widget('bajt.combobox', {
        options: {
            templates: {
                input: '<input class="form-control" size="1">',
                buttonDropdown: ''
            },
            // class: 'custom-combobox',
            type: null,
            dictionary: null,
            dictionaryType: 'array', //array, object
            customItems: null, //{ postion: top || bottom, items: { 0: { v: 0, n: 'nazwa' }} ||[ { v: 0, n: 'nazwa' }] }
            source: [],
            emptyItemValue: '-',
            emptyDicValue: '-',
            removeInvalid: true,
            add: null,
            dicFields: {
                v: 'v',
                n: 'n',
                d: 'd'
            }
        },
        _create: function() {
            var that = this,
                o = this.options,
                $el = this.element,
                $container = $el.parent(),
                $buttons,
                options = $el.data('options') || {};
            for (var n in options) {
                if (!o[n]) {
                    o[n] = options[n];
                }
            }
            this.elementId = $el.attr('id');
            if (B.obj.is(o.get) && o.get.hasOwnProperty('dictionary')) {
                o.dictionary = o.get.dictionary();
            }
            this._initDictionary();
            if (!o.type) {
                o.type = $el.getDataType();
            }
            if ($container.hasClass('input-group')) {
                $buttons = $container.find('.input-group-append');
            } else {
                $el.wrap(B.html.get$('inputGroup'));
                $container = $el.parent();
                $buttons = B.html.get$('inputGroupBtn');
                $container.append($buttons);
            }
            $el.hide();
            this.$input = $(o.templates.input);
            this.$btn =
                o.templates.buttonDropdown !== ''
                    ? $(o.templates.buttonDropdown)
                    : B.html.get$('btn', { icon: { icon: 'arrow_drop_down', addClass: 'md-14' } });
            $container.prepend(that.$input);
            $buttons.prepend(that.$btn);
            if (B.obj.is(o.add)) {
                this.$add = B.html.get$('btn', { icon: 'library_add' });
                $buttons.append(that.$add);
                this.$addModal = B.obj.is$(o.add.modal) ? o.add.modal : $(o.add.modal);
            }
            if (B.obj.is(o.buttons)) {
                $.each(o.buttons, function(n, opt) {
                    $buttons.append(B.html.get$('btn', opt));
                });
            }
            //            $e.wrap(o.templates.wrapper);
            //            that.$wrapper = $e.parent();
            //            that.$container=$(o.templates.container);
            //            that.$buttons=$(o.templates.buttonsContainer);
            //            .append(that.$buttons);
            //            that.$btn=$(o.templates.buttonDropdown);
            //            that.$buttons.append(that.$btn);
            //            that.$wrapper.append(that.$container);

            //            that.$wrapper.append(that.$container);
            //            that.$input=$(o.templates.wrapper);

            //            that.$btn=that.$wrapper.find(".btn");
            //            that.$wrapper.insertAfter( that.element );
            this._import();
            this.autocomplete = this.$input
                .autocomplete({
                    delay: 0,
                    minLength: 0,
                    source: o.source, //[{value: , label: , desc: , icon: }]
                    focus: function(e, ui) {
                        that.$input.val(ui.item.label);
                        return false;
                    },
                    select: function(e, ui) {
                        that.$input.val(ui.item.label);
                        return false;
                    }
                })
                .data('uiAutocomplete');
            this.$btn.attr('tabIndex', -1);
            this._bind();
        },
        _bind: function() {
            var that = this,
                wasOpen = false;
            this._on(this.$input, {
                autocompleteselect: function(e, ui) {
                    that.ownChange = true;
                    that.exportItem(ui.item);
                },
                blur: this._import,
                autocompletechange: '_removeIfInvalid'
            });
            this._on(this.$btn, {
                mousedown: function() {
                    wasOpen = that.$input.autocomplete('widget').is(':visible');
                },
                click: function() {
                    that.$input.focus();
                    if (wasOpen) {
                        // Close if already visible
                        return;
                    }
                    that.$input.autocomplete('search', ''); // Pass empty string as value to search for, displaying all results
                }
            });
            if (B.obj.is$(this.$add)) {
                this._on(this.$add, { click: this._new });
            }
            if (B.obj.is$(this.$addModal)) {
                this._on(this.$addModal, { submited: this._add });
            }
            that._on(that.element, {
                change: this._change,
                changed: this._change,
                block: this._block
            });
        },
        _change: function(e, data){
            if (this.ownChange) {
                this.ownChange = false;
            } else {
                this._import();
            }
        },
        _block:function(e, data){
            this.block(data.block);
        },
        block:function(block){
            this.$input.prop('disabled', block);
            this.$btn.prop('disabled', block);

        },
        _new: function(e) {
            stopTrigger(e);
            var add = this.options.add,
                val = this.$input.val(),
                url = add.url;
            if (val && add.nameField) {
                url += '&' + add.nameField + '=' + encodeURI(val);
            }
            this.$addModal.data('evoker', this.elementId);
            this.$addModal.modal({
                url: url
            });
        },
        _add: function(e, data) {
            var o = this.options;
            if (data.dictionaryName === o.add.dictionaryName) {
                stopTrigger(e);
                if (!B.obj.is(o.dictionary)) {
                    this.reloadDictionary([data.entity_dic]);
                } else {
                    if ($.isArray(o.dictionary)) {
                        o.dictionary.push(data.entity_dic);
                    } else {
                        o.dictionary[data.entity_dic.v] = data.entity_dic;
                    }
                    o.source.push(this._toItem(data.entity_dic));
                    this.autocomplete.option('source', o.source);
                }
                this.element.trigger('newDicValue', {
                    dicName: data.dictionaryName,
                    dicEntry: data.entity_dic
                });

                //                if (o.field && (o.field.options.dictionary !== o.dictionary)){
                //                    if($.isArray(o.dictionary))
                //                        o.field.options.dictionary.push(data.entity_dic);
                //                    else
                //                        o.field.options.dictionary=o.dictionary;
                //                }
                if ($(e.target).data('evoker') === this.elementId) {
                    this.exportItem(data.entity_dic);
                }
            }
        },
        _setOption: function(key, value) {
            console.log('!!!!! combobox' + key);
            if (key === 'disabled') {
                // console.log('disable');
                var $container = this.element.parent();
                if (value) {
                    $container.addClass('ui-state-disabled');
                } else {
                    $container.removeClass('ui-state-disabled');
                }
                // this._toggleClass( this.element.parent(), 'ui-state-disabled', value );
            }
            this._super(key, value);
        },
        _toItemValue: function(value) {
            return value ? value : this.options.emptyItemValue;
        },
        _toDicValue: function(value) {
            return value === this.options.emptyItemValue ? this.options.emptyDicValue : value;
        },
        _toItem: function(val) {
            var dicFields = this.options.dicFields,
                value = this._toItemValue(val[dicFields['v']]),
                label = val[dicFields['n']],
                desc = val[dicFields['d']] || label;
            return {
                value: value,
                label: label,
                desc: desc,
                icon: null
            };
        },
        _dicItem: function(val) {
            var o = this.options,
                item = {};
            if (!o.dicFields) {
                this._initDicFields([val]);
            }
            for (var i in o.dicFields) {
                item[o.dicFields[i]] = val[o.dicFields[i]];
            }
            return item;
        },
        _toObj: function(val) {
            var o = this.options;
            if (val) {
                if (!B.obj.is(val)) {
                    val = B.dic.from(o.dictionary, val);
                }
                if (B.obj.is(val)) {
                    return {
                        v: this._toDicValue(val.value || val[o.dicFields['v']]),
                        n: val.label || val[o.dicFields['n']],
                        d: val.desc || val[o.dicFields['d']]
                    };
                }
            }
            return null;
        },
        _createDictionary: function() {
            var o = this.options;
            o.dictionary = o.dictionaryType === 'array' ? [] : {};
            o.dicFields = null;
        },
        _initDicFields: function(dic) {
            var o = this.options;
            if (!B.obj.is(dic)) {
                dic = o.dictionary;
            }
            if (B.obj.is(dic)) {
                for (var i in dic) {
                    o.dicFields = {
                        v: dic[i].hasOwnProperty('v') ? 'v' : 'value',
                        n: dic[i].hasOwnProperty('n') ? 'n' : 'name',
                        d: dic[i].hasOwnProperty('d') ? 'd' : 'dsc'
                    };
                    break;
                }
            }
        },
        _importFromSelect: function() {
            var o = this.options;
            this._createDictionary();
            this.element.find('option').each(function() {
                var item = {
                    v: this.value,
                    n: this.textContent,
                    d: ''
                };
                if (o.dictionaryType === 'array') {
                    o.dictionary.push(item);
                } else {
                    o.dictionary[this.value] = item;
                }
            });
            this._initDicFields();
        },
        _customItems: function() {
            var o = this.options;
            // console.log(o.customItems);
            if (B.obj.is(o.customItems)) {
                var position = o.customItems.hasOwnProperty('position') ? o.customItems.position : 'top',
                    items = o.customItems.items;
                if (B.obj.is(items)) {
                    for (var i in items) {
                        var item = this._dicItem(items[i]);
                        if ($.isArray(o.dictionary)) {
                            if (position === 'top') {
                                o.dictionary.unshift(item);
                            } else {
                                o.dictionary.push(item);
                            }
                        } else {
                            if (!o.dictionary.hasOwnProperty(i)) {
                                o.dictionary[i] = item;
                            }
                        }
                    }
                }
            }
        },
        _initDictionary: function(dictionary) {
            var that = this,
                o = this.options;
            if (B.obj.is(dictionary)) {
                o.dictionary = dictionary;
            }
            if (B.obj.is(o.dictionary)) {
                o.dictionaryType = $.isArray(o.dictionary) ? 'array' : 'object';
                this._initDicFields();
            }
            if (!isSet(o.dictionary) && this.element.is('select')) {
                this._importFromSelect();
            }
            if (!B.obj.is(o.dictionary)) {
                this._createDictionary();
            }
            this._customItems();
            if (B.obj.is(o.dictionary)) {
                o.source = [];
                if (!o.dicFields) {
                    this._initDicFields();
                }
                for (var i in o.dictionary) {
                    o.source.push(that._toItem(o.dictionary[i]));
                }
            }
            //            console.log('initDictionary - o.source');
            //            console.log(o.source);
        },
        reloadDictionary: function(dic, val) {
            this._initDictionary(dic);
            this.autocomplete.option('source', this.options.source);
            this.value(val);
        },
        _import: function() {
            var value = this.element.readField(),
                disp = B.dic.from(this.options.dictionary, value);
            if (B.obj.is(disp)) {
                disp = disp.n || disp.name;
            } else {
                disp = '';
            }
            this.$input.val(disp);
        },
        value: function(val) {
            if (val !== undefined) {
                this.element.val(val).change();
            }
            return this.element.val();
        },
        exportItem: function(item) {
            var //value='',
            obj = this._toObj(item);
            //            if (B.obj.is(obj)){
            //                switch(this.options.type){
            //                    case 'json':
            //                        value= JSON.stringify(obj);
            //                    break;
            //                    default:
            //                        value=obj.v;
            //                }
            //            }
            //            this.element.val(value).change();
            this.element.writeField(obj, true);
        },
        _removeIfInvalid: function(event, ui) {
            // Selected an item, nothing to do
            if (ui.item || !this.options.removeInvalid) {
                return false;
            }

            // Search for a match (case-insensitive)
            var value = this.$input.val(),
                that = this,
                valueLowerCase = value.toLowerCase(),
                valid = false;
            $.each(that.options.source, function() {
                if (this.label.toLowerCase() === valueLowerCase) {
                    valid = true;
                    return false;
                }
            });
            // Found a match, nothing to do
            if (valid) {
                return;
            }
            // Remove invalid value
            that.$input.val('').attr('title', value + ' nie znaleziono');
            that.exportItem();
            that._delay(function() {
                that.$input.tooltip('hide').attr('title', '');
            }, 2500);
            that.$input.autocomplete('instance').term = '';
        },
        _destroy: function() {
            this.$wrapper.remove();
            this.element.show();
        }
    });
})(jQuery, Bajt);

(function($, B) {
    'use strict';
    $.widget(
        'bajt.priceListItemForm',
        $.extend(true, {}, B.basicForm, {
            options: {
                formFields: [
                    'name',
                    'symbol',
                    {
                        name: 'active'
                    },
                    {
                        name: 'color',
                        options: {
                            widget: {
                                type: 'combobox'
                            },
                            dictionary: true
                        }
                    },
                    {
                        name: 'size',
                        options: {
                            widget: {
                                type: 'combobox'
                            },
                            dictionary: true
                        }
                    },
                    {
                        name: 'price',
                        options: {
                            widget: {
                                type: 'nettoinput'
                            }
                        }
                    }
                ]
            }
        })
    );

    $.fn.initFormPriceListItem = function() {
        var $form = $(this).find('form[data-form=pricelistitems]');
        if (B.obj.is$($form)) {
            $form.priceListItemForm();
        }
    };

    $.widget(
        'bajt.positionPriceListItems',
        $.extend(true, {}, B.formPosition, {
            options: {
                ecn: 'PriceListItems',
                formFields: [
                    {
                        name: 'symbol',
                        options: {
                            navi: 1
                        }
                    },
                    {
                        name: 'name',
                        options: {
                            navi: 2
                        }
                    },
                    {
                        name: 'price',
                        options: {
                            precision: 1,
                            autocorrect: true,
                            type: 'float',
                            check_key: 1,
                            navi: 3,
                            selectOnFocus: true
                        }
                    },
                    {
                        name: 'size',
                        options: {
                            dictionary: true,
                            disp: {
                                type: 'dic.s',
                                def: 'S'
                            }
                        }
                    },
                    {
                        name: 'color',
                        options: {
                            dictionary: true,
                            disp: {
                                type: 'dic.s',
                                def: 'K'
                            }
                        }
                    }
                ]
            },
            validate: function() {
                var that = this,
                    i,
                    valid = this.valid,
                    initValid = function() {
                        if (!valid.msg) {
                            valid.init(
                                'u',
                                new Msg({
                                    label: ' - pozycja nr ' + that.options.nr,
                                    message: ''
                                })
                            );
                        }
                    };
                valid.init();
                for (i in this._fields) {
                    var fvalid = this._fields[i].validate();
                    if (fvalid.msg) {
                        initValid();
                        valid.add(fvalid);
                    }
                }
                return valid;
            }
        })
    );

    $.widget(
        'bajt.priceListItemsGenerateForm',
        $.extend(true, {}, B.basicForm, B.extFormPositions, {
            options: {
                formFields: [
                    {
                        name: 'color',
                        options: {
                            widget: {
                                type: 'multiselect'
                            }
                        }
                    },
                    {
                        name: 'size',
                        options: {
                            widget: {
                                type: 'multiselect'
                            }
                        }
                    }
                ],
                positionsOptions: {
                    ecn: 'PriceListItems',
                    name: 'items',
                    focusField: 'symbol',
                    autoNew: false,
                    unique: true,
                    initData: {
                    }
                }
            },
            _bind: function() {
                var that = this;
                this._bindForm();
                this._on(this.$generateBtn, {
                    click: this._generatePositions
                });
            },
            _customAllowedOperation: function(operation, data) {
                var allow = true;
                switch (operation) {
                    case 'generate':
                        allow = !(this.field('size').isEmpty() || this.field('color').isEmpty());
                        break;
                    case 'newPosition':
                        allow = !(
                            this._positions.uniques.hasOwnProperty(data) || this.options.uniques.hasOwnProperty(data)
                        );
                        break;
                    case 'submit':
                        allow=this._positions.rows.length > 0;
                        
                    break;
                }
                return allow;
            },
            _customChange: function(data) {
                if (B.obj.is(data)) {
                    var f = data.field,
                        name = f.option('name');
                    switch (name) {
                        case 'size':
                        case 'color':
                            this._toggleGenerate();
                            var k = f.value();
                            break;
                    }
                }
            },
            _customCreateBasicControls: function() {
                this.$generateBtn = this.element.find('[data-generate]');
            },
            _customCreateBasicOptions: function() {
                var o = this.options;
                if (B.obj.is(o.uniques)) {
                    o.uniques = {};
                }
            },
            _customCreateData: function() {
                this._status = 0;
            },
            _customPosRemove: function(e, data) {
                delete this._positions.uniques[data.position.element.data('unique')];
            },
            _customState: function(state, data) {
                switch (state) {
                    case 'start':
                        this._toggleGenerate();
                        break;
                    case 'normal':
                        break;
                }
                return this._state;
            },
            _generatePositions: function(e) {
                var o = this.options,
                    sizes = this.field('size').value(),
                    colors = this.field('color').value(),
                    sizesDic = this.getDictionary('Sizes'),
                    colorsDic = this.getDictionary('Colors'),
                    nameGenerator = this.getEntitySetting('nameGenerator'),
                    symbolGenerator = this.getEntitySetting('symbolGenerator');

                if (B.obj.is(sizes) && B.obj.is(colors)) {
                    for (var i in sizes) {
                        var size = B.dic.from(sizesDic, sizes[i]);
                        for (var j in colors) {
                            var color = B.dic.from(colorsDic, colors[j]),
                                values = {
                                    size: size,
                                    color: color
                                },
                                unique = this._uniqueGen(values);
                            if (this.allowedOperation('newPosition', unique)) {
                                values.symbol = B.obj.is(symbolGenerator)
                                    ? B.genNumber(symbolGenerator, '', { entity: values, fields: o.ecn })
                                    : unique;
                                values.name = B.obj.is(symbolGenerator)
                                    ? B.genNumber(nameGenerator, '', { entity: values, fields: o.ecn })
                                    : 'Parapet ' + unique;
                                this._posNew('size', values);
                            }
                        }
                    }
                }
            },
            _toggleGenerate: function(toggle) {
                this.$generateBtn.prop('disabled', !this.allowedOperation('generate'));
            },
            _uniqueGen: function(values) {
                var size = B.obj.getValue('size.v', values, 'error'),
                    color = B.obj.getValue('color.v', values, 'error');
                return size + '_' + color;
            },
            _uniqueSet: function(position, values) {
                if (!B.obj.is(values)) {
                    values = position.getValues(['size', 'color']);
                }
                return B.extFormPositions._uniqueSet.call(this, position, values);
            }
        })
    );

    $.fn.initFormPriceListItemsGenerate = function() {
        var $form = $(this).find('form[data-form=pricelistitemsgenerate]');
        if (B.obj.is$($form)) {
            $form.priceListItemsGenerateForm();
        }
    };

    $.widget(
        'bajt.positionPrices',
        $.extend(true, {}, B.formPosition, {
            options: {
                ecn: 'Prices',
                formFields: [
                    {
                        name: 'priceListItem',
                        options: {
                            disp: {
                                type: 'dic.n'
                            },
                            dictionary: true
                        }
                    },
                    {
                        name: 'value',
                        options: {
                            precision: 1,
                            autocorrect: true,
                            type: 'float',
                            check_key: 1,
                            navi: 1,
                            selectOnFocus: true
                        }
                    }

                ],
                focusField: 'value'
            }
        })
    );   

    $.widget(
        'bajt.priceListForm',
        $.extend(true, {}, B.basicForm, B.extFormPositions, {
            options: {
                formFields: [
                    'clients',
                    'clientsGroups',
                    'title',
                    {
                        name: 'start',
                        options: {
                            type: 'date',
                            widget: {
                                type: 'datepicker',
                                options: {
                                    locale: {
                                        format: 'YYYY-MM-DD HH:mm'
                                    },
                                    startDate: true,
                                    timePicker: true,
                                    timePicker24Hour: true
                                }
                            }
                        }
                    },
                    {
                        name: 'end',
                        options: {
                            type: 'date',
                            widget: {
                                type: 'datepicker',
                                options: {
                                    locale: {
                                        format: 'YYYY-MM-DD HH:mm'
                                    },
                                    startDate: true,
                                    autoUpdateInput: false,
                                    timePicker: true,
                                    timePicker24Hour: true
                                }
                            }
                        }
                    },
                    'description'
                ],
                positionsOptions: {
                    ecn: 'Prices',
                    focusField: 'value',
                    autoNew: false,

                    initData: {
                        uniques: {}
                    }
                }
            },
            _bind: function() {
                var that = this;
                console.log(this.options);
                this._bindForm();
                this._on(this._$positions, {
                    'dtImport_rowAdded': function(e, data){
                        that._$posInit(data.$row);
                    }
                });
            },
            _customCreateBasicControls:function(){
                // this.$generateBtn=this.element.find('data-generate=1');
                return this;
            },
            _initPositions:function(){
                B.extFormPositions._initPositions.call(this);
                this._$positions.initFormWidget({
                    widget: 'dtImport',
                    ecn: 'PriceListItems',
                    addBtn: '#add_prices_btn',
                    modal: '#pricelistitems_import_modal',
                    modalBtn: '#prices_import_btn',
                    table: '#pricelistitems_table',
                    unique: {
                        on: true,
                        showFilter: true,
                        filter: true,
                        name: 'v'
                    },
                    inputSelector: '[data-item]',
                    importFields: {v: 'id', n: 'name', s: 'symbol', price: 'price', val: 'price'}
                });
            }
            

        })
    );

    $.fn.initFormPriceListItem = function() {
        var $form = $(this).find('form[data-form=pricelists]');
        if (B.obj.is$($form)) {
            $form.priceListForm();
        }
    };
})(jQuery, Bajt);

// _$posInit: function($position) {
//     this._uniqueSet(this._posAdd($position));
// },

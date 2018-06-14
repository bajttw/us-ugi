(function($, B) {
    'use strict';

    $.extend(true, B, {
        formPosition: $.extend(true, {}, B.basicWidget, {
            options: {
                parent: null,
                index: 0,
                nr: 1,
                ecn: '',
                initData: {},
                confirmationRemove: {},
                formBind: {
                    changed: '_change',
                    navigate: '_navigateEvent'
                },
                actions: ['remove'],
                templates: {
                    remove:
                        '<button type="button" class="btn-danger btn-rm btn" title="Usuń pozycję" data-toggle="confirmation" ><i class="material-icons md-14">remove_circle</i><span class="text"></span></button>'
                }
            },
            _addField: B.basicForm._addField,
            _bindForm: B.basicForm._bindForm,
            _bind: function() {
                // var that = this;
                this._bindForm();
                // for (var k in this.actionButtons) {
                //     var fnAction = '_' + k + 'Action';
                //     if (B.obj.is$(this.actionButtons[k]) && typeof this[fnAction] === 'function') {
                //         this._on(this.actionButtons[k], {
                //             click: this[fnAction]
                //         });
                //     }
                // }
                return this;
            },
            _blockFields: B.basicForm._blockFields,
            _blockStatus: 0,
            _build: function() {
                var o = this.options;
                this.actionButtons = {
                    // details: $(o.templates.details),
                    remove: $(o.templates.remove)
                        .attr('data-toggle', 'confirmation')
                        .confirmation($.extend({}, B.confirmationOptions, this.options.confimationRemove || {}))
                };
                if (B.obj.is(o.customActions)) {
                    for (var i in o.customActions) {
                        var name = o.customActions[i];
                        if (o.templates.hasOwnProperty(name)) {
                            this.actionButtons[name] = $(o.templates[name]).appendTo(this.$actions);
                        }
                    }
                }
                if ($.isArray(o.actions) && o.actions.indexOf('remove') >= 0) {
                    this.$actions.append(this.actionButtons.remove);
                }
                return this;
            },
            _change: function(e, data) {
                // console.log('\t*** field '+data.field.element.attr('id'));
                if (data.field.option('calc')) {
                    stopTrigger(e);
                    this._callFunction('calc');
                } else {
                    data.summary = data.field.option('name') === this.options.summaryField;
                    data.position = this;
                }
            },
            _createBasicControls: function() {
                this.$actions = this.element.find('.c-actions');
                this.$details = this.element.find('.row-info');
                this._callFunction('_customCreateBasicControls');
                return this;
            },
            _createBasicOptions: function() {
                var o = this.options;
                o.posId = this.element.attr('id');
                o.fieldSelectorPrefix = '#' + o.posId + '_';
                B.basicWidget._createBasicOptions.call(this);
                return this;
            },
            _create: function() {
                this._custom()
                    ._createBasicControls()
                    ._createBasicOptions()
                    ._build()
                    ._createData()
                    ._createFields();
                this._callFunction('setNr');
                this._callFunction('calc');
                this._callFunction('_customCreate');
                this._bind();
            },
            _createData: B.basicForm._createData,
            _createFields: B.basicForm._createFields,
            _customFieldOptions: B.basicForm._customFieldOptions,
            _detailsAction: function(e) {
                stopTrigger(e);
                if (B.obj.is$(this.$details)) {
                    this.$details.slideToggle();
                }
            },
            _findFieldElement: B.basicForm._findFieldElement,
            _getFieldEntityClass: B.basicForm._getFieldEntityClass,
            _initValid: function() {
                if (!this.valid.msg) {
                    this.valid.init(
                        'u',
                        new Msg({
                            title: this._locale('validate.position', '- pozycja nr ') + this.options.nr,
                            message: ''
                        })
                    );
                }
            },
            _navigateCtrlEvent: function(e, data) {
                if (data.step === -1 || data.step === 1) {
                    data.container = '.row-data';
                } else {
                    data.position = this;
                    data.index = $('.row-data [data-navi]', this.element).index(e.target);
                    data.step = data.step > 0 ? 1 : -1;
                }
            },
            _navigateEvent: B.basicForm._navigateEvent,
            _navigateFieldsEvent: function(e, data) {
                if (data.step === -1 || data.step === 1 || data.step === 3) {
                    var fields = this._fields,
                        fc = fields.length,
                        step = data.step === 3 ? 1 : data.step,
                        i = fields.indexOf(data.field) + step;
                    while (i >= 0 && i < fc && !fields[i].option('navi')) {
                        i += step;
                    }
                    if (fields[i]) {
                        stopTrigger(e);
                        fields[i].focus(data);
                        data.field.element.trigger('navigate-success');                
                    } else if (data.step === 3) {
                        // (pressed Enter) - not found next field -> next position
                        data.position = this;
                    } else {
                        stopTrigger(e);
                    }
                } else {
                    data.position = this;
                    data.step = data.step > 0 ? 1 : -1;
                }
            },
            // _navigate: function(e, data) {
            //     if (data.step === -1 || data.step === 1 || data.step === 3) {
            //         var fields = this._fields,
            //             fc = fields.length,
            //             step = data.step === 3 ? 1 : data.step,
            //             i = fields.indexOf(data.field) + step;
            //         while (i >= 0 && i < fc && !fields[i].option('navi')) {
            //             i += step;
            //         }
            //         if (fields[i]) {
            //             stopTrigger(e);
            //             fields[i].focus(data);
            //         } else if (data.step === 3) {
            //             // (pressed Enter) - not found next field -> next position
            //             data.position = this;
            //         } else {
            //             stopTrigger(e);
            //         }
            //     } else {
            //         data.position = this;
            //         data.step = data.step > 0 ? 1 : -1;
            //     }
            // },
            // _navigateCtrl: function(e, data) {
            //     if (data.step === -1 || data.step === 1) {
            //         data.container = '.row-data';
            //     } else {
            //         data.position = this;
            //         data.index = $('.row-data [data-navi]', this.element).index(e.target);
            //         data.step = data.step > 0 ? 1 : -1;
            //     }
            // },
            _btnActionRemove: function(e) {
                stopTrigger(e);
                this.element.trigger('formPosition_remove', { position: this });
            },
            _sumFields: B.basicForm._sumFields,
            _sumVal: B.basicForm._sumVal,
            _validateFields: B.basicForm._validateFields,
            allowAction: function(name, allow) {
                var $btn = this.actionButtons[name];
                if (!B.obj.is$($btn)) {
                    return;
                }
                if (allow === undefined || allow) {
                    $btn.show();
                } else {
                    $btn.hide();
                }
            },
            block: function(block) {
                if ((block && this._blockStatus === 0) || (!block && this._blockStatus > 0)) {
                    this._blockStatus = block ? 1 : 0;
                    this._blockFields(block);
                    this._callFunction('_customBlock', block);
                }
                return this;
            },
            field: B.basicForm.field,
            focus: function(index, eventData) {
                var field = this.field(index ? index : 0);
                if (field) {
                    field.focus(eventData);
                }
            },
            getLimits: B.basicForm.getLimits,
            getSummary: B.basicForm.getSummary,
            getValues: B.basicForm.getValues,
            setDefault: function(fieldName) {
                var field = fieldName ? this.field(fieldName) : null;
                if (field) {
                    field.setDefault();
                }
            },
            setNr: function(nr) {
                if (nr !== undefined) {
                    this.options.nr = nr;
                }
                if (this._fieldsByName.hasOwnProperty('nr')) {
                    this._fieldsByName.nr.value(this.options.nr);
                }
            },
            setValues: B.basicForm.setValues,
            update: B.basicForm.update,
            validate: function() {
                this.valid.init();
                this._validateFields();
                return this.valid;
            }
        })
    });

    $.widget('bajt.positionForm', $.extend(true, {}, B.formPosition));

    var _pUtils = {
        block: function(positions, pOptions, block) {
            for (var i in positions.rows) {
                positions.rows[i].block(block);
            }
            if (B.obj.is(positions.actionButtons)) {
                for (var a in positions.actionButtons) {
                    positions.actionButtons[a].prop('disabled', block);
                }
            }
            return this;
        },
        create$Positions: function(positions, pOptions) {
            positions.$container = this.element.find(
                this.options.fieldSelectorPrefix + (pOptions.name || B.str.firstLower(pOptions.ecn))
            );
            if (B.obj.is(pOptions.widget)) {
                positions.$container.initFormWidget(pOptions.widget);
            }
            $.extend(true, pOptions, positions.$container.data());
            if (!pOptions.posWidget) {
                pOptions.posWidget = pOptions.ecn ? 'position' + pOptions.ecn : 'formPosition';
            }
            return this;
        },
        createActionsBtns: function(positions, pOptions) {
            if ($.isArray(pOptions.actions)) {
                positions.actionButtons = {};
                for (var i in pOptions.actions) {
                    var action = pOptions.actions[i],
                        $btn = this.element.find('[data-positions-' + action + '=' + pOptions.ecn + ']');
                    if (B.obj.is$($btn)) {
                        positions.actionButtons[action] = $btn;
                    }
                }
            }
            return this;
        },
        createData: function(positions, pOptions) {
            $.extend(
                positions,
                {
                    rows: [],
                    count: 0,
                    index: 0,
                    importQueue: 0,
                    actionsBtns: {}
                },
                B.obj.getValue('initData', pOptions, {}),
                pOptions.unique
                    ? {
                          uniques: {}
                      }
                    : {},
                pOptions.calc
                    ? {
                          sum: null
                      }
                    : {}
            );
            return this;
        },
        addSum: function(sum) {},
        summary: function(positions, pOptions, fn) {
            if (!pOptions.calc) {
                return null;
            }
            fn = fn ? fn : 'getSummary';
            positions.sum = null;
            for (var i in positions.rows) {
                var pos = positions.rows[i],
                    sum = typeof pos[fn] === 'function' ? pos[fn]() : 0;
                B.obj.addSum(positions, sum);

                // var pos=positions.rows[i],
                //     sum= typeof pos[fn] === 'function' ? pos[fn]() : 0;
                // if(positions.summary === null){
                //     positions.summary= B.obj.is(sum) ? B.obj.summary({}, sum) : sum;
                // }else{
                //     if(B.obj.is(positions.summary)){
                //         B.obj.summary(positions.summary, sum);
                //     }else{
                //         positions.summary+=sum;
                //     }
                // }
            }
            return positions.sum;
        },
        add: function($position, positions, pOptions) {
            var position = $position[pOptions.posWidget](
                $.extend(
                    true,
                    {
                        parent: this,
                        formName: this.options.formName,
                        dimensionsUnit: this.options.dimensionsUnit,
                        index: positions.index,
                        nr: positions.count + 1,
                        ecn: pOptions.ecn,
                        templates: pOptions.templates || {}
                    },
                    pOptions.itemOptions || {}
                )
            ).data('bajt' + B.str.firstUpper(pOptions.posWidget));
            positions.rows.push(position);
            positions.index++;
            positions.count++;
            return position;
        },
        bind: function(positions, pOptions) {
            this._on(positions.$container, this._addBind(pOptions.bind));
            this._bindButtons(positions.actionButtons, '_posAction');
            // if (B.obj.is(positions.actionButtons)) {
            //     for (var a in positions.actionButtons) {
            //         if (B.obj.is$(positions.actionButtons[a])) {
            //             this._on(
            //                 positions.actionButtons[a],
            //                 this._addBind({ click: '_posAction' + B.str.firstUpper(a) })
            //             );
            //         }
            //     }
            // }
            return this;
        },
        import: function(positions, pOptions, importData, options) {
            var posECN = pOptions.ecn;
            if ($.isArray(importData) && importData.length > 0 && this.allowedOperation('import' + posECN)) {
                positions.importQueue = importData.length;
                for (var i = 0, ien = importData.length; i < ien; i++) {
                    this._posNew(this._posImportData(importData[i], posECN), {}, posECN);
                }
            }
            return this;
        },
        initPositions: function(positions, pOptions) {
            var that = this;
            _pUtils.createData.call(this, positions, pOptions);
            positions.$container.find(pOptions.rowSelector).each(function() {
                that._$posInit($(this), pOptions.ecn);
            });
            if (pOptions.calc) {
                this._posSummary(null, pOptions.ecn);
            }
            positions.$container.trigger('init' + pOptions.ecn);
            return this;
        },
        navigate: function(positions, pOptions, eventData) {
            var _trigger =function(){
                    if(B.obj.is(eventData.field)){
                        eventData.field.element.trigger('navigate-success');
                    }else if(B.obj.is(eventData.position)){
                        eventData.position.element.trigger('navigate-success');                       
                    }
                },
                step = eventData.step === 3 ? 1 : eventData.step,
                fieldName = eventData.step === 3 ? pOptions.focusField || 0 : eventData.field.option('name'),
                i = positions.rows.indexOf(eventData.position) + step;
            while (i >= 0 && i <= positions.count && positions.rows[i] === undefined) {
                i += step;
            }
            if (positions.rows[i]) {
                positions.rows[i].focus(fieldName, eventData);
                _trigger();
            } else if (pOptions.autoNew && i > 0) {
                this._posNew({}, { focusField: fieldName, eventData: eventData }, pOptions.ecn);
                _trigger();
            }
        },
        numerate: function(positions, pOptions) {
            for (var i = 0; i < positions.length; i++) {
                positions[i].setNr(i + 1);
            }
        },
        new: function(positions, pOptions, values, options) {
            if (!this.allowedOperation('new' + pOptions.ecn, $.extend({ values: values }, options || {}))) {
                return null;
            }
            var that = this,
                $newPosition = $(B.html.getPrototypeTmpl(pOptions.prototype, pOptions.prototypeName, positions.index)),
                position,// = this._posAdd($newPosition, pOptions.ecn),
                _showCallback = function() {
                    // $newPosition.initFormWidgets();
                    // that.state('changing');
                    // position.setValues(values);
                    // that.state('normal');
                    position.focus(B.obj.getValue('focusField', options, pOptions.focusField));
                    if (typeof positions.importQueue === 'number') {
                        if (positions.importQueue > 1) {
                            positions.importQueue--;
                        } else {
                            positions.importQueue = 0;
                        }
                    }
                    that.element.trigger('new' + pOptions.ecn);
                    positions.$container.trigger('changed', { positions: positions, summary: pOptions.calc });
                };
            this.state('changing');
            positions.$container.append($newPosition);
            position = this._$posInit($newPosition, pOptions.ecn);
            this._callFunction('_customPosNew', position, values);
            this.state('normal');
            if (pOptions.animate) {
                $newPosition.slideDown('fast', _showCallback);
            } else {
                $newPosition.show(_showCallback);
            }
            return $newPosition;
        },
        remove: function(positions, pOptions, position, options) {
            var that = this,
                $position = position.element,
                unique = $position.data('unique'),
                _hideCallback = function() {
                    $position.remove();
                    positions.rows.splice(positions.rows.indexOf(position), 1);
                    positions.count--;
                    if (B.obj.is(positions.uniques)) {
                        delete positions.uniques[unique];
                    }
                    positions.$container.trigger('remove' + pOptions.ecn);
                    positions.$container.trigger('changed', { positions: positions, summary: pOptions.calc });
                };
            this._callFunction('_customPosRemove', position);
            if (pOptions.animate) {
                $position.slideToggle('fast', _hideCallback);
            } else {
                $position.hide(_hideCallback);
            }
        },
        clear: function(positions, pOptions) {
            _pUtils.createData.call(this, positions, pOptions);
            positions.$container.empty();
            positions.$container.trigger('empty' + pOptions.ecn);
            positions.$container.trigger('changed', { positions: positions, summary: pOptions.calc });
            return this;
        },
        setDefault: function(positions, pOptions, fieldName) {
            for (var i in positions.rows) {
                positions.rows[i].setDefault(fieldName);
            }
            return this;
        }
    };

    $.extend(true, B, {
        extFormPositions: {
            options: {
                animate: true,
                positionsOptions: {
                    ecn: '',
                    animate: true,
                    autoNew: true,
                    rowSelector: '.row-pos',
                    widget: 'formPosition',
                    unique: false,
                    bind: {
                        formPosition_remove: '_posActionRemove'
                    }
                },
                extraBind: {}
            },
            _bindPositions: function() {
                _pUtils.bind.call(this, this._positions, this.options.positionsOptions);
                return this;
            },
            _blockPositions: function(block) {
                _pUtils.block.call(this, this._positions, block);
            },
            _change: function(e, data) {
                stopTrigger(e);
                if (!this.allowedOperation('changeForm')) {
                    return;
                }
                this.state('changing');
                if (B.obj.is(data.field)) {
                    var set = data.field.option('setField');
                    if (set) {
                        this.setDefaultPositions(set);
                    }
                }
                if (data.calc) {
                    this._callFunction('calc', { eventData: data });
                }
                if (data.summary) {
                    this._callFunction('summary', { eventData: data });
                }
                if (B.obj.is(data.positions)) {
                    this.numerate(data.positions.ecn);
                }
                this._setChanged(true);
                this._callFunction('_customChange', data);
                this.state('normal');
            },
            _create: function() {
                this.state('init');
                this._custom()
                    ._createBasicControls()
                    ._createBasicOptions()
                    ._build()
                    ._createData()
                    ._createFields()
                    ._createPositions();
                this._callFunction('_customCreate');
                this._initExpBtns()
                    ._bind()
                    ._bindPositions();
                this.state('start');
            },
            _createPositions: function() {
                this._positions = {};
                this._create$Positions()
                    ._createPositionsActionsBtns()
                    ._initPositions();
                return this;
            },
            _create$Positions: function() {
                _pUtils.create$Positions.call(this, this._positions, this.options.positionsOptions);
                this._callFunction('_customCreate$Positions');
                return this;
            },
            _createPositionsData: function() {
                return _pUtils.createData.call(this, this._positions, this.options.positionsOptions);
            },
            _createPositionsActionsBtns: function() {
                return _pUtils.createActionsBtns.call(this, this._positions, this.options.positionsOptions);
            },
            _initPositions: function() {
                return _pUtils.initPositions.call(this, this._positions, this.options.positionsOptions);
            },
            _navigateFieldsEvent: function(e, data) {
                stopTrigger(e);
                if (B.obj.is(data.position)) {
                    this._navigatePositions(data);
                } else {
                    this._navigateFields(data);
                }
            },
            _navigateCtrlEvent: function(e, data) {
                if (B.obj.is(data) && B.obj.is(data.position)) {
                    //SPRAWDZIĆ
                    stopTrigger(e);
                    var pTarget = data.position.option('nr') - 1 + data.step,
                        positions = this._positions[data.position.option('ecn')];
                    if (0 <= pTarget && pTarget < positions.count) {
                        data.target = data.index;
                        positions.element.find('.row-data').naviElement(null, data);
                    }
                }
            },
            _navigatePositions: function(data) {
                _pUtils.navigate.call(this, this._positions, this.options.positionsOptions, data);

                // var o = this.options,
                //     po = o.positionsOptions,
                //     step = data.step === 3 ? 1 : data.step,
                //     fieldName = data.step === 3 ? po.focusField || 0 : data.field.option('name'),
                //     i = this._positions.rows.indexOf(data.position) + step;
                // while (i >= 0 && i <= this._positions.index && this._positions.rows[i] === undefined) {
                //     i += step;
                // }
                // if (this._positions.rows[i]) {
                //     this._positions.rows[i].focus(fieldName, data);
                // } else if (po.autoNew && i > 0) {
                //     this._posNew({}, { focusField: fieldName, eventData: data } );
                // }
            },
            _posActionAdd: function(e) {
                stopTrigger(e);
                this._posNew();
            },
            _posActionClear: function(e) {
                stopTrigger(e);
                this.clear();
            },
            _posActionRemove: function(e, data) {
                stopTrigger(e);
                this._posRemove(data.position);

                // var that = this,
                //     _positions = this._positions,
                //     $position = data.position.element,
                //     unique = $position.data('unique'),
                //     _hideCallback = function() {
                //         $position.remove();
                //         _positions.rows.splice(_positions.rows.indexOf(data.position), 1);
                //         _positions.count--;
                //         if (B.obj.is(_positions.uniques)) {
                //             delete that._positions.uniques[unique];
                //         }
                //         that.element.trigger('formPositions_remove', data);
                //     };
                // this._callFunction('_customPosRemove', data);
                // if (this.options.animate) {
                //     $position.slideToggle('fast', _hideCallback);
                // } else {
                //     $position.hide(_hideCallback);
                // }
            },
            _posAdd: function($position) {
                return _pUtils.add.call(this, $position, this._positions, this.options.positionsOptions);
            },
            _posImportData: function(inData) {
                return inData;
            },
            _posNew: function(values, options) {
                return _pUtils.new.call(this, this._positions, this.options.positionsOptions, values, options);
            },
            _posRemove: function(position) {
                return _pUtils.remove.call(this, this._positions, this.options.positionsOptions, position);
            },
            _posSummary: function(fn) {
                this.sum = _pUtils.summary.call(this, this._positions, this.options.positionsOptions, fn);
                return this.sum;
            },
            _$posInit: function($position) {
                var position = this._posAdd($position);
                if (this.options.positionsOptions.unique) {
                    this._uniqueSet(position);
                }
                return position;
            },
            _uniqueGen: function(values) {
                return values.id || values.V;
            },
            _uniqueSet: function(position, values) {
                if (!B.obj.is(values)) {
                    values = position.getValues(['id', 'v']);
                }
                var unique = this._uniqueGen(values);
                this._positions.uniques[unique] = 'new';
                position.element.data('unique', unique);
                return unique;
            },
            _validatePositions: function() {
                var positions = this._positions.rows;
                for (var i in positions) {
                    var pvalid = positions[i].validate();
                    if (pvalid.msg) {
                        this._initValid();
                        this.valid.add(pvalid);
                    }
                }
                return this.valid;
            },
            block: function(block) {
                var blockStatus = block ? 1 : 0;
                if (this._blockStatus !== blockStatus) {
                    this._blockStatus = blockStatus;
                    this._blockPositions(block);
                    B.basicForm.block.call(this, block);
                }
                return this;
            },
            calc: function(options) {
                console.log('extFormPositions.calc');
                console.log(options);
                var pos = B.obj.getValue('eventData.position', options, options.position);
                if (this.options.positionsOptions.calc) {
                    if (B.obj.is(pos)) {
                        pos.calc();
                    }
                    this._posSummary();
                }
            },
            clear: function() {
                return _pUtils.clear.call(this, this._positions, this.options.positionsOptions);
            },
            importPositions: function(importData) {
                var po = this.options.positionsOptions;
                _pUtils.import.call(this, this._positions, this.options.positionsOptions, importData);
                return this;
            },
            numerate: function() {
                return _pUtils.numerate.call(this, this._positions, this.options.positionsOptions);
            },
            setDefaultPositions: function(fieldName) {
                return _pUtils.setDefault.call(this, this._positions, this.options.positionsOptions);
            },
            summary: function(options) {
                console.log('extFormPositions.summary');
                console.log(options);
                this._posSummary(null);
                this._sumVal();
                return this.getSummary();
                // return this.sum;
            },
            validate: function() {
                if (!this.inState('valid') && this.allowedOperation('validate')) {
                    this.valid.init();
                    this._validateFields();
                    this._validatePositions();
                    this._callFunction('_customValidate');
                    if (this.valid.msg) {
                        this.showMessages(this.valid.msg);
                    }
                    this.state(this.valid.valid !== 'e' ? 'valid' : 'notValid');
                }
                return this.valid;
            }
        }
    });

    $.extend(true, B, {
        extFormMultiPositions: {
            options: {
                animate: true,
                defaultPositionsOptions: {
                    animate: true,
                    autoNew: true,
                    rowSelector: '.row-pos',
                    unique: false,
                    bind: {
                        formPosition_remove: '_posActionRemove'
                    }
                },
                positionsOptions: {},
                extraBind: {}
            },
            _bindPositions: function() {
                for (var p in this.options.positionsOptions) {
                    _pUtils.bind.call(this, this._positions[p], this.options.positionsOptions[p]);
                }
                return this;
            },
            _blockPositions: function(block, positionsECN) {
                this._posCallFunction(_pUtils.block, positionsECN, block);
                return this;
            },
            _create: B.extFormPositions._create,
            _change: B.extFormPositions._change,
            _createPositions: function() {
                this._positions = {};
                for (var p in this.options.positionsOptions) {
                    this._positions[p] = {};
                    this._create$Positions(p)
                        ._createPositionsActionsBtns(p)
                        ._initPositions(p);
                }
                return this;
            },
            _create$Positions: function(positionsECN) {
                var o = this.options,
                    po = o.positionsOptions[positionsECN];
                if (!isSet(po.ecn)) {
                    po.ecn = positionsECN;
                }
                B.obj.supplement(po, o.defaultPositionsOptions);
                _pUtils.create$Positions.call(this, this._positions[positionsECN], po);
                this._callFunction('_customCreate$Positions' + positionsECN);
                return this;
            },
            _createPositionsData: function(positionsECN) {
                return _pUtils.createData.call(
                    this,
                    this._positions[positionsECN],
                    this.options.positionsOptions[positionsECN]
                );
            },
            _createPositionsActionsBtns: function(postionsECN) {
                return _pUtils.createActionsBtns.call(
                    this,
                    this._positions[postionsECN],
                    this.options.positionsOptions[postionsECN]
                );
            },
            _initPositions: function(positionsECN) {
                return _pUtils.initPositions.call(
                    this,
                    this._positions[positionsECN],
                    this.options.positionsOptions[positionsECN]
                );
            },
            _navigateFieldsEvent: B.extFormPositions._navigateFieldsEvent,
            _navigateCtrlEvent: function(e, data) {
                if (B.obj.is(data) && B.obj.is(data.position)) {
                    //SPRAWDZIĆ
                    stopTrigger(e);
                    var pTarget = data.position.option('nr') - 1 + data.step,
                        positions = this._positions[data.position.option('ecn')];
                    if (0 <= pTarget && pTarget < positions.count) {
                        data.target = data.index;
                        positions.element.find('.row-data').naviElement(null, data);
                    }
                }
            },
            _navigatePositions: function(data) {
                var posECN = data.position.option('ecn');
                _pUtils.navigate.call(this, this._positions[posECN], this.options.positionsOptions[posECN], data);

                // var o = this.options,
                //     pos_ecn = data.position.option('ecn'),
                //     po = o.positionsOptions[pos_ecn],
                //     step = data.step === 3 ? 1 : data.step,
                //     fieldName = data.step === 3 ? po.focusField || 0 : data.field.option('name'),
                //     positions = this._positions[pos_ecn],
                //     i = positions.rows.indexOf(data.position) + step;
                // while (i >= 0 && i <= positions.index && positions.rows[i] === undefined) {
                //     i += step;
                // }
                // if (positions.rows[i]) {
                //     positions.rows[i].focus(fieldName, data);
                // } else if (po.autoNew && i > 0) {
                //     this._posNew(data, pos_ecn, { focusField: fieldName, eventData: data} );
                // }
            },
            _posActionClear: function(e) {
                //dopracować przekazać posECN
                stopTrigger(e);
                var $btn = $(e.currentTarget),
                    posECN = $btn.data('positions-add');
                this.clear(posECN);
            },
            _posActionAdd: function(e) {
                stopTrigger(e);
                var $btn = $(e.currentTarget),
                    posECN = $btn.data('positions-add');
                this._posNew({}, {}, posECN);
            },
            _posActionRemove: function(e, data) {
                stopTrigger(e);
                this._posRemove(data.position);

                // var that = this,
                //     $position = data.position.element,
                //     positions = this._positions[data.position.option('ecn')];
                // $position.slideToggle('fast', function() {
                //     $position.remove();
                //     positions.rows.splice(positions.rows.indexOf(data.position), 1);
                //     positions.count--;
                //     that._callFunction('calc');
                //     that.callFunction('_checkStatus');
                //     that.element.trigger('formPositions_remove', data);
                // });
            },
            _posAdd: function($position, postionsECN) {
                return _pUtils.add.call(
                    this,
                    $position,
                    this._positions[postionsECN],
                    this.options.positionsOptions[postionsECN]
                );
            },
            _posNew: function(values, options, positionsECN) {
                return _pUtils.new.call(
                    this,
                    this._positions[positionsECN],
                    this.options.positionsOptions[positionsECN],
                    values,
                    options
                );
            },
            _posRemove: function(position) {
                var posECN = position.option('ecn');
                return _pUtils.remove.call(
                    this,
                    this._positions[posECN],
                    this.options.positionsOptions[posECN],
                    position
                );
            },
            _posSummary: function(fn, positionsECN) {
                var p;
                this._posCallFunction(_pUtils.summary, positionsECN, fn);
                // if (!positionsECN) {
                //     for (p in this._positions) {
                //         _pUtils.summary.call(this, this._positions[p], this.options.positionsOptions[p], fn);
                //     }
                // } else if (B.obj.is(positionsECN)) {
                //     for (p in positionsECN) {
                //         _pUtils.summary.call(
                //             this,
                //             this._positions[positionsECN[p]],
                //             this.options.positionsOptions[positionsECN[p]],
                //             fn
                //         );
                //     }
                // } else {
                //     _pUtils.summary.call(
                //         this,
                //         this._positions[positionsECN],
                //         this.options.positionsOptions[positionsECN],
                //         fn
                //     );
                // }
                this.sum = null;
                for (p in this._positions) {
                    if (this.options.positionsOptions[p].calc) {
                        B.obj.addSum(this, this._positions[p].sum);
                    }
                }
                return this.sum;
            },
            _$posInit: function($position, postionsECN) {
                return this._posAdd($position, postionsECN);
            },
            _posImportData: function(inData, positionsECN) {
                return inData;
            },
            _posCallFunction: function(posFunction, positionsECN) {
                var p,
                    args = [];
                for (var i = 2; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }
                if (!positionsECN) {
                    for (p in this._positions) {
                        posFunction.apply(this, [this._positions[p], this.options.positionsOptions[p]].concat(args));
                    }
                } else if (B.obj.is(positionsECN)) {
                    for (p in positionsECN) {
                        posFunction.apply(
                            this,
                            [this._positions[positionsECN[p]], this.options.positionsOptions[positionsECN[p]]].concat(
                                args
                            )
                        );
                    }
                } else {
                    var a = [this._positions[positionsECN], this.options.positionsOptions[positionsECN]].concat(args);
                    posFunction.apply(
                        this,
                        [this._positions[positionsECN], this.options.positionsOptions[positionsECN]].concat(args)
                    );
                }
                return this;
            },
            block: B.extFormPositions.block,
            calc: function(options) {
                console.log('extFormMultiPositions.calc');
                console.log(options);
                var pos = B.obj.is(options) ? B.obj.getValue('eventData.position', options, options.position) : null;
                if (B.obj.is(pos)) {
                    var posECN = pos.option('ecn');
                    if (this._options.positionsOptions[posECN]) {
                        this._posSummary('calc', pos.option('ecn'));
                    }
                } else {
                    this._posSummary('calc');
                }
            },
            clear: function(positionsECN) {
                this._posCallFunction(_pUtils.clear, positionsECN);
                // return _pUtils.clear.call(
                //     this,
                //     this._positions[positionsECN],
                //     this.options.positionsOptions[positionsECN]
                // );
                return this;
            },
            numerate: function(positionsECN) {
                this._posCallFunction(_pUtils.numerate, positionsECN);
                // return _pUtils.numerate.call(
                //     this,
                //     this._positions[positionsECN],
                //     this.options.positionsOptions[positionsECN]
                // );
                return this;
            },
            setDefaultPositions: function(fieldName, positionsECN) {
                this._posCallFunction(_pUtils.setDefault, positionsECN, fieldName);
                return this;
            },
            summary: function(options) {
                console.log('extFormMultiPositions.summary');
                console.log(options);
                var posECN;
                if (B.obj.is(options)) {
                    var positions = B.obj.getValue('eventData.positions', options, options.positions),
                        position = B.obj.getValue('eventData.position', options, options.position);
                    if (B.obj.is(position)) {
                        posECN = position.option('ecn');
                    } else {
                        posECN = B.obj.getValue('ecn', positions);
                    }
                }
                this._posSummary(null, posECN);
                return this.getSummary();
            },
            importPositions: function(importData, positionsECN) {
                return _pUtils.import.call(
                    this,
                    this._positions[positionsECN],
                    this.options.positionsOptions[positionsECN],
                    importData
                );
            }
        }
    });
})(jQuery, Bajt);

// _posNew: function(focusField, values, eventData) {
//     if (!this.allowedOperation('newPosition', values)) {
//         return;
//     }
//     var that = this,
//         o = this.options,
//         po = o.positionsOptions,
//         _positions = this._positions,
//         $newPosition = $(B.html.getPrototypeTmpl(po.prototype, po.prototypeName, _positions.index)), // $(po.prototype.replace(/__pn__/g, this._positions.index)),
//         position = this._posAdd($newPosition, values),
//         _showCallback = function() {
//             $newPosition.initFormWidgets();
//             that.state('changing');
//             position.setValues(values);
//             that.state('normal');
//             position.focus(focusField, eventData);
//             if (typeof that.importQueue === 'number') {
//                 if (that.importQueue > 1) {
//                     that.importQueue--;
//                 } else {
//                     delete that.importQueue;
//                     that._callFunction('calc');
//                 }
//             }
//             that.element.trigger('formPositions_new');
//         };
//     this._callFunction('_customPosNew', position, values);
//     $newPosition.appendTo(this._positions.$container);
//     if (o.animate) {
//         $newPosition.slideDown('fast', _showCallback);
//     } else {
//         $newPosition.show(_showCallback);
//     }
//     return $newPosition;
// },

// function VALID() {
//     var states = ['u', 's', 'i', 'w', 'e'],
//         classes = {
//             u: '',
//             w: 'has-warning',
//             e: 'has-error',
//             s: '',
//             i: 'has-info'
//         };
//     this.setActual = function(state) {
//         if (states.indexOf(state) > states.indexOf(this.valid)) {
//             this.valid = state;
//             this.msg.type = state;
//         }
//     };
//     this.add = function(valid) {
//         this.setActual(valid.valid);
//         if (valid.msg) {
//             this.msg.addChild(valid.msg);
//         }
//     };
//     this.clear = function() {
//         this.valid = 'u';
//         this.msg = null;
//     };
//     this.getClass = function(all) {
//         if (all) {
//             var c = [];
//             for (var t in classes) {
//                 if (classes[t] !== '') {
//                     c.push(classes[t]);
//                 }
//             }
//             return c.join(' ');
//         }
//         return classes[this.valid];
//     };
//     this.init = function(type, msg) {
//         if (type && msg) {
//             this.valid = type;
//             this.msg = new Msg(msg, type);
//         } else {
//             this.clear();
//         }
//     };
//     this.clear();
// }

// function getFieldType(element, element2) {
//     element2 = typeof element2 !== 'undefined' ? element2 : element;
//     var fieldType = $(element).attr('field-type');
//     if (!isSet(fieldType)) {
//         fieldType = $(element2).prop('tagName');
//     }
//     return fieldType ? fieldType.toUpperCase() : '';
// }

// obsługa wyświetlania informacji o błędach
// $('.form-control').mouseover(function () {
//     var p = this.parentElement;
//     if ($(p).hasClass('has-error')) {
//         $(p).find('.message-field').slideDown();
//     }
// });

// $('.form-control').mouseout(function () {
//     $(this.parentElement).find('.message-field').slideUp('fast');
// });
// end
(function($, B) {
    'use strict';
    $.extend(true, B, {
        basicForm: $.extend(true, {}, B.basicWidget, {
            options: {
                animate: 'fast',
                states: ['normal', 'changing', 'validate', 'submit', 'submitSuccess', 'submitError'],
                formFields: {},
                fieldOptions: {},
                locale: {
                    form: 'Formularz',
                    save: 'Zapisz',
                    confirm: 'Potwierdź'
                },
                stopWarning: true,
                stopInfo: true,
                // msgClass: {
                //     e: 'alert-danger',
                //     w: 'alert-warning',
                //     s: 'alert-success',
                //     i: 'alert-info'
                // },
                confirmationClose: {
                    content: 'Chcesz zrezygnować ze zmian?'
                },
                expBtns: false,
                formBind: {
                    changed: '_change',
                    // change: this._change,
                    submit: '_submit',
                    navigate: '_navigateEvent'
                },
                extraBind: {}
            },
            _addField: function(name, options) {
                var that = this,
                    o = this.options,
                    element = this._findFieldElement(name);
                if (element) {
                    this._fieldsByName[name] = element
                        .field(
                            $.extend(
                                true,
                                {
                                    name: name,
                                    ecn: this._getFieldEntityClass(name),
                                    parent: that,
                                    formName: o.formName,
                                    limits: this.getLimits(name)
                                },
                                options
                            )
                        )
                        .data('bajtField');
                    this._fields.push(this._fieldsByName[name]);
                }
            },
            _bind: function() {
                this._bindForm();
                return this;
            },
            _bindForm: function() {
                var o = this.options,
                    bind = this._addBind(o.formBind);
                this._addBind(o.extraBind);
                this._on(this.element, bind);
                this._bindButtons();
                if( B.obj.isNotEmpty(this.$statusBtns)){
                    this._bindButtons(this.$statusBtns, '_statusAction');
                }                
                return this;
            },
            _blockFields:function(block, fields){
                if(!$.isArray(fields)){
                    fields=Object.keys(this._fieldsByName);
                }
                if(B.obj.isIterate(fields) ){
                    for (var f in fields) {
                        this._fieldsByName[fields[f]].block(block);
                    }
                }
                return this;
            },
            _blockStatus: 0,
            _change: function(e, data) {
                stopTrigger(e);
                // console.log('basicForm change');
                if (!this.allowedOperation('changeForm')) {
                    return;
                }
                this.state('changing');
                if (data.calc) {
                    this._callFunction('calc', { eventData: data });
                }
                if (data.summary) {
                    this._callFunction('summary', { eventData: data });
                }
                this._setChanged(true);
                //            this.$return.hide();
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
                    ._createFields();
                this._callFunction('_customCreate');
                // this._callFunction('calc');
                this._initExpBtns()._bind();
                this.state('start');
            },
            _createBasicControls: function() {
                var that = this,
                    o=this.options;
                this.$messages = this.element.find('.form-messages');
                this.$errors = this.element.find('.form-errors');
                this.$submit = this.element
                    .find('[type=submit]')
                    .attr('data-content', 'Nie dokonano zmian')
                    .popover({ placement: 'auto', trigger: 'manual' })
                    .on('mouseleave', function() {
                        that.$submit.popover('hide');
                    });
                this.$return = this.element.find('.btn[data-return]');
                this.$close = this.element
                    .find('.btn[data-close]')
                    .attr('data-toggle', 'confirmation')
                    .confirmation($.extend({}, B.confirmationOptions, this.options.confirmationClose || {}));
                // this.$close.on('mouseleave', function(){
                //     that.$close.confirmation('hide');
                // });
                this.$expBtns = this.element.find('[data-exp]');
                if(B.obj.isNotEmpty(o.statusButtons)){
                    this.$statusBtns={};
                    for(var i in o.statusButtons){
                        this.$statusBtns[i]=this.element.find('#btn_status_'+i);
                    }
                }
                this._callFunction('_customCreateBasicControls');
                return this;
            },
            _createBasicOptions: function() {
                var o = this.options;
                $.extend(true, o, this.element.data());
                o.entitySettings = B.getEntitySettings(o.ecn);
                o.formName = this.element.attr('name');
                o.fieldSelectorPrefix = '#' + o.formName + '_';
                o.locale.save = this.$submit.attr('label');
                this._callFunction('_customCreateBasicOptions');
                return this;
            },
            _createData: function() {
                B.basicWidget._createData();
                this._fields = [];
                this._fieldsByName = {};
                this._state = null;
                this._status = null;
                this.changed = true;
                this.exp = true;
                this.valid = new Valid();
                this.confirm = false;
                this.entityData = this.element.data('entity-data') || null;
                this._callFunction('_customCreateData');
                return this;
            },
            _createFields: function() {
                // console.log('basicForm - _initFields');
                var o = this.options;
                for (var k in o.formFields) {
                    var fieldName,
                        options = {};
                    if (B.obj.is(o.formFields[k])) {
                        fieldName = o.formFields[k].name;
                        if (o.formFields[k].hasOwnProperty('options')) {
                            options = o.formFields[k].options;
                        }
                        if (options.hasOwnProperty('dictionary') && !B.obj.is(options.dictionary)) {
                            options.dictionary = this.getDictionary(
                                typeof options.dictionary === 'string' ? options.dictionary : fieldName
                            );
                        }
                    } else {
                        fieldName = o.formFields[k];
                    }
                    this._addField(fieldName, this._customFieldOptions(fieldName, options));
                }
                return this;
            },
            _customFieldOptions: function(fieldName, options) {
                var fo = this.options.fieldOptions;
                if (B.obj.is(fo) && fo[fieldName]) {
                    var customOptions = {};
                    if (typeof fo[fieldName] === 'function') {
                        customOptions = fo[fieldName].call(this, fieldName);
                    } else if (B.obj.is(fo[fieldName])) {
                        customOptions = fo[fieldName];
                    }
                    if (B.obj.is(customOptions)) {
                        $.extend(true, options, customOptions);
                    }
                }
                return options;
            },
            _details: function(e) {
                this.element.find('.row-info').slideToggle();
            },
            _findFieldElement: function(name) {
                var $field = this.element.find(this.options.fieldSelectorPrefix + name);
                return B.obj.is$($field) ? $field : false;
            },
            _getFieldEntityClass: function(fieldName) {
                var o = this.options,
                    fields = o.entitySettings.fields;
                return B.obj.is(fields.childs) && fields.childs.hasOwnProperty(fieldName)
                    ? fields.childs[fieldName]
                    : o.ecn;
            },
            _initExpBtns: function() {
                if (this.options.expBtns) {
                    this.element.initExpBtns({
                        entitySettings: this.options.entitySettings
                    });
                }
                return this;
            },
            _initValid: function() {
                if (!this.valid.msg) {
                    this.valid.init(
                        's',
                        new Msg({
                            title: this._locale('form', 'Formularz'),
                            message: ''
                        })
                    );
                }
                return this.valid;
            },
            _navigateCtrlEvent: function(e, data) {},
            _navigateEvent: function(e, data) {
                if (B.obj.is(data) && B.obj.is(data.field)) {
                    this._navigateFieldsEvent(e, data);
                } else {
                    this._navigateCtrlEvent(e, data);
                }
            },
            _navigateFields: function(data) {
                var step = data.step === 3 ? 1 : data.step,
                    fieldName = data.field.option('name'),
                    fc = this._fields.length,
                    i = this._fields.indexOf(data.field) + step;
                while (i >= 0 && i < fc && !this._fields[i].option('navi')) {
                    i += step;
                }
                if (B.obj.is(this._fields[i])) {
                    this._fields[i].focus(data);
                    data.field.element.trigger('navigate-success');                
                }
                
            },
            _navigateFieldsEvent: function(e, data) {
                stopTrigger(e);
                this._navigateFields(data);
            },
            _setChanged: function(changed) {
                this.changed = changed ? true : false;
                if (this.changed) {
                    this.$close.confirmation('enable');
                } else {
                    this.$close.confirmation('disable');
                }
            },
            _setConfirm: function(confirm) {
                this.confirm = confirm ? true : false;
                this.$submit
                    .find('.text')
                    .text(this.confirm ? this._locale('confirm', 'Potwierdzam') : this._locale('save', 'Zapisz'));
            },
            _showExports: function(clear) {
                // console.log('showExports' + clear);
                if (clear) {
                    this.element.data('entity-data', null);
                }
                this.element.toggleExpBtns(this.allowedOperation('showExports'));
            },
            _showStatusBtn: function() {
                if( B.obj.isNotEmpty(this.$statusBtns)){
                    var status = this._statusRead(),
                        o = this.options;
                    for (var t in this.$statusBtns) {
                        var sBtns = o.statusButtons[t];
                        if (this.allowedOperation(t + 'Status')) {
                            var opt = sBtns[status],
                                rm_class = [];
                            for (var i in sBtns) {
                                if (Number(i) !== status && sBtns[i].addClass) {
                                    rm_class.push(o.sBtns[i].addClass);
                                }
                            }
                            this.$statusBtns[t].find('.fa').changeIcon(opt.icon);
                            this.$statusBtns[t].find('.text').html(opt.label);
                            this.$statusBtns[t]
                                .removeClass(rm_class.join(' '))
                                .addClass(opt.addClass)
                                .attr('title', opt.title)
                                .show();
                        } else {
                            this.$statusBtns[t].hide();
                        }
                    }
                }
                return this;
            },
            _showReturn: function() {
                if (this.allowedOperation('return')) {
                    this.$return.show();
                } else {
                    this.$return.hide();
                }
                return this;
            },
            _statusRead: function() {
                this._status = B.obj.is(this._fieldsByName['status']) ?  Number(this._fieldsByName['status'].value()) : 0;
                return this._status;
            },
            _statusSet: function(status) {
                this._status = status;
                if(B.obj.is(this._fieldsByName['status'])){
                    this._fieldsByName['status'].value(status);
                }
            },
            _statusActionNext: function(e) {
                this._statusSet(this._status+1);
            },
            _statusActionPrev: function(e) {
                this._statusSet(this._status - 1);
            },
            _submit: function(e, data) {
                stopTrigger(e);
                var action = B.obj.is(data) && data.hasOwnProperty('action') ? data.action : 'submit';
                this._callFunction('_preSubmit');
                // valid = this.validate();
                // if (this.inState('notValid')) return;
                this.block(false);
                var that = this,
                    o = this.options,
                    $form = this.element,
                    url = $form.attr('action'),
                    fdata = B.obj.is(data) && B.obj.is(data.fdata) ? data.fdata : $form.serialize(),
                    $modal = $form.closest('.modal'),
                    $panel = $form.closest('.panel'),
                    isModal = B.obj.is$($modal),
                    isPanel = B.obj.is$($panel),
                    isWindow = !(isModal || isWindow),
                    tableName,
                    dataTable;
                if (isModal) {
                    tableName = $modal.data('table') || $modal.attr('id').replace('_modal', '');
                } else if (isPanel) {
                    tableName = $panel.data('table') || $panel.attr('id').replace('_panel', '');
                }
                if (tableName) {
                    dataTable = B.obj.is(dataTables) ? dataTables[tableName] : null;
                } else if (window.opener) {
                    if (B.obj.is(window.opener.dataTables)) {
                        dataTable = window.opener.dataTables[that.options.entitySettings.en];
                    }
                }
                if (this.state(action, data) !== 'submit') {
                    return;
                }
                $.ajax({
                    type: $form.attr('method'),
                    url: url,
                    data: fdata
                })
                    .done(function(data) {
                        //                        var showMessage=(typeof data.show  !== 'undefined' && data.show === '1') ||B.obj.is$($panel);
                        that.state('changing');
                        if (!o.entityId) {
                            o.entityId = data.id;
                            $form.attr('entity-id', data.id);
                            if (data.toEdit) {
                                var editParam;
                                if (data.hasOwnProperty('edit_param')) {
                                    editParam = data.edit_param;
                                } else {
                                    editParam = {
                                        title: 'Edycja',
                                        urls: {
                                            form: B.url.modify(
                                                $form.attr('action'),
                                                '/create',
                                                '/' + data.id + '/update'
                                            ),
                                            site: B.url.modify(window.location.href, '/new', '/' + data.id + '/edit')
                                        },
                                        submit: {
                                            label: 'Aktualizuj',
                                            title: 'Aktualizuj'
                                        }
                                    };
                                }
                                $form.attr('method', 'PUT').attr('action', editParam.urls.form);
                                that.$submit
                                    .attr('title', editParam.submit.title)
                                    .html(editParam.submit.label)
                                    .val(editParam.submit.label);
                                if (isWindow) {
                                    B.url.setPageTitle(editParam.title);
                                    window.history.replaceState('', '', editParam.urls.site);
                                }
                            } else {
                                that.$submit.hide();
                            }
                        }
                        if (data.hasOwnProperty('fields') && B.obj.is(data.fields)) {
                            for (var n in data.fields) {
                                if (that._fieldsByName.hasOwnProperty(n)) {
                                    that._fieldsByName[n].value(data.fields[n]);
                                }
                            }
                        }
                        that.setEntityData(data.entity_data);
                        that._callFunction('_postSubmit', data);
                        that.state('submitSuccess');
                        $form.trigger('submited', data);
                        if (dataTable) {
                            dataTable.ajax.reload();
                        }
                        if (isModal && !(data.show || data.edit)) {
                            $modal.modal('hide');
                        } else {
                            that.showMessages(data.messages);
                        }
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        that.state('submitError');
                        if (typeof jqXHR.responseJSON !== 'undefined') {
                            if (jqXHR.responseJSON.hasOwnProperty('form_body')) {
                                $form.find('.form_body').html(jqXHR.responseJSON.form_body);
                                console.log('form_errors');
                                $form.initFormWidgets();
                            }
                            that.showErrors(jqXHR.responseJSON.errors);
                        } else if (jqXHR.responseText) {
                            that.showErrors(jqXHR.responseText);
                        } else {
                            alert(errorThrown);
                        }
                    });
            },
            _sumFields: function(fields) {
                var fs = { sum: null };
                if ($.isArray(fields)) {
                    for (var i = 0; i < fields.length; i++) {
                        var field = this.field(fields[i]);
                        B.obj.addSum(fs, field ? field.value() : null);
                    }
                }
                return fs.sum;
            },
            // _sumVal:function(val){
            //     var sumField=this.field(this.options.summaryField);
            //     if(sumField){
            //         return sumField.value(val);
            //     }
            // },
            _sumVal: function() {
                var i,
                    that = this,
                    fname = this.options.summaryField,
                    _setSum = function(name, val) {
                        if (that._fieldsByName.hasOwnProperty(name)) {
                            that._fieldsByName[name].value(B.obj.is(val) ? B.obj.getValue(name, val, 0) : val || 0);
                        }
                    };
                if (fname === undefined) {
                    return null;
                }
                if ($.isArray(fname)) {
                    for (i in fname) {
                        _setSum(fname[i], this.sum[fname[i]]);
                    }
                } else if (B.obj.is(fname)) {
                    for (i in fname) {
                        _setSum(i, this.sum[fname[i]]);
                    }
                } else {
                    _setSum(fname, this.sum);
                }
                //     var sumField=this.field(this.options.summaryField);
                //     if(sumField){
                //         return sumField.value(val);
                //     }
            },
            _validateFields: function() {
                for (var i in this._fields) {
                    var fvalid = this._fields[i].validate();
                    if (fvalid.msg) {
                        this._initValid();
                        this.valid.add(fvalid);
                    }
                }
                return this.valid;
            },
            allowedOperation: function(operation, data) {
                var o = this.options,
                    allow = true,
                    editable = ['start', 'normal', 'confirm', 'submitSuccess', 'submitError'];
                switch (operation) {
                    case 'changeState':
                        break;
                    case 'showExports':
                        allow = this.entityData && !this.changed;
                        break;
                    case 'change':
                        allow = this.inState(editable);
                        break;
                    case 'submit':
                        if (this.changed) {
                            switch (this.validate().valid) {
                                case 'e':
                                    allow = false;
                                    break;
                                case 'w':
                                    allow = !o.stopWarning;
                                    if (o.stopWarning) {
                                        this.state('confirm');
                                    }
                                    break;
                                case 'i':
                                    allow = !o.stopInfo;
                                    if (o.stopInfo) {
                                        this.state('confirm');
                                    }
                                    break;
                                default:
                                    allow = true;
                            }
                        } else {
                            allow = this.confirm || this.$submit.val().toUpperCase() === 'REMOVE';
                            if (!allow) {
                                this.$submit.popover('show');
                            }
                        }
                        break;
                    case 'return':
                        allow = !this.changed;
                        break;
                }
                if (allow) {
                    allow = this._callFunction('_customAllowedOperation', operation, data) === false ? false : allow;
                }
                return allow;
            },
            block: function(block) {
                // console.log('basicForm - block');
                if( (block && this._blockStatus === 0) || (!block && this._blockStatus > 0)){
                    this._blockStatus = block ? 1 : 0;
                    this._blockFields(block);
                    if (B.obj.is$(this.$return)) {
                        this.$return.prop('disabled', block);
                    }
                    if (B.obj.is$(this.$close)) {
                        this.$close.prop('disabled', block);
                    }
                    if (B.obj.is$(this.$submit)) {
                        this.$submit.prop('disabled', block);
                    }
                    if( B.obj.isNotEmpty(this.$statusBtns)){
                        for(var i in this.$statusBtns){
                            this.$statusBtns[i].prop('disabled', block);
                        }
                    }                
                    this._callFunction('_customBlock', block);
                }
                return this;
            },
            calc: function() {},
            close: function() {
                if (window.opener) {
                    if (
                        B.obj.is(window.opener.dataTables) &&
                        window.opener.dataTables.hasOwnProperty(this.options.entitySettings.en)
                    ) {
                        window.opener.dataTables[this.options.entitySettings.en].ajax.reload();
                    } else {
                        window.opener.location.reload();
                    }
                }
            },
            field: function(index) {
                return typeof index === 'number' ? this._fields[index] : this._fieldsByName[index];
            },
            getLimits: function(name) {
                var o = this.options,
                    l = o.limits;
                if (l === undefined && o.hasOwnProperty('entitySettings')) {
                    l = o.entitySettings.limits;
                }
                return B.obj.is(l) && l.hasOwnProperty(name) ? l[name] : null;
            },
            getSummary: function() {
                return this.sum;
                // var sum=this._sumVal();
                // return undefined !== sum ? sum : this.sum || 0;
            },
            inState: function(checkStates) {
                if (!$.isArray(checkStates)) {
                    checkStates = [checkStates];
                }
                return checkStates.indexOf(this._state) >= 0;
            },
            getEntityData: function() {
                return B.obj.is(this.entityData) ? B.entity.fill(this.entityData, this.options.ecn) : null;
            },
            getValues: function(fields) {
                var i,
                    values = {};
                if ($.isArray(fields)) {
                    for (i in fields) {
                        if (this._fieldsByName.hasOwnProperty(fields[i])) {
                            values[fields[i]] = this._fieldsByName[fields[i]].value();
                        }
                    }
                } else {
                    for (i in this._fieldsByName) {
                        values[i] = this._fieldsByName[i].value();
                    }
                }
                return values;
            },
            setEntityData: function(entityData) {
                if (B.obj.is(entityData)) {
                    this.entityData = entityData;
                } else {
                    this.entityData = null;
                }
                this.element.data('entity-data', entityData);
            },
            setValues: function(values) {
                for (var name in values) {
                    if (this._fieldsByName.hasOwnProperty(name)) {
                        this._fieldsByName[name].value(values[name]);
                    }
                }
            },
            state: function(state, data) {
                if (state !== undefined && this.allowedOperation(state, data)) {
                    this._state = state;
                    switch (
                        state //operacje przy zmianie stanu
                    ) {
                        case 'init':
                            break;
                        case 'start':
                            // console.log('state start');
                            this.block(false);
                            this.$submit.popover('hide');
                            this._setChanged(false);
                            this._setConfirm(false);
                            this.showMessages();
                            this._showStatusBtn();
                            this._showExports();
                            break;
                        case 'normal':
                            // console.log('state normal');
                            this.block(false);
                            this.$submit.popover('hide');
                            this.showMessages();
                            this._showStatusBtn();
                            this._showExports();
                            break;
                        case 'changing':
                            // console.log('state changing');
                            this.showMessages();
                            this._showExports('clear');
                            break;
                        case 'validate':
                            // console.log('state validate');
                            break;
                        case 'confirm':
                            this.changed = false;
                            this._setConfirm(true);
                            break;
                        case 'submit':
                            // console.log('state submit');
                            this.block(true);
                            this.showErrors();
                            this.showMessages({
                                message: 'Trwa zapis do bazy danych',
                                type: 'i'
                            });
                            break;
                        case 'submitSuccess':
                            this.block(false);
                            this._setChanged(false);
                            this._setConfirm(false);
                            this._showReturn();
                            this._showStatusBtn();
                            this._showExports();
                            break;
                        case 'submitError':
                            this.block(false);
                            this._setConfirm(false);
                            this.showMessages();
                            break;
                    }
                    this._callFunction('_customState', state, data);
                }
                return this._state;
            },
            summary: function() {},
            update: function(values) {
                for (var name in values) {
                    if (this._fieldsByName.hasOwnProperty(name)) {
                        this._fieldsByName[name].update(values[name]);
                    }
                }
            },
            validate: function() {
                if (!this.inState('valid') && this.allowedOperation('validate')) {
                    this.valid.init();
                    this._validateFields();
                    this._callFunction('_customValidate');
                    if (this.valid.msg) {
                        this.showMessages(this.valid.msg);
                    }
                    this.state(this.valid.valid !== 'e' ? 'valid' : 'notValid');
                }
                return this.valid;
            }
        })
    });

    $.widget(
        'bajt.ajaxForm',
        $.extend(true, {}, B.basicForm, {
            options: {},
            _bind: function() {
                // console.log('ajaxForm - _bind');
                this._bindForm();
                if (B.obj.is$(this.$close)) {
                    this._on(this.$close, {
                        click: this.close
                    });
                }
            }
        })
    );

    $.fn.initAjaxForm = function() {
        var $form = $(this).find('form[data-form=ajax]');
        if (B.obj.is$($form)) {
            $form.ajaxForm();
        }
    };
})(jQuery, Bajt);

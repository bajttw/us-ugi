(function($, B) {
    $.fn.getFieldName = function() {
        var match,
            $this = $(this),
            name = $this.data('name');
        if (name === undefined) {
            match = /\[[^\].]*]$/.exec($this.attr('name'));
            if (match) {
                name = match[0].slice(1, match[0].length - 1);
            }
        }
        return name === undefined ? '' : name; //.toLowerCase();
    };
    $.fn.getDataType = function() {
        var o = this.data('type');
        if (o !== undefined) {
            return o.toLowerCase();
        }
        o = this.data('options');
        return o === undefined || o.type === undefined ? '' : o.type.toLowerCase();
    };
    $.fn.getFieldType = function() {
        var type = this.data('field-type') || this.prop('type') || this.prop('tagName');
        return type === undefined ? '' : type.toLowerCase();
    };
    $.fn.getFieldNavi = function() {
        var type = this.data('navi');
        return type === undefined ? 0 : type;
    };
    $.fn.getFieldControl = function() {
        var control = $(this).data('control');
        return control === undefined ? '' : control !== '1' ? control : 'ctrl';
    };
    $.fn.readField = function(outType) {
        var $field,
            dataType = this.getDataType(),
            fieldType = this.getFieldType(),
            value = '';
        switch (fieldType) {
            case 'checkbox':
                if (this.length > 1) {
                    value = [];
                    $field = this.filter(':checked');
                    $field.each(function() {
                        value.push($(this).val());
                    });
                } else {
                    $field = this;
                    value = $field.is(':checked') ? $field.val() || 1 : 0;
                }
                break;
            case 'radio':
                $field = this.filter(':checked');
                value = $field.val();
                break;
            case 'select-one':
                $field = this.find('option:selected');
                value = $field.val();
                break;
            case 'input-collection':
                value = [];
                $field = this.find('input');
                $field.each(function() {
                    value.push($(this).readField('json'));
                });
                break;
            default:
                $field = this;
                value = $field.val();
        }
        switch (outType) {
            case 'json':
                if (dataType === 'json') {
                    value = B.json.is(value)
                        ? JSON.parse(value)
                        : {
                              v: null,
                              n: '',
                              d: ''
                          };
                } else {
                    value = {
                        v: value,
                        n: $field.data('n') || '',
                        d: $field.data('d') || ''
                    };
                }
                break;
            case 'astring': //!Uwaga
                if (typeof value === 'string') {
                    value = value !== '' ? value.split(' ') : [];
                }
                break;
            case 'ajson':
            case 'cjson':
                value = B.json.is(value) ? JSON.parse(value) : [];
                break;
            case 'float':
                value = B.str.toFloat(dataType === 'json' ? B.json.getValue(value) : value);
                break;
            case 'number':
                value = parseInt(dataType === 'json' ? B.json.getValue(value) : value, 10);
                break;
            default:
                value = dataType === 'json' ? B.json.getValue(value) : value;
                switch (dataType) {
                    case 'float':
                        value = B.str.toFloat(value);
                        break;
                    case 'numer':
                        value = parseInt(value, 10);
                        break;
                }
        }
        return value;
    };
    $.fn.writeField = function(value, change) {
        var fieldType = this.getFieldType(),
            dataType = this.getDataType(),
            nVal = B.getValue(value, 'v');
        // nVal = B.obj.is(value) ? value.v : value;
        switch (fieldType) {
            case 'radio':
                this.filter(':checked').prop('checked', false);
                if (nVal !== null && nVal !== '') {
                    this.filter('[value=' + nVal + ']').prop('checked', true);
                }
                break;
            case 'checkbox':
                if (this.length > 1) {
                    if (!$.isArray(nVal)) {
                        nVal = [];
                    }
                    this.each(function() {
                        var $this = $(this);
                        $this.prop('checked', nVal.indexOf($this.val()) >= 0);
                    });
                } else {
                    this.prop('checked', nVal);
                }
                // this.prop('checked', nVal);
                break;
            default:
                switch (dataType) {
                    case 'json':
                        if (!B.obj.is(value)) {
                            value = {
                                v: nVal,
                                n: '',
                                d: ''
                            };
                        }
                        nVal = JSON.stringify(value);
                        break;
                }
                this.val(nVal);
        }
        if (change) {
            this.change();
        }
    };
   
    $.widget(
        'bajt.field',
        $.extend(true, {}, B.basicWidget, {
            options: {
                parent: null,
                name: null,
                ecn: null,
                type: null,
                navi: 0,
                calc: 0,
                formName: null,
                control: {
                    type: 0,
                    prefix: 'btn',
                    modal: null,
                    modalWidget: 'modalField',
                    signal: 0,
                    signalClass: ['', 'signal-1', 'signal-2']
                },
                disp: {
                    visible: 1, //1-always, 2-switch
                    type: 0,
                    prefix: 'disp',
                    tmpl: '__v__',
                    def: ''
                },
                templates: {
                    btnDetails:
                        '<button type="button" class="ml-2 btn btn-sm btn-default" style="display:none;"><i class="material-icons md-14">details</i></button>',
                    disp: '<div/>'
                },
                details: false,
                widget: null,
                label: '',
                max: null,
                min: null,
                precision: 2,
                setField: null,
                fieldDefault: null,
                format: 'YYYY-MM-DD HH:mm',
                //            parameters:null,
                compare: null,
                limits: null,
                readonly: false
            },
            _create: function() {
                var o = this.options;
                this._createBasicOptions()
                    ._createData()
                    ._createBasicControls();
                if (!o.label) {
                    var $label = this.$container.find('label');
                    if (B.obj.is$($label)) {
                        o.label = $label.html();
                    }
                }
                //            if (o.parameters) o.parameters = this.options.parent.getParameters(o.parameters == 1 ? o.name : o.parameters);
                this._read();
                this.readonly();
                if (o.type === 'cjson') {
                    this._saveID(); //zapis starych id (minimalizacja rekordów w bazie)
                }
                //                that.element.data('index', that.element.find('[data-type="json"]').length)
                if (o.fieldDefault && (o.empty || this.isEmpty())) {
                    this.fdata.isDefault = B.obj.is(o.fieldDefault);
                    this.setDefault();
                } else {
                    this._checkDefault(true);
                }
                this.disp();
                if (B.obj.is(o.widget)) {
                    this.formWidget = this.element.initFormWidget(
                        $.extend(true, o.widget.options || {}, {
                            widget: o.widget.type,
                            dictionary: o.dictionary,
                            field: this
                        })
                    );
                }
                this._bind();
            },
            _setOption: function(key, value) {
                console.log('!!!!!field - ' + key);
            },
            isEmpty: function() {
                var value = this.fdata.value,
                    isVal = isSet(value);
                switch (this.options.type) {
                    case 'json':
                        isVal = isVal && (value.v || value.id);
                        break;
                    case 'astring':
                    case 'ajson':
                    case 'cjson':
                        isVal = isVal && $.isArray(value) && value.length > 0;
                        break;
                }
                return !isVal;
            },
            _bind: function() {
                var that = this,
                    o = this.options;
                if (o.check_key && typeof keyPress[o.type] === 'function') {
                    this.element.on('keypress', keyPress[o.type]);
                }
                if (o.type === 'number') {
                    this.element.on('keydown', keyPress.number_inc);
                }
                if (o.navi) {
                    var $el = o.navi === 'control' ? this.$control : this.element;
                    if (B.obj.is$($el)) {
                        $el.on('keydown', keyPress.navi);
                        this._on($el, {
                            navigate: this._navigate
                        });
                    }
                }
                this._on(this.element, {
                    change: this._change
                });
                if (o.type === 'bool') {
                    //               this.element.on( 'change', this._change);
                }
                if (o.control.modal) {
                    this._on(this.$control, {
                        click: this._click
                    });
                }
                // if (o.switch) {
                //     this._on(this.$control, {
                //         dblclick: this._dblclick
                //     });
                // }
                this._on(this.$container.find('.form-control'), {
                    mouseover: function() {
                        that.$container.find('.field-msg').slideDown('fast');
                    },
                    mouseout: function() {
                        that.$container.find('.field-msg').slideUp('fast');
                    }
                });
                return this;
            },
            _blockStatus: 0,
            _change: function(e, data) {
                // console.log('field - change');
                stopTrigger(e);
                // if (this.ownChange) {
                //     this.ownChange = false;
                // } else {
                // var changed = this._read() > 0;
                // }
                if (this._read() > 0) {
                    this._changed();
                }
            },
            _changed:function(){
                this.validate();
                this.disp();
                this.element.trigger('changed', {
                    field: this
                });
            },
            _checkDefault: function(set) {
                var d = this.fdata,
                    o = this.options;
                if (this.options.fieldDefault && set) {
                    var defval = this.getDefault();
                    switch (o.type) {
                        case 'astring':
                            d.isDefault =
                                $.isArray(d.value) &&
                                $.isArray(defval) &&
                                d.value.length === defval.length &&
                                d.value.join() === defval.join();
                            break;
                        case 'cjson':
                        case 'ajson':
                            if (isSet(d.value)) {
                                if ((d.isDefault = isSet(defval))) {
                                    if (typeof o.compareFunction === 'function') {
                                        var length = d.value.length;
                                        if ((d.isDefault = length === defval.length)) {
                                            for (var i = 0; i < length; i++) {
                                                if (!(d.isDefault = o.compareFunction(d.value[i], defval[i]))) {
                                                    break;
                                                }
                                            }
                                        }
                                    } else {
                                        d.isDefault = JSON.stringify(d.value) === JSON.stringify(defval);
                                    }
                                }
                            }

                            //                        if (isSet(defval) && isSet(d.value)){
                            //                            if (typeof(o.compareFunction) === 'function' ){
                            //                                var length=d.value.length;
                            //                                if (d.isDefault = length === defval.length)
                            //                                    for (var i=0; i<length; i++)
                            //                                        if ( !(d.isDefault=o.compareFunction(d.value[i], defval[i])))
                            //                                            break;
                            //                            }else
                            //                                d.isDefault = JSON.stringify(d.value) == JSON.stringify(defval);
                            //                        }
                            break;
                        case 'json':
                            d.isDefault = B.obj.is(defval) && d.value.v === defval.v;
                            break;
                        default:
                            d.isDefault = d.value === defval;
                    }
                }
                return d.isDefault;
            },
            _click: function(e, data) {
                this.$modal[this.options.control.modalWidget]('show', this, this.$control);
            },
            _constrain: function(value) {
                var val = null;
                switch (this.options.type) {
                    case 'float':
                        val = B.str.toFloat(value, this.options.precision, this.options.round);
                        if (isNaN(val)) {
                            val = null;
                        }
                        break;
                    case 'number':
                        val = parseInt(value, 10);
                        if (isNaN(val)) {
                            val = null;
                        }
                        break;
                    case 'date':
                        var m = B.moment(value);
                        if (m) {
                            val = m;
                        }
                        break;
                    case 'json':
                        if (typeof value === 'object') {
                            val = value;
                        } else {
                            var empty={
                                v: null,
                                n: '',
                                d: ''
                            };
                            if(B.json.isObj(value)){
                                val=JSON.parse(value);
                            }else if(!isNaN(Number(value))){
                                val=B.dic.from(this.options.dictionary, value);
                                if(!B.obj.is(val)){
                                    val=empty;
                                }
                            }else{
                                val=empty;
                            }
                            
                            
                            // val =
                            //     value.length > 0
                            //         ? JSON.parse(value)
                            //         : {
                            //               v: null,
                            //               n: '',
                            //               d: ''
                            //           };
                        }
                        break;
                    case 'astring': //!Uwaga
                        val = $.isArray(value) ? value : [];
                        break;
                    case 'cjson':
                    case 'ajson':
                        val = isSet(value) ? value : [];
                        break;
                    case 'bool':
                        val = value ? 1 : 0;
                        break;
                    default:
                        val = isSet(value) ? value : null;
                }
                return val;
            },
            _createBasicControls: function() {
                var o = this.options,
                    dispId = this.element.attr('id').replace(o.formName, o.disp.prefix),
                    controlId = this.element.attr('id').replace(o.formName, o.control.prefix);
                this.$container = this.element.closest('.form-group');
                this.$control = o.parent.element.find('#' + controlId);
                this.$disp = o.parent.element.find('#' + dispId);
                if (o.disp.type && !B.obj.is$(this.$disp)) {
                    this.$disp = $(o.templates.disp)
                        .addClass('form-control')
                        .attr('id', dispId)
                        .appendTo(this.$container);
                }
                if (o.disp.hidden) {
                    this.$disp.hide();
                }
                if (o.details) {
                    this.$btnDetails = $(o.templates.btnDetails).insertAfter(this.$container.find('label'));
                    if (B.obj.is(this.detailsData)) {
                        this.$btnDetails.popover({
                            content: $(o.templates.details).fill(this.detailsData),
                            // trigger: 'focus',
                            html: true
                        });

                        this.$btnDetails.show();
                    }
                }
                this.$modal = $(
                    B.html.validateSelector((String(o.control.modal) === '1' ? o.name : o.control.modal) + '_modal')
                );
                return this;
            },
            _createData: function() {
                var o = this.options;
                this.fdata = {
                    value: null,
                    valueStr: null,
                    isDefault: false,
                    status: 0 //-2: error, -1: warning, 0: not change, 1:ok
                };
                this.showData = null;
                if (o.details) {
                    if (B.obj.is(o.parent)) {
                        this.detailsData = B.obj.getValue(o.name, o.parent.getEntityData());
                    }
                    if (!B.obj.is(this.detailsData)) {
                        this.detailsData = this.element.data('show-data') || null;
                    }
                }
                this.valid = new Valid();
                return this;
            },
            _customCreateBasicOptions: function() {
                var o = this.options;
                $.extend(o.templates, this.element.data('templates') || {});
                if (!o.name) {
                    o.name = this.element.getFieldName();
                }
                if (!o.type) {
                    o.type = this.element.getDataType();
                }
                if (o.setField) {
                    o.setField = o.name;
                }
                if (o.dictionary && !B.obj.is(o.dictionary)) {
                    o.dictionary = this.getDictionary(typeof o.dictionary === 'string' ? o.dictionary : o.name);
                }
                if (this.element.attr('readonly')) {
                    o.readonly = true;
                }
                return this;                
            },
            _dblclick: function(e, data) {
                var find = B.dic.next(this.options.dictionary, this.getValue());
                this.value(find.v);
            },
            _navigate: function(e, data) {
                data.field = this;
                //            data.$control=(this.options.navi==='control') ? this.$control : false;
            },
            _messages: function() {},
            _saveID: function() {
                var d = this.fdata;
                d['oldID'] = [];
                if ($.isArray(d.value)) {
                    $.each(d.value, function(idx, val) {
                        d.oldID.push(val.id);
                    });
                }
            },
            _setValue: function(value) {
                var d = this.fdata,
                    o = this.options;
                if (value !== d.value) {
                    d.value = value;
                    if (o.type === 'cjson' && $.isArray(d.oldID)) {
                        $.each(d.value, function(idx, val) {
                            if (d.oldID[idx] !== undefined) {
                                val.id = d.oldID[idx];
                            } else {
                                return false;
                            }
                        });
                    }
                    this._toStr();
                    d.status = 1;
                }
            },
            _toggleDisp: function(show) {
                var so = this.options.disp;
                if (so.type && so.visible > 1) {
                    if (show) {
                        this.$disp.show();
                    } else {
                        this.$disp.hide();
                    }
                }
            },
            _toStr: function() {
                var d = this.fdata,
                    o = this.options;
                switch (o.type) {
                    case 'bool':
                        d.valueStr = d.value ? '1' : '0';
                        break;
                    case 'date':
                        d.valueStr = d.value ? d.value.format(o.format || 'YYYY-MM-DD') : '';
                        break;
                    case 'number':
                        d.valueStr = $.isNumeric(d.value) ? d.value.toString() : '';
                        break;
                    case 'float':
                        d.valueStr = $.isNumeric(d.value) ? B.str.fixed(d.value, o.precision) : '';
                        break;
                    case 'json':
                        d.valueStr = d.value.v ? JSON.stringify(d.value) : '';
                        break;
                    case 'astring':
                        d.valueStr = $.isArray(d.value) && d.value.length > 0 ? d.value.join(' ') : '';
                        break;
                    case 'ajson':
                        d.valueStr = $.isArray(d.value) && d.value.length > 0 ? JSON.stringify(d.value) : '';
                        break;
                    case 'cjson':
                        d.valueStr = [];
                        for (var i = 0; i < d.value.length; i++) {
                            d.valueStr.push(JSON.stringify(d.value[i]));
                        }
                        break;
                    default:
                        d.valueStr = d.value ? (B.obj.is(d.value) ? JSON.stringify(d.value) : String(d.value)) : '';
                }
                return d.valueStr;
            },
            _read: function() {
                return this._value(this.element.readField(this.options.type));
            },
            _value: function(value) {
                var d = this.fdata,
                    val = this._constrain(value);
                if (val !== undefined) {
                    this._setValue(val);
                    if (this.options.autocorrect) {
                        this.write();
                    }
                } else {
                    //dopisać obsługę messages
                    this._messages();
                    d.status = -1;
                }
                return d.status;
            },
            addToDictionary: function(entry) {
                if (!B.obj.isIterate(this.options.dictionary)) {
                    this.options.dictionary = [];
                }
                this.options.dictionary.push(entry);
                this.element.trigger('changeDictionary', entry);
            },
            block: function(block) {
                var blockStatus = block ? 1 : 0;
                if(this._blockStatus !== blockStatus){
                    this._blockStatus = blockStatus;
                    this.element.prop('disabled', block).trigger('block', {
                        block: block
                    });
                    if (this.$control) {
                        this.$control.prop('disabled', block);
                    }
                }
                return this;
            },
            checkValue: function() {
                if (this.isEmpty()) {
                    return 0;
                } else {
                    return this._checkDefault() ? 1 : 2;
                }
            },
            exportValue: function(expType) {
                var o = this.options,
                    d = this.fdata,
                    value = d.value;
                if (o.type !== expType) {
                    switch (expType) {
                        case 'json':
                            switch (o.type) {
                                case 'ajson':
                                case 'cjson':
                                    value = [d.value];
                                    break;
                                default:
                                    if (o.dictionary) {
                                        value = B.dic.from(o.dictionary, value);
                                    } else {
                                        value = this.element.readField(expType);
                                    }
                            }
                            break;
                        case 'astring': //!Uwaga: ewnetualna rozbudowa
                            switch (o.type) {
                                case 'json':
                                    value = [d.value.v];
                                    break;
                                case 'string':
                                    value = d.value.split(' ');
                                    break;
                                default:
                                    value = this.element.readField(expType);
                            }
                            break;
                        case 'ajson':
                        case 'cjson':
                            switch (o.type) {
                                case 'json':
                                    value = [d.value];
                                    break;
                                case 'string':
                                    value = JSON.stringify(d.value);
                                    break;
                                default:
                                    value = this.element.readField(expType);
                            }
                            break;
                        case 'float':
                            switch (o.type) {
                                case 'bool':
                                    value = d.value > 0 ? 1 : 0;
                                    break;
                                case 'string':
                                case 'number':
                                    value = parseFloat(d.value);
                                    break;
                                case 'json':
                                    value = this.getValue();
                                    break;
                                default:
                                    value = this.element.readField(expType);
                            }
                            break;
                        case 'number':
                            switch (o.type) {
                                case 'bool':
                                    value = d.value > 0 ? 1 : 0;
                                    break;
                                case 'string':
                                case 'float':
                                    value = parseInt(d.value, 10);
                                    break;
                                case 'json':
                                    value = this.getValue();
                                    break;
                                default:
                                    value = this.element.readField(expType);
                            }
                            break;
                        default:
                            switch (o.type) {
                                case 'json':
                                    value = this.getValue();
                                    break;
                                default:
                                    value = this.element.readField(expType);
                            }
                    }
                }
                return value;
            },
            focus: function(data) {
                if (this.element.is(':hidden')) {
                    this.element.trigger('tofocus', data);
                } else {
                    this.element.focus();
                    if (this.options.selectOnFocus){
                        this.element[0].select();
                    }
                }
            },
            getDefault: function() {
                var o = this.options;
                return o.fieldDefault ? o.fieldDefault.exportValue(o.type) : null;
            },
            getValue: function() {
                return this.options.type === 'json' ? this.fdata.value.v : this.fdata.value;
            },
            name: function() {
                return this.options.name;
            },
            readonly: function(readonly) {
                var o = this.options,
                    w = B.obj.is(this.formWidget) ? this.formWidget : this.element.getFormWidget();
                if (readonly === undefined) {
                    readonly = o.readonly;
                }
                this._toggleDisp(readonly);
                if (readonly) {
                    if (B.obj.is(w) && typeof w.disable === 'function') {
                        w.disable();
                    }
                } else {
                    if (B.obj.is(w) && typeof w.enable === 'function') {
                        w.enable();
                    }
                }
                o.readonly = readonly ? true : false;
            },
            setDefault: function() {
                var o = this.options,
                    d = this.fdata,
                    val;
                if (o.fieldDefault) {
                    val = this._constrain(o.fieldDefault.exportValue(o.type));
                    if (isSet(val)) {
                        if (d.isDefault) {
                            this._setValue(val);
                            this.write();
                        } else {
                            this.disp();
                        }
                    }
                }
            },
            disp: function() {
                var i,
                    that = this,
                    o = this.options,
                    os = o.disp,
                    oc = o.control,
                    d = this.fdata,
                    html = '',
                    $disp = this.$disp,
                    $control = this.$control;
                if (os.type) {
                    var // value = this.getValue(),
                    disp = os.def;
                    $disp.empty();
                    if (!this.isEmpty()) {
                        switch (os.type) {
                            case 1:
                            case '1':
                            case 'str':
                                disp = d.valueStr;
                                break;
                            case 'astring':
                            case 'ajson':
                            case 'cjson':
                                disp = d.value;
                                break;
                            case 'v':
                                disp = this.getValue();
                                break;
                            default:
                                var _convert = function(value) {
                                    if (os.type.indexOf('dic') === 0) {
                                        var s = os.type.split('.'); //typ wieloczłononowy
                                        return that._fromDictionary(value, { name: s[1] || 'n' });
                                    }
                                    return B.getValue(value, os.type);
                                };
                                if ($.isArray(d.value)) {
                                    if (d.value.length > 0) {
                                        disp = [];
                                        for (i = 0; i < d.value.length; i++) {
                                            disp.push(_convert(d.value[i]));
                                        }
                                    }
                                } else {
                                    disp = _convert(d.value);
                                }
                            // if (os.type.indexOf('dic') === 0) {
                            //     var s = os.type.split('.'), //typ wieloczłononowy
                            //         record = B.dic.from(o.dictionary, value);
                            //     if (record)
                            //         disp = record[s[1] ? s[1] : 'n'];
                            // } else
                            //     disp = d.value[os.type];
                        }
                    }
                    if (isSet(disp)) {
                        var _html = function(value) {
                            if (B.obj.is(value)) {
                                var $row = $(os.tmpl).fill(value, o.ecn);
                                $disp.append($row);
                            } else {
                                html += (os.tmpl ? os.tmpl.replace('__v__', value) : value) + ' ';
                            }
                        };
                        if ($.isArray(disp)) {
                            for (i = 0; i < disp.length; i++) {
                                _html(disp[i]);
                            }
                        } else {
                            _html(disp);
                        }

                        // if ($.isArray(disp)) {
                        //     if(os.tmpl){
                        //         for(var i=0; i < disp.length; i++ ){
                        //             if (B.obj.is(disp[i])) {
                        //                 var $row = $(os.tmpl).fill(disp[i], o.ecn); //       html.showObj(field, os.tmpl, o.dictionaries);
                        //                 $disp.append($row);
                        //             }else
                        //                 html += os.tmpl.replace('__v__', disp[i]) + '</br>';
                        //         }
                        //     }else
                        //         html=disp.join();

                        // $.each(disp, function (idx, field) {
                        //     if (B.obj.is(field)) {
                        //         var $row = $(os.tmpl).fill(field, o.ecn); //       html.showObj(field, os.tmpl, o.dictionaries);
                        //         $disp.append($row);
                        //     } else {

                        //         html += os.tmpl.replace('__v__', field) + '</br>';
                        //     }
                        // });
                        // } else {
                        //     // disp=
                        //     // if (o.type === 'float')
                        //     // disp=disp.replace('.', ',');
                        //     html = o.disp.tmpl.replace('__v__', disp);
                        // }
                        if (html) {
                            $disp.html(html);
                        }
                    }
                }
                if (oc.signal) {
                    var signal = oc.signalClass[this.checkValue()];
                    $control.removeClass(function() {
                        return (this.className.match(/\b(signal-\d{1,3})\b/g) || []).join(' ');
                    });
                    if (signal) {
                        this.$control.addClass(signal);
                    }
                }
            },
            status: function() {
                return this.fdata.status;
            },
            update: function(data) {
                var d = this.fdata,
                    o = this.options;
                switch (o.type) {
                    case 'astring':
                        d.value = data.join(' ').split(' ');
                        break;
                    case 'ajson':
                    case 'cjson':
                        $.each(data, function(i, json) {
                            $.each(json, function(key, value) {
                                d.value[i][key] = value;
                            });
                        });
                        break;
                    case 'json':
                        $.each(data, function(key, value) {
                            d.value[key] = value;
                        });
                        break;
                    default:
                        d.value = data;
                }
                this._toStr();
                this._checkDefault(true);
                this.write();
            },
            validate: function() {
                //            console.log('validate field '+this.options.name);
                var o = this.options;
                this.$container.removeClass(this.valid.getClass(true));
                this.$container.find('.field-msg').slideUp(function() {
                    this.remove();
                });
                this.valid.init();
                if (B.obj.is(o.limits)) {
                    var val = this.value(),
                        limit = null,
                        types = ['error', 'warning', 'info'];
                    for (var i = 0; i < types.length; i++) {
                        if (o.limits.hasOwnProperty(types[i])) {
                            limit = B.checkLimits(o.limits[types[i]], val);
                            if (limit) {
                                this.valid.init(types[i].slice(0, 1), limit.msg);
                                break;
                            }
                        }
                    }
                }
                this.$container.addClass(this.valid.getClass());
                if (this.valid.msg) {
                    var $msg = this.valid.msg.$html();
                    this.$container.append($('<div class="field-msg"></div>').append($msg));
                    this.valid.msg.label = o.label || o.name;
                }
                return this.valid;
            },
            value: function(value) {
                if (value === undefined) {
                    return this.fdata.value;
                }
                if (this._value(value) === 1) {
                    //??? co jeśli błąd
                    this._checkDefault(true);
                    this.write();
                }
            },
            write: function() {
                var o = this.options,
                    d = this.fdata;
                switch (o.type) {
                    case 'cjson':
                        var prototype = this.element.data('prototype');
                        //                        index=this.element.data('index') || 0,
                        //                        inputs=this.element.find('input');
                        //                    if (o.parent.field('id').value()){
                        //                        var $old=this.element.find('.form-group')
                        //                    }else{
                        if (prototype) {
                            this.element.empty();
                            if (isSet(d.value)) {
                                for (var i = 0; i < d.value.length; i++) {
                                    var $newElement = $(prototype.replace(/__name__/g, i)),
                                        $input = $newElement.is('input') ? $newElement : $newElement.find('input');
                                    $input.val(d.valueStr[i]);
                                    //                            $input.data(d.value[i]);
                                    this.element.append($newElement);
                                    //                            index++;
                                }
                            }
                            //                    this.element.data('index', index);
                        } else {
                            this.element.val(d.valueStr);
                        }
                        break;
                    case 'ajson':
                        this.element.val(d.valueStr);
                        break;
                    default:
                        switch (this.element.getFieldType()) {
                            case 'select-one':
                                this.element.val(this.getValue());
                                break;
                            case 'checkbox':
                                this.element.prop('checked', this.getValue());
                                break;
                            default:
                                this.element.val(d.valueStr);
                        }
                }
                this._changed();
                // this.ownChange = true;

                // this.element.change();
                // this.element.trigger('change');
            }
        })
    );
})(jQuery, Bajt);

(function($, B){
    $.widget(
        'bajt.nettoInput',
        $.extend(true, {}, B.basicWidget, {
            options: {
                inputs: {
                    netto: {
                        symbol: 'N',
                        wrapperClass: 'pl-0 pr-1',
                        wrapperAttr: { title: 'Kwota netto'},
                        vat: 0,
                        navi: 0
                    },
                    brutto: {
                        symbol: 'B',
                        wrapperClass: 'pl-1 pr-0',
                        wrapperAttr: { title: 'Kwota brutto' },
                        vat: 23,
                        navi: 1
                    }
                },
                defaultFocus: 'netto',
                navi: true,
                vat: 23,
                precision: 2,
                edit: true,
                disp: false,
                field: null,
                templates: {
                    container: '<div class="d-flex justify-content-between"></div>',
                    wrapper:
                        '<div class="input-group flex-nowrap col-6"><div class="input-group-prepend"><span class="input-group-text" id="basic-addon1">@</span></div></div>',
                    input: '<input type="text" class="form-control" style="width:1% !important;">',
                    disp: '<div class="form-control w-25"></div>'
                }
            },
            _bind: function() {
                var o = this.options;
                if (o.edit) {
                    for (var n in this._fields) {
                        var $input = this._fields[n].$input;
                        this._on($input, {
                            blur: this._inputBlur
                        });
                        $input.on('keypress', keyPress.float);
                        if (o.navi) {
                            $input.on('keydown', keyPress.navi);
                        }
                    }
                    this._on(this.$container, {
                        navigate: this._navigate
                    });
                }
                this._on(this.element, {
                    changed: this._change,
                    tofocus: this._focus,
                    block: this._blockAction                   
                });
                return this;
            },
            _blockAction:function(e, data) {
                this.block(data.block);
            },
            _build: function() {
                var o = this.options;
                this.$container = $(o.templates.container).appendTo( this.element.parent() );
                this._fields={};
                for (var n in o.inputs) {
                    var iopt = o.inputs[n];
                    this._fields[n] = {
                        $wrapper: $(o.templates.wrapper).appendTo(this.$container),
                        $input: $(o.templates.input).attr('data-type', 'float'),
                        $disp: $(o.templates.disp)
                    };
                    this._fields[n].$wrapper.find('.input-group-text').html(iopt.symbol);
                    if (iopt.wrapperClass) {
                        this._fields[n].$wrapper.addClass(iopt.wrapperClass);
                    }
                    if (iopt.wrapperAttr) {
                        for (var a in iopt.wrapperAttr) {
                            this._fields[n].$wrapper.attr(a, iopt.wrapperAttr[a]);
                        }
                    }
                    if (o.edit) {
                        this._fields[n].$wrapper.append(this._fields[n].$input.data('inputName', n));
                    }
                    if (o.disp) {
                        this._fields[n].$wrapper.append(this._fields[n].$disp);
                    }               
                }
                this.element.hide();
                return this;
            },
            _inputBlur: function(e) {
                var o = this.options,
                    $input = $(e.target),
                    name = $input.data('inputName'),
                    vat = o.inputs[name].vat,
                    // value = this._constrain(o.field.value());
                    value = this._constrain($input.readField());
                    this._write(vat === 0 ? value : value * 100 / (100 + vat));
            },
            _change: function(e, data) {
                this._read();
            },
            _focus: function(e, data) {
                stopTrigger(e);
                var o=this.options;
                if (o.edit) {
                    var fname=B.obj.getValue('nettoInput.name', data),
                        step=B.obj.getValue('step', data);
                    if( !fname  && (step < 0 || step > 0)){
                        fname = step < 0 ? o.fields[o.fields.length -1 ] : o.fields[0];
                    }
                    this._focus$input(B.obj.getValue('nettoInput.name', data, fname || 'netto'));
                }
            },
            _focus$input:function(name){
                if(this._fields[name]){
                    this._fields[name].$input.focus().select();
                }
            },
            _createData: function() {
                for (var n in this.options.inputs) {
                    this._fields[n].value = 0;
                }
                return this;
            },
            _customCreate: function() {
                this._read(true);
                return this;
            },
            _customCreateBasicOptions: function() {
                var o = this.options;
                o.fields = Object.keys(o.inputs);
                if(o.field){
                    o.precision = o.field.option('precision');
                }
                return this;
            },
            _calc: function() {
                var netto = this.value('netto');
                for (var n in this.options.inputs) {
                    if (n !== 'netto') {
                        var iop=this.options.inputs[n];
                        this.value(n, iop.vat === 0 ? netto : netto * (100 + iop.vat) / 100);
                    }
                    this._disp(n);
                }
            },
            _navigate: function(e, data) {
                stopTrigger(e);
                var o = this.options,
                    name = $(e.target).data('inputName'),
                    fname=o.fields[o.inputs[name].navi + data.step];
                if ((data.step === -1 || data.step === 1) && this._fields[fname]) {
                    this._focus$input(fname);
                }else if (o.field.option('navi')) {
                    data.nettoInput = { name: name };
                    this.element.trigger('navigate', data);
                }
            },
            _str:function(value){
                return B.str.fixed(value, this.options.precision);
            },
            _strValue: function(name) {
                return this._str(this._fields[name].value);
            },
            _disp: function(name) {
                var o=this.options,
                    f=this._fields[name],
                    str=this._str(f.value);               
                if (o.edit) {
                    f.$input.writeField(str);
                }
                if (o.disp) {
                    f.$disp.text(str);
                }
            },
            _constrain: function(value) {
                return B.str.toFloat(value, this.options.precision);
            },
            _read: function(init) {
                this.value('netto', this.element.readField());
                // this.value('netto', this.options.field.value());
                this._calc();
            },
            _write:function(netto){
                netto = this._constrain(netto);
                if (netto !== this.value('netto')) {
                    this.element.writeField(netto, true);
                }
            },
            _destroy: function() {
                this.$container.remove();
                this.element.disp();
            },
            block:function(block){
                for(var n in this._fields){
                    this._fields[n].$input.prop('disabled', block);
                }
            },
            value: function(name, value) {
                var f=this._fields[name];
                if (undefined !== value) {
                    f.value = this._constrain(value);
                }
                return f.value;
            }
        })
    );
})(jQuery, Bajt);

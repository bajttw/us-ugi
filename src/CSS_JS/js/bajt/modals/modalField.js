(function($, B) {
    'use strict';
    $.widget(
        'bajt.modalField',
        $.extend(true, {}, B.basicWidget, {
            options: {
                animate: 'fast'
            },
            _createBasicControls: function() {
                this.$title = this.element.find('.modal-title');
                this.$fieldsContainer = this.element.find('.fields-container');
                this.$field = this.$fieldsContainer.find('[name=' + this.$fieldsContainer.data('field') + ']');
                this.$save = this.element.find('.btn-save');
                this.$clear = this.element.find('.btn-clear');
                this._callFunction('_customCreateBasicControls');
                return this;
            },
            _createData: function() {
                this.mdata = {
                    field: null,
                    value: null,
                    type: null
                };
                this.fieldType = this.$fieldsContainer.getFieldType();
                this._callFunction('_customCreateData');
                return this;
            },
            _bind: function() {
                this._on(this.element, {
                    keypress: this._keypress
                });
                this._on(this.$save, {
                    click: this._save
                });
                this._on(this.$clear, {
                    click: this._clear
                });
                this._on(this.$fieldsContainer, {
                    change: this._change
                });
                return this;
            },
            _title: function() {
                var field = this.mdata.field,
                    title = field.element.data('modal-title');
                if (title) {
                    this.$title.html(title);
                } else {
                    // do sprawdzenia if (this.$title.text().replace(/\s/g,'').length === 0){
                    this.$title.html(field.element.attr('title'));
                }
            },
            _initValue: function(mode) {
                var d = this.mdata;
                this._decode(mode > 1 ? d.field.getDefault() : d.field.value());
                this._callFunction('_customInitValue');
                this.write();
                this._canSave(mode > 1);
            },
            _clear: function(e, data) {
                this._initValue(2);
            },
            _canSave: function(enable) {
                //do sprawdzenia change po opuszczeniu pola
                this.$save.prop('disabled', !enable);
                //            this.$clear.prop('disabled', !enable); //zbędnde chyba że jest już domyślne
            },
            _keypress: function(e, data) {
                if (e.which === 13) {
                    console.log('modal-field enter!');
                    if (e.ctrlKey) {
                        stopTrigger(e);
                        this.read();
                        this._save();
                    }
                }
            },
            _decode: function(value) {
                this.mdata.value = value;
                return this.mdata.value;
            },
            _encode: function() {
                return this.mdata.value;
            },
            _save: function(e, data) {
                this.mdata.field.value(this._encode());
                this.element.modal('hide');
            },
            _change: function(e, data) {
                if (this.ownChange) {
                    this.ownChange = false;
                } else {
                    this.read();
                    this._canSave(true);
                }
            },
            read: function() {
                this.mdata.value = this.$field.readField(this.mdata.type);
            },
            write: function() {
                this.$field.writeField(this.mdata.value);
                this.ownChange = true;
                this.$field.change();
            },
            show: function(field, caller) {
                this.mdata.field = field;
                this.mdata.type = field.option('type');
                this._title();
                if (this.options.source === 'dic' && B.obj.is(field.options.dictionary)) {
                    var widget = this.$field.data('bajtCombobox');
                    widget.reloadDictionary(field.options.dictionary);
                }
                this._initValue(1);
                this.$field.prop(field.element.prop('readonly') || false);
                if (field.element.prop('readonly')) {
                    this.$save.hide();
                    this.$clear.hide();
                } else {
                    this.$save.show();
                    this.$clear.show();
                }
                if (B.obj.is$(caller)) {
                    this.element.data('callElement', caller);
                }
                this.element.modal();
            }
        })
    );
})(jQuery, Bajt);

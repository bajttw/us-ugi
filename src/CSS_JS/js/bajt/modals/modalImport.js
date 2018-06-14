(function($, B) {
    'use strict';
    $.widget(
        'bajt.modalImport',
        $.extend(true, {}, B.basicWidget, {
            options: {
                animate: 'fast',
                $title: null,
                tmpl:
                    '<div class="row-data"><div class="col-xs-4">__0__</div><div class="col-xs-8">__1__</div><div class="col-xs-8">__2__</div><div class="col-xs-4">__3__</div></div>'
            },
            _createBasicControls: function() {
                this.$field = this.element.find('#field-import');
                this.$field.linedtextarea({
                    selectedLine: 1
                });
                this.$view = this.element.find('#view-import');
                this.$save = this.element.find('.btn-save');
                this.$clear = this.element.find('.btn-clear');
                this.$import = this.element.find('.btn-import');
                return this;
            },
            _createData: function() {
                this.importOptions = {};
                this.mdata = {};
                this.mdata.positions = null;
                this._callFunction('_customCreateData');
                return this;
            },
            _bind: function() {
                this._on(this.$save, {
                    click: this._save
                });
                this._on(this.$clear, {
                    click: this._clear
                });
                this._on(this.$import, {
                    click: this._recognize
                });
                //            this._on(this.$fieldsContainer, { change : this._change} );
                return this;
            },
            _clear: function() {
                this.mdata.positions = null;
                this.$field.val('');
                this.$view.empty();
            },
            _recognize: function() {
                var d = this.mdata,
                    imp = this.$field.val(),
                    rows = imp.split('\n'); //imp.match(/.*/g);
                d.positions = [];
                $.each(rows, function(idx, pos) {
                    var position = pos.match(intMatch);
                    if ($.isArray(position) && position.length === 3) {
                        position.unshift(idx + 1);
                        d.positions.push(position);
                    }
                });
                this._view();
            },
            _save: function(e, data) {
                //            var value=this.mdata.value;
                //            this.mdata.field.value(this.mdata.value);
                // var d = this.mdata;
                var io=this.importOptions,
                    impParameters = [
                        this.mdata.positions
                    ];
                io.fnImport.apply(io.form, impParameters.concat(io.extraArguments || []) );
                // this.importOptions.form.importPositions(this.importOptions.ecn, this.mdata.positions);
                this.element.modal('hide');
            },
            _change: function(e, data) {
                //            this.read();
                //            this._canSave(true);
            },
            _title: function() {
                var o = this.options,
                    field = this.mdata.field,
                    title = field.element.data('modal-title');
                if (title) {
                    o.$title.html(title);
                } else if (o.$title.text().replace(/\s/g, '').length === 0) {
                    o.$title.html(field.element.attr('title'));
                }
            },
            _view: function() {
                var o = this.options,
                    $v = this.$view;
                $v.empty();
                $.each(this.mdata.positions, function(idx, pos) {
                    var r = $v.data('tmpl');
                    $.each(pos, function(col, value) {
                        r = r.replace('__' + col + '__', value);
                    });
                    var $r = $(r).appendTo($v);
                    if (o.animate) {
                        $r.slideDown(o.animate);
                    } else {
                        $r.show();
                    }
                });
            },
            show: function(options) {
                this.importOptions = options;
                this._clear();
                this.element.modal();
            }
        })
    );
})(jQuery, Bajt);

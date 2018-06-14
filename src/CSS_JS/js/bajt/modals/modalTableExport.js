(function($, B) {
    'use strict';
    $.widget(
        'bajt.modalTableExport',
        $.extend(true, {}, B.basicWidget, {
            options: {
                animate: 'fast',
                rowSelector: '.row-pos'
            },
            _createBasicControls: function() {
                this.$submit = this.element.find('.btn-save');
                this.$fieldsContainer = this.element.find('.fields-container');
                this.$messages = this.element.find('.messages');
                this.$errors = this.element.find('.errors');
                this.$fieldsContainer = this.element.find('.fields-container');
                this._callFunction('_customCreateBasicControls');
                return this;
            },
            _customCreateBasicOptions: function() {
                var o = this.options;
                if (!o.hasOwnProperty('tmpl')) {
                    o.tmpl = this.$fieldsContainer.data('tmpl');
                }
                return this;
            },
            _createData: function() {
                this.mdata = {
                    rows: []
                };
                return this;
            },
            _bind: function() {
                this._on(this.$submit, {
                    click: this._save
                });
                this._on(this.$fieldsContainer, {
                    change: this._change,
                    'click .btn-rm': this._$rowDel
                });
                return this;
            },
            _change: function(e) {
                this._read();
            },
            _save: function() {
                var o = this.options;
                if (this.mdata.rows.length === 0) {
                    return;
                }
                if (B.obj.is(o.ajax)) {
                    this.submit();
                }
            },
            _read: function() {
                var d = this.mdata;
                d.rows = [];
                this.$fieldsContainer.find(this.options.rowSelector).each(function() {
                    d.rows.push($(this).data('entity'));
                });
            },
            _$row: function(data) {
                var o = this.options;
                return $(o.tmpl)
                    .data('entity', data)
                    .fill(data, o.ecn);
            },
            _$rowDel: function(e) {
                var that = this,
                    o = this.options,
                    $row = $(e.currentTarget).closest(o.rowSelector),
                    _remove = function() {
                        $row.remove();
                        that.$fieldsContainer.trigger('change');
                    };
                if (o.animate) {
                    $row.slideUp(o.animate, _remove);
                } else {
                    $row.hide(_remove);
                }
            },
            _showData: function() {
                this.$fieldsContainer.empty();
                for (var i in this.mdata.rows) {
                    this.$fieldsContainer.append(this._$row(this.mdata.rows[i]));
                }
            },
            show: function(caller) {
                var o = this.options,
                    d = this.mdata;
                this.dataTable = dataTables[o.dataTableName];
                this.selected = this.dataTable.rows({ selected: true });
                d.rows = DT.convertRowsData(this.selected, o);
                if (d.rows.length > 0) {
                    this.showErrors();
                    this.showMessages();
                    this.$submit.show();
                    this._showData();
                    this.element.modal();
                }
                console.log(d.rows);
            },
            submit: function() {
                B.ajax.send.apply(this, [
                    $.extend(this.options.ajax, {
                        data: JSON.stringify(this.mdata)
                    }),
                    {
                        $content: this.element,
                        $modal: this.element,
                        dataTable: this.dataTable,
                        hideSubmit: true
                    }
                ]);
            }
        })
    );

    $.fn.initModalConfirm = function() {
        this.find('.modal-table-export').modalTableExport();
    };
})(jQuery, Bajt);

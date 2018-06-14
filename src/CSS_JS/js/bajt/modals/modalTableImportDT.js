(function($, B) {
    'use strict';
    $.widget('bajt.modalTableImportDT', $.bajt.modalField, {
        options: {
            ecn: '',
            tableName: '',
            maxCount: 4,
            unique: {
                on: false,
                name: 'id',
                showFilter: false,
                filter: false
            },
            rowSelector: '.row-pos',
            sortable: true,
            showLp: true,
            dblClick: true
        },
        _customCreate: function() {
            this.ownChange = false;
        },
        _customCreateBasicControls: function() {
            var o = this.options;
            this.$fieldsContainer.dtImport({
                addBtn: this.element.find('.btn-import'),
                table: '#' + o.tableName + '_table',
                ecn: o.ecn,
                importFields: o.importFields,
                sortable: o.sortable,
                showLp: o.showLp,
                maxCount: o.maxCount,
                unique: o.unique,
                animate: o.animate,
                rowSelector: o.rowSelector,
                dblClick: o.dblClick
            });
            this.dtImport = this.$fieldsContainer.data('bajtDtImport');
        },
        _customCreateData: function() {
            this.mdata.value = [];
        },
        _constrain: function(value, def) {
            if (B.json.is(value)) {
                value = JSON.parse();
            }
            if (!$.isArray(value)) {
                value = B.obj.is(value) ? [value] : def;
            }
            return value;
        },
        _customImportData: function(dataOut, dataIn) {
            return dataOut;
        },
        _customInitValue: function() {
            var md = this.mdata;
            md.value = this._constrain(md.value, []);
        },
        _decode: function(value) {
            return this._superApply([this._constrain(value, [])]);
        },
        _encode: function() {
            return this._constrain(this.mdata.value, null);
        },
        read: function() {
            this.mdata.value = this.dtImport.read();
            return this.mdata.value;
        },
        write: function() {
            this.dtImport.write(this.mdata.value);
        }
    });
})(jQuery, Bajt);

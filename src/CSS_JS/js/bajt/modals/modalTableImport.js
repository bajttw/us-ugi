(function($, B) {
    'use strict';

    $.widget('bajt.modalTableImport', $.bajt.modalField, {
        options: {
            tableName: '',
            maxCount: 4,
            unique: false,
            rowSelector: '.row-pos',
            sortable: true,
            showLp: true
        },
        _customCreate: function() {
            this.ownChange = false;
        },
        _customCreateBasicControls: function() {
            var o = this.options;
            this.$table = this.element.find('#' + o.tableName + '_table');
            this.table = this.$table.DataTable();
            this.$import = this.element.find('.btn-import');
            if (o.sortable) {
                this.$fieldsContainer.sortable({
                    // handle: o.rowSelector
                });
            }
        },
        _customCreateBasicOptions: function() {
            var o = this.options;
            if (!o.hasOwnProperty('tmpl')) {
                o.tmpl = this.$fieldsContainer.data('tmpl');
            }
        },
        _customCreateData: function() {
            this.mdata.value = [];
            this.mdata.rowsCount = 0;
        },
        _bind: function() {
            this._on(this.$table, { 'dblclick tr': this._addSelected });
            this._on(this.$import, { click: this._addSelected });
            this._on(this.$fieldsContainer, {
                sortupdate: this._sort,
                'click .btn-rm': this._$rowDel
            });
            this._superApply(arguments);
        },
        _add: function(data, change) {
            var o = this.options,
                md = this.mdata;
            if (md.rowsCount === o.maxCount) {
                return 0;
            }
            if (o.unique) {
                var $row = this.rowFind(o.unique, data[o.unique]);
                if (B.obj.is$($row)) {
                    this._repeatedRow($row, data);
                    return 0;
                }
            }
            md.rowsCount++;
            if (o.showLp) {
                data.lp = md.rowsCount;
            }
            md.value.push(data);
            this._$rowAdd(data, change);
            return 1;
        },
        _addSelected: function(e) {
            stopTrigger(e);
            var //that=this,
                selected = this.table.rows({ selected: true }),
                rows = DT.convertRowsData.apply(this, [selected, this.options, this._customImportData]);
            //     rows=[];
            // selected.every( function ( rowIdx, tableLoop, rowLoop ) {
            //     rows.push(that._importData(B.entity.fill(this.data(), that.options.ecn)));
            // } );
            selected.deselect();
            return this.rowsAdd(rows, true);
        },
        _$rowAdd: function(data, change) {
            var that = this,
                o = this.options,
                $row = $(o.tmpl),
                _change = function() {
                    if (change) {
                        that.$fieldsContainer.trigger('change');
                    }
                };
            if (o.unique) {
                var rvalues = B.obj.addToArray($row.data('values'), { name: o.unique, key: o.unique }, 'name');
                $row.attr('data-values', JSON.stringify(rvalues));
            }
            this._$rowFill($row, data);
            this._$rowCustom($row);
            $row.appendTo(this.$fieldsContainer);
            if (o.animate) {
                $row.slideDown(o.animate, _change);
            } else {
                $row.show(_change);
            }
            return $row;
        },
        _$rowCustom: function($row) {
            return $row;
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
        _$rowFill: function($row, entity) {
            return $row.data('entity', entity).fill(entity, this.options.ecn);
        },
        _$rowRead: function($row, data) {
            var entity = $row.data('entity');
            $row.find('[data-edit]').each(function() {
                var $field = $(this);
                entity[$field.data('name')] = $field.readField();
            });
            if (B.obj.is(data)) {
                for (var n in data) {
                    entity[n] = data[n];
                }
            }
            this._$rowFill($row, entity);
            return entity;
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
            md.rowsCount = md.value.length;
        },
        _decode: function(value) {
            return this._superApply([this._constrain(value, [])]);
        },
        _encode: function() {
            return this._constrain(this.mdata.value, null);
        },
        // _importData:function(dataIn){
        //     var dataOut={},
        //         f=this.options.importFields;
        //     for( var i in f ){
        //         var val=B.obj.getValue(f[i], dataIn);
        //         val= B.json.is(val) ? JSON.parse(val) : val;
        //         if(B.obj.is(val) && val.hasOwnProperty('v'))
        //             val=parseInt(val.v, 10);
        //         dataOut[f[i]]=val;
        //     }
        //     return this._customImportData(dataOut, dataIn);
        // },
        _repeatedRow: function(data) {
            console.log('unique');
        },
        _sort: function() {
            this.$fieldsContainer.trigger('change');
        },
        rowFind: function(key, value) {
            var $row = null;
            this.$fieldsContainer.find(this.options.rowSelector).each(function() {
                var $this = $(this);
                if ($this.data(key) === value) {
                    $row = $this;
                    return false;
                }
            });
            return $row;
        },
        rowsAdd: function(rows, change) {
            var count = 0;
            if ($.isArray(rows)) {
                for (var i = 0; i < rows.length; i++) {
                    count += this._add(rows[i], change);
                }
            } else if (B.obj.is(rows)) {
                count += this._add(rows, change);
            }
            return count;
        },
        read: function() {
            var that = this,
                lp = 1,
                md = this.mdata;
            md.value = [];
            this.$fieldsContainer.find(this.options.rowSelector).each(function() {
                md.value.push(that._$rowRead($(this), that.options.showLp ? { lp: lp++ } : null));
            });
            md.rowsCount = md.value.length;
            return md.value;
        },
        write: function() {
            var rows = this.mdata.value;
            this.$fieldsContainer.empty();
            this._customCreateData();
            this.rowsAdd(rows);
        }
    });
})(jQuery, Bajt);

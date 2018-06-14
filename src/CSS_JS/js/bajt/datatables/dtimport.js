(function($, B) {
    'use strict';
    $.widget(
        'bajt.dtImport',
        $.extend(true, {}, B.basicWidget, {
            options: {
                ecn: '',
                dblClick: false,
                addBtn: null,
                animate: true,
                table: null,
                rowSelector: '.row-pos',
                inputSelector: 'input',
                sortable: false,
                maxCount: false,
                showLp: false,
                unique: {
                    on: false,
                    name: 'id',
                    showFilter: true,
                    filter: false
                },
                selName: 'sel',
                selTypes: {
                    unselected: '0',
                    selected: '1',
                    added: '2',
                    included: '3'
                },
                saveData: true,
                templates: {
                    uniqueFilter:
                        '<div style="display:none;"><div class="form-check"><input type="checkbox" class="form-check-input" id="dt_filterbar_unique"><label class="form-check-label" for="dt_filterbar_unique">Ukryj dodane</label></div></div>'
                },
                confirmRemove: false,
                confirmationOptions: {}
            },
            _build: function() {
                var $filterbar = DT.get$FilterBar(this.dt);
                if (this.options.unique.on && B.obj.is$($filterbar)) {
                    var $uf = $(this.options.templates.uniqueFilter);
                    $filterbar.find('.filters').append($uf);
                    if (this.options.unique.showFilter) {
                        $uf.show();
                    }
                    this.$uniqueFilter = $uf.find('input');
                    this.filterUnique = this.options.unique.filter ? true : false;
                    this.$uniqueFilter.prop('checked', this.filterUnique);
                }
                return this;                
            },
            _createBasicControls: function() {
                var o = this.options;
                this.$modal = $(o.modal || this.element.data('modal'));
                this.$modalBtn = $(o.modalBtn || this.element.data('modal-btn'));
                this.$addBtn = $(o.addBtn || this.element.data('add-btn'));
                this.$dt = $(o.table || this.element.data('table'));
                this.dt = this.$dt.DataTable();
                if (o.sortable) {
                    this.element.sortable({});
                }
                B.basicWidget._createBasicControls.call(this);
                return this;
            },
            _customCreate: function() {
                this._rowsInit();
                return this;
            },
            _customCreateBasicOptions: function() {
                var o = this.options;
                if (!B.str.is(o.tmpl)) {
                    o.tmpl = this.element.data('tmpl');
                    if (!B.str.is(o.tmpl)) {
                        o.tmpl = this.element.data('prototype');
                        if (!o.prototypeName) {
                            o.prototypeName = this.element.data('prototype-name');
                        }
                    }
                }
                return this;
            },
            _createData: function() {
                this._positions = {
                    rows: [],
                    count: 0,
                    index: 0,
                    uniques: []
                };
                return this;
            },
            _bind: function() {
                var that = this;
                if (B.obj.is$(this.$modalBtn) && B.obj.is$(this.$modal)) {
                    this._on(this.$modalBtn, {
                        click: function() {
                            that.$modal.modal('show');
                        }
                    });
                }
                if (this.options.dblClick) {
                    this._on(this.$dt, {
                        'dblclick tr': this._dtAddSelected
                    });
                }
                this._on(this.$addBtn, {
                    click: this._dtAddSelected
                });
                this._on(this.element, {
                    sortupdate: this._sort,
                    change: this._change,
                    rowAdded: this._change,
                    rowRemoved: this._change,
                    'click .btn-rm': this._rowRemove,
                    block: function(e, data) {
                        that.block(B.obj.getValue('block', data, false));
                    }
                });
                this._on(this.$uniqueFilter, {
                    change: this._uniqueFilterChange
                });
                this.$dt.on({
                    'user-select.dt': function(e, dt, type, cell, originalEvent) {
                        console.log('user-select.dt');
                        var $row = $(cell.row(cell.indexes()[0].row).node()),
                            sel = $row.data(that.options.selName) || 'unselected';
                        if (sel !== 'unselected' && sel !== 'selected') {
                            e.preventDefault();
                        }
                    },
                    // },
                    // 'select.dt': function(e, dt, type, indexes) {
                    //     that._tableSelect(dt.row(indexes), true, indexes);
                    // },
                    // 'deselect.dt': function(e, dt, type, indexes) {
                    //     that._tableSelect(dt.row(indexes), false, indexes);
                    'preDraw.dt': function(e, settings) {
                        that._dtSelect();
                        that._dtUniqueFilter();
                        console.log('preDraw');
                    }
                });

                var tabSettings = this.dt.settings()[0];
                tabSettings.aoRowCallback.push({
                    fn: function(row, data, index) {
                        DT.rowCallBack.select(row, data, index, tabSettings);
                    },
                    //                             // function( row, data, index ) {
                    //     //     var
                    //     //         selType=that.getSelectType(data) || 'unselected',
                    //     //         $row=$(row);
                    //     //         $row.removeClassSearch(o.selClassPrefix)
                    //     //             .data(o.selName, selType)
                    //     //             .addClass(o.selClasses[selType]);
                    //     //         that.source.selDetails($row);
                    //     //         console.log('rowCallback '+ selType + ' '+ index);
                    //     // },
                    sName: 'user'
                });
                return this;
            },
            _dtSelect: function(options) {
                if (this.options.unique.on) {
                    DT.select(this.dt, this._positions.uniques, { selType: B.obj.getValue('selType', options, 'added') });
                }
            },
            // _tableSelect: function (row, selected, indexes) {
            //     console.log("_tableSelect");
            //     var
            //         ids=this.pdata.selected.ids,
            //         selType= selected ? 'selected' : 'unselected',
            //         o = this.options;
            //     row.every(function (rowIdx, tableLoop, rowLoop) {
            //         var $row = $(this.node()),
            //             data=this.data(),
            //             id=Bajt.getFieldValue(data, "id", o.ecn);

            //         if (selected){
            //             ids.push(id);
            //             // source.selectRows($row, "selected");
            //         }
            //         else{
            //             for (var i=0; i < ids.length; i++){
            //                 if (ids[i] == id) {
            //                     ids.splice(i, 1);
            //                     break;
            //                 }
            //             }
            //             // source.selectRows($row, "unselected");

            //         }
            //         DT.changeRowSelect(this, selType);
            //         this.draw();

            //     });
            // },
            _dtAddSelected: function(e) {
                stopTrigger(e);
                var selected = this.dt.rows({
                        selected: true
                    }),
                    rows = DT.convertRowsData.apply(this, [selected, this.options, this._customImportData]);
                selected.deselect();
                if (B.obj.is$(this.$modal)) {
                    this.$modal.modal('hide');
                }
                this.rowsAdd(rows, true);
            },
            _uniqueFilterChange: function(e) {
                this.filterUnique = this.$uniqueFilter.is(':checked');
                this._dtUniqueFilter();
                console.log('uniquechange');
            },
            _dtUniqueFilter: function() {
                if (this.options.unique.on) {
                    if (this.filterUnique) {
                        DT.hide(this.dt, this._positions.uniques);
                    } else {
                        DT.unhide(this.dt, this._positions.uniques);
                    }
                }
            },
            _change: function(e) {
                // stopTrigger(e);
                this.read();
                this._dtSelect();
                this._dtUniqueFilter();
                // this.element.trigger('changed', {
                //     dtimport: this
                // });
            },
            _rowAdd: function(data) {
                var o = this.options,
                    d = this._positions;
                if (o.unique.on) {
                    d.uniques.push(this._rowUniqueVal(data));
                }
                d.count++;
                if (o.showLp) {
                    data.lp = d.count;
                }
                d.rows.push(data);
                return data;
            },
            _rowUniqueVal: function(data) {
                var o=this.options;
                return B.getFieldValue(data, o.unique.name, o.ecn);
            },
            _rowData: function($row, data) {
                if (undefined === data) {
                    return $row.data('entity');
                }
                $row.data('entity', data);
                return data;
            },
            _rowExportData: function(data) {
                return data;
            },
            _rowImportData: function(data) {
                return data;
            },
            _rowRepeated: function() {
                return 0;
            },
            _rowRemove: function(e) {
                stopTrigger(e);
                var that = this,
                    o = this.options,
                    $row = $(e.target).closest(o.rowSelector),
                    _rm = function() {
                        $row.remove();
                        that.element.trigger('dtImport_rowRemoved');
                        that.element.trigger('change', { dtimport: that });
                    };
                if (o.unique.on) {
                    DT.unselect(this.dt, this._rowUniqueVal(this._rowData($row)));
                }
                if (o.animate) {
                    $row.slideUp(o.animate, _rm);
                } else {
                    _rm();
                }
            },
            _rowValue: function($row, data) {
                if(this.options.saveData){
                    var $input = this._get$input($row);
                    if(B.obj.is$($input)){
                        if (undefined === data) {
                            return $input.readField('json');
                        }
                        $input.writeField(data);
                    }
                }
            },
            _get$input: function($row) {
                return this.options.inputSelector ? $row.find(this.options.inputSelector) : null;
            },
            // _rowsRead: function() {
            //     var o = this.options,
            //         rows = this.rows;
            //     rows = [];
            //     this.element.find(o.rowSelector).each(function() {
            //         rows.push($(this).data('entity'));
            //     });
            //     return this.rows;
            // },
            _$rowAdd: function(data, change) {
                var that=this,
                    o = this.options,
                    d = this._positions,
                    uniqueVal = o.unique.on ? this._rowUniqueVal(data) : null;
                if (o.maxCount > 0 && d.count === o.maxCount) {
                    return null;
                }
                if (uniqueVal && d.uniques.indexOf(uniqueVal) >=0) {
                    this.element.trigger('dtImport_rowUnique', { data: data });
                    return null;
                }
                var $row = $(B.html.getPrototypeTmpl(o.tmpl, o.prototypeName, d.index++)),
                    _showCallBack=function(){
                        that._$rowInit($row);
                        if(change){
                            that.element.trigger('change', { dtimport: that });
                        }
                    };
                this._rowValue($row, data);
                this._rowAdd(data);
                this._$rowFill($row, data).appendTo(this.element);
                console.log('dtImport_rowAdded');
                this.element.trigger('dtImport_rowAdded', { $row: $row});                       
                if (o.animate) {
                    $row.slideDown(o.animate, _showCallBack);
                } else {
                    $row.show(_showCallBack);
                }
                return $row;
            },
            _$rowInit: function($row) {
                if(this.options.confirmRemove){
                    $row
                        .find('.btn-rm[data-toggle=confirmation]')
                        .confirmation($.extend({}, B.confirmationOptions, this.options.confirmationOptions || {}));
                }
            },
            _$rowFill: function($row, data) {
                var o = this.options;
                if (o.unique.on) {
                    var rvalues = B.obj.addToArray(
                        $row.data('values'),
                        {
                            name: o.unique.name,
                            key: o.unique.name
                        },
                        'name'
                    );
                    $row.attr('data-values', JSON.stringify(rvalues));
                }
                $row.data('entity', data).fill(data, o.ecn);
                this._$rowCustomFill($row, data);
                return $row;
            },
            _$rowCustomFill: function($row, data) {
                return $row;
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
                return entity;
            },
            _sort: function() {
                this.element.trigger('change');
            },
            block: function(block) {
                if (B.obj.is$(this.$modalBtn)) {
                    this.$modalBtn[block ? 'hide' : 'show']();
                }
                if (B.obj.is$(this.$addBtn)) {
                    this.$addBtn[block ? 'hide' : 'show']();
                }
                this.element.find('.btn-rm')[block ? 'hide' : 'show']();
            },
            rowFind: function(key, value) {
                var d = this._positions,
                    val = String(value);
                for (var i = 0; i < d.rows.length; i++) {
                    if (String(B.obj.getValue(key, d.rows[i])) === val) {
                        return d.rows[i];
                    }
                }
                return null;
            },
            rowsAdd: function(rows, change) {
                var that=this,
                    count = 0,
                    _add=function(data){
                        return that._$rowAdd(data, change) === null ? 0: 1;
                    };
                if ($.isArray(rows)) {
                    for (var i = 0; i < rows.length; i++) {
                        count += _add(rows[i]);
                    }
                } else if (B.obj.is(rows)) {
                    count += _add(rows);
                }
                return count;
            },
            $rowFind: function(key, value) {
                var $row = null,
                    val = String(value);
                this.$rows.find(this.options.rowSelector).each(function() {
                    var $this = $(this);
                    if (String($this.data(key)) === val) {
                        $row = $this;
                    }
                    return false;
                });
                return $row;
            },
            _rowsInit: function() {
                var that = this,
                    $rows=this.element.find(this.options.rowSelector);
                this._positions.index=$rows.length;
                if(this.options.saveData){
                    $rows.each(function() {
                        var $row = $(this),
                            rowData = that._rowImportData(that._rowValue($row));
                        that._rowAdd(rowData);
                        that._$rowFill($row, rowData);
                        that._$rowInit($row);
                    });
                }
                return this;
            },
            read: function() {
                var that = this,
                    o = this.options,
                    d = this._positions;
                d.rows = [];
                d.uniques = [];
                d.count= 0;
                if(o.saveData){
                    this.element.find(o.rowSelector).each(function() {
                        var $row = $(this),
                            entity = that._$rowRead($row);
                        that._rowAdd(entity);
                        that._$rowFill($row, entity);
                    });
                }
                return d.rows;
            },
            // read: function() {
            //     var that = this,
            //         o = this.options,
            //         lp = 1,
            //         d = this._positions;
            //     this._createData();
            //     this.element.find(o.rowSelector).each(function() {
            //         var entity = that._$rowRead(
            //             $(this),
            //             that.options.showLp
            //                 ? {
            //                       lp: lp++
            //                   }
            //                 : null
            //         );
            //         d.rows.push(entity);
            //         if (o.unique) {
            //             d.uniques.push(that._rowUniqueVal(entity));
            //         }
            //     });
            //     d.count = d.rows.length;
            //     return d.rows;
            // },
            write: function(rows) {
                this.element.empty();
                this._createData();
                this.rowsAdd(rows);
            }
        })
    );
})(jQuery, Bajt);

var DataTable = $.fn.dataTable;

/* Default class modification */
$.extend(DataTable.ext.classes, {
    sProcessing: 'dataTables_processing loader'
});

var DT = {
    options: {
        infoIcons: {
            info: '',
            warning: 'bell-o',
            danger: 'warning'
        },
        selTypes: {
            unselected: '0',
            selected: '1',
            added: '2',
            included: '3'
        },
        selName: 'sel'
    },
    _dispProgress: function(data, options) {
        var v = B.obj.getValue('value', data, data),
            max = B.obj.getValue('max', data, 100),
            progress = B.obj.getValue('progress', data, 100 * v / max),
            progressColor = options.progressColor,
            progressText = B.obj.getValue('progressText', options),
            $bar = $('<div class="progress"><div class="progress-bar"></div></div'),
            $progress = $bar.find('.progress-bar');

        $progress.css('width', progress + '%');
        if (!isSet(progressText)) {
            switch (options.progressType) {
                case 'of':
                    progressText = v + ' z ' + max;
                    break;
                default:
                    progressText = parseInt(progress, 10) + '%';
            }
        }
        if (isSet(progressText)) {
            $progress.text(progressText);
        }
        if (progressColor) {
            if (Bajt.obj.is(progressColor)) {
                var range = Object.keys(progressColor),
                    key = range[0];
                for (var i = 1; i < range.length; i++) {
                    if (range[i] > progress) {
                        break;
                    }
                    key = range[i];
                }
                progressColor = progressColor[key];
            }
            $progress.addClass('bg-' + progressColor);
        }
        return $bar[0].outerHTML;
    },
    _dispTitle: function(value, options) {
        var titleKey = options.titleKey || 'n',
            valStr = value || '';
        if (Bajt.obj.is(valStr)) {
            valStr = valStr.hasOwnProperty(titleKey) ? valStr[titleKey] || '' : JSON.stringify(valStr);
        }
        return B.str.dispValue(valStr, options.dispTitle);
    },
    _display: function(name, data, options) {
        var dispClass = B.obj.getValue('dispClass', options, 'disp-' + name),
            dispKey = B.obj.getValue('dispKey', options, 'n'),
            separator = B.obj.getValue('separator', options, ' '),
            tmpl = typeof options.tmpl === 'string' ? options.tmpl : '<span class="label"></span>';
        var _disp = function(val) {
            var disp = isSet(val) ? val : options.dispEmpty || '',
                id = '';
            if (Bajt.obj.is(val)) {
                disp = val.hasOwnProperty(dispKey) ? val[dispKey] : JSON.stringify(val);
                id = val.v || val.id || val.value;
            }
            disp = B.obj.getValue('prefix', options, '') + disp + B.obj.getValue('sufix', options, '');
            if (options.tmpl) {
                var $el = $(tmpl);
                if (options.dispTitle) {
                    $el.attr('title', options.title || DT._dispTitle(val, options));
                }
                $el.html(disp);
                if (Bajt.str.is(options.icon)) {
                    $('<i class="material-icons md-14" >' + options.icon + '</i').prependTo($el);
                }
                $el.addClass(dispClass + ' disp');
                $el.attr('data-value', id);
                return $el[0].outerHTML;
            }
            return disp;
        };
        if ($.isArray(data)) {
            var shows = [];
            for (var i = 0; i < data.length; i++) {
                shows.push(_disp(data[i]));
            }
            return shows.join(separator);
        }
        return _disp(data);
    },
    clearFilters: function(table) {
        table.settings()[0].oInit.filters = {};
        table.ajax.reload();
    },
    convertRowsData: function(rows, options, customConvert) {
        var that = this,
            importFields = options.importFields || ['id'],
            convertRows = [];
        rows.every(function(rowIdx, tableLoop, rowLoop) {
            convertRows.push(B.entity.export.apply(that, [this.data(), options.ecn, importFields, customConvert]));
        });
        return convertRows;
    },
    setFilter: function(table, name, filter) {
        var topt = table.settings()[0].oInit;
        if (filter !== undefined) {
            if (!Bajt.obj.is(topt.filters)) {
                topt.filters = {};
            }
            if (!Bajt.obj.is(topt.filters[name])) {
                topt.filters[name] = { name: name };
            }
            if (Bajt.obj.is(filter) && filter.hasOwnProperty('value')) {
                $.extend(true, topt.filters[name], filter);
            } else {
                topt.filters[name].value = filter;
            }
        } else if (Bajt.obj.is(topt.filters) && topt.filters.hasOwnProperty(name)) {
            delete topt.filters[name];
        }
        table.ajax.reload();
    },
    setFilters: function(table, filters) {
        var topt = table.settings()[0].oInit;
        if (Bajt.obj.is(filters)) {
            topt.filters = $.extend({}, topt.filters || {});
            //     , {
            //     client: {
            //         value: client.id
            //     }
            // });
        } else if (topt.filters && topt.filters.hasOwnProperty('client')) {
            delete topt.filters['client'];
        }
    },
    getFilterBar: function(table) {
        return filterBars[table.settings()[0].oInit.name] || null;
    },
    get$FilterBar: function(table) {
        var filter=DT.getFilterBar(table);
        return B.obj.is(filter) ? filter.element : null;
    },
    rows: function(table, selector, options) {
        var selectors = Bajt.obj.getValue('selectors', options, {});
        if (Number.isInteger(selector) || $.isArray(selector)) {
            var rowPrefix = table.settings()[0].oInit.rowPrefix || Bajt.obj.getValue('rowPrefix', options, 'id_'),
                ids = $.isArray(selector) ? selector : [selector],
                s = [];
            for (var i = 0; i < ids.length; i++) {
                s.push('#' + rowPrefix + ids[i]);
            }
            selector = s.join();
        } else if (typeof selector === 'string' && selectors.hasOwnProperty(selector)) {
            selector = selectors[selector];
        }
        return selector ? table.rows(selector) : null;
    },
    filter: function(data, settings) {
        var o = settings.oInit,
            filterBar = filterBars[o.name],
            filters = filterBar ? $.extend(filterBar.value(), o.filters || {}) : o.filters || {};
        return $.isPlainObject(filters) && !$.isEmptyObject(filters)
            ? {
                  f: JSON.stringify(filters)
              }
            : null;
        //    var $filterbar=$(this.filterbar),
        //        filters={};
        //    if (typeof(this.filters) != 'undefined'){
        //        $.extend(true, filters, this.filters);
        //    }
        //    $filterbar.find('.form-control').each(function(index, element){
        //        var field=getFieldName(element),
        //            filter=$(element).val();
        //        if (filter !== ''){
        //            filters[field]=filter;
        //        }
        //    });
        //    return filters;
    },
    changeRowSelect: function(row, selType) {
        if (Bajt.obj.is(row)) {
            row.every(function(rowIdx, tableLoop, rowLoop) {
                var data = this.data();
                data.sel = selType;
                data.pos_sel = selType;
                this.data(data);
            });
        }
        return row;
    },
    select: function(table, selector, options) {
        return DT.changeRowSelect(DT.rows(table, selector, options), B.obj.getValue('selType', options, 'selected'));
    },
    unselect: function(table, selector, options) {
        return DT.changeRowSelect(DT.rows(table, selector, options), 'unselected');
    },
    hide: function(table, selector, options) {
        var rows = DT.rows(table, selector, options);
        if (B.obj.is(rows)) {
            rows
                .nodes()
                .to$()
                .css({ display: 'none' });
        }
    },
    unhide: function(table, selector, options) {
        DT.rows(table, selector, options)
            .nodes()
            .to$()
            .css({ display: 'table-row' });
    },
    rowCallBack: {
        select: function(row, data, index, options) {
            var DTo = DT.options,
                selName = B.obj.getValue('selName', options, DTo.selName),
                selType = B.obj.getValue(selName, data, 'unselected'),
                $row = $(row);
            $row.removeClassSearch(B.obj.getValue('selClassPrefix', options, DTo.selClassPrefix));

            if (selType !== 'unselected') {
                var selClasses = B.obj.getValue('selClasses', options, DTo.selClasses);
                $row.attr('data-' + selName, selType);
                $row.addClass(selClasses[selType]);
            } else {
                $row.removeAttr('data-' + selName);
            }
        }
    },
    renders: {
        generic: function(data, type, full, meta) {
            var o = meta.settings.oInit,
                co = o.columns[meta.col];
            // if (co.name === 'packages') {
            //     var disp = '';
            // }
            if (data === undefined || data === null) {
                return '';
            }
            if (Bajt.obj.is(data) && co.key) {
                var value;
                if ($.isArray(data)) {
                    value = [];
                    for (var i = 0; i < data.length; i++) {
                        value.push(B.obj.getValue(co.key, data[i], ''));
                    }
                } else {
                    value = B.obj.getValue(co.key, data, '');
                }
                return DT._display(co.name, value, co);
            }
            return data;
        },
        sel: function(data, type, full, meta) {
            // var o = meta.settings.oInit;
        },
        area: function(data, type, full, meta) {
            return B.str.fixed(data, 3);
        },
        empty: function(data, type, full, meta) {
            return isSet(data) ? data : '';
        },
        active: function(data, type, full, meta) {
            return B.html.get('icon', { icon: data ? 'check_box' : 'check_box_outline' });
        },
        netto: function(data, type, full, meta) {
            return (
                '<span class="netto">' +
                B.str.fixed(data, 2) +
                '</span><span class="brutto">' +
                B.str.fixed(data * 1.23, 2) +
                '</span>'
            );
        },
        date: function(data, type, full, meta) {
            var o = meta.settings.oInit,
                co = o.columns[meta.col],
                // info = B.obj.getValue('entitySettings.info.term', o, { error: [{ condition: { c: 'lt', v: 0 }, msg: 'Upłynął termin' }] }),
                name = B.getFullFieldName(co.data, o.ecn),
                date = B.str.date(data, co);
            return DT._display(name, date, co);
        },
        term: function(data, type, full, meta) {
            if (!isSet(data)) {
                return '';
            }
            var o = meta.settings.oInit,
                co = $.extend({ tmpl: '<span></span>' }, o.columns[meta.col]),
                name = B.getFullFieldName(co.data, o.ecn),
                info = B.obj.getValue('entitySettings.info.term', o, {
                    error: [{ condition: { c: 'lt', v: 0 }, msg: 'Upłynął termin' }]
                }),
                date = B.str.date(data, co),
                m = B.moment(data);
            if (m && Bajt.obj.is(info)) {
                var inf = null,
                    diff = m.diff(moment(), 'days');
                for (var k in info) {
                    if ((inf = B.checkLimits(info[k], diff)) !== null) {
                        inf.type = k;
                        break;
                    }
                }
                if (inf) {
                    co.icon = B.obj.getValue(['infoIcons', k], DT.options);
                    co.title = inf.msg;
                    co.dispTitle = true;
                    co.dispClass = B.str.addUnique(co.dispClass, 'disp-' + k);
                }
            }
            return DT._display(name, date, co);
        },
        roles: function(data, type, full, meta) {
            var roles = '';
            if ($.isArray(data)) {
                for (var i in data) {
                    roles += '<span class="">' + data[i] + '</span> ';
                }
            }
            return roles;
        },
        actions: function(data, type, full, meta) {
            var o = meta.settings.oInit,
                // co = o.columns[meta.col],
                $actions = $('<div/>').html(o.columns[meta.col].tmpl.replace(/__id__/g, full.id)),
                _customAction = function(action, type) {
                    var $a = $actions.find('.btn-' + action);
                    if (Bajt.obj.is$($a)) {
                        $a
                            .after(
                                $('<span>')
                                    .addClass($a.attr('class'))
                                    .addClass(type)
                            )
                            .remove();
                    }
                },
                _checkConditions = function(check, value) {
                    var ok = false;
                    if ($.isArray(check.condition)) {
                        var ok1 = !check.hasOwnProperty('logical') || check.logical === 'and';
                        ok = ok1;
                        for (var k = 0; ok === ok1 && k < check.condition.length; k++) {
                            ok = B.compareValues(check.condition[k].c, value, check.condition[k].v);
                        }
                    } else {
                        ok = B.compareValues(check.condition.c, value, check.condition.v);
                    }
                    return ok;
                },
                _check = function(custom) {
                    var ok1 = !custom.hasOwnProperty('logical') || custom.logical === 'and',
                        ok = ok1;
                    for (var l = 0; ok === ok1 && l < custom.fields.length; l++) {
                        var val = B.getFieldValue(full, custom.fields[l].name, o.ecn);
                        ok = _checkConditions(custom.fields[l].check, val);
                    }
                    return ok;
                };

            if (Bajt.obj.is(o.customActions)) {
                for (var c in o.customActions) {
                    for (var i = 0; i < o.customActions[c].length; i++) {
                        var ca = o.customActions[c][i];
                        if (_check(ca)) {
                            if ($.isArray(ca.actions)) {
                                for (var j = 0; j < ca.actions.length; j++) {
                                    _customAction(ca.actions[j], c);
                                }
                            } else {
                                _customAction(ca.actions, c);
                            }
                        }
                    }
                }
            }
            return $actions.html();
        },
        progress: function(data, type, full, meta) {
            var o = meta.settings.oInit,
                co = o.columns[meta.col];
            return DT._dispProgress(data, co);
        },
        childParams: function(data, type, full, meta) {
            var o = meta.settings.oInit,
                ecn = o.ecn,
                co = o.columns[meta.col],
                paramName = co.paramName || '',
                childName = co.childName || '',
                child_ecn = B.entity.getChildClass(childName, ecn),
                childs = B.getFieldValue(full, childName, ecn),
                html = '',
                params = {};
            if ($.isArray(childs)) {
                var i = 0,
                    dic = B.dic.get(co.dicName || paramName, child_ecn);
                if (!co.dispKey) {
                    co.dispKey = 's';
                }
                for (i = 0; i < childs.length; i++) {
                    var param = B.getFieldValue(childs[i], paramName, child_ecn);
                    param = Bajt.obj.is(param) ? param.v || param.id || param.value : param;
                    if (params.hasOwnProperty(param)) {
                        params[param]++;
                    } else {
                        params[param] = 1;
                    }
                }
                for (i in params) {
                    var val = B.dic.from(dic, i);
                    html += DT._display(
                        paramName,
                        val,
                        $.extend({}, co, {
                            title: DT._dispTitle(val, co) + ' - pozycji ' + params[i]
                        })
                    );
                    // html += '<span class="label bg-info">' + val[dispKey] + '</span>';
                }
            }
            return html;
        },
        dic: function(data, type, full, meta) {
            if (!isSet(data)) {
                return '';
            }
            var o = meta.settings.oInit,
                co = o.columns[meta.col],
                separator = co.separator || ',',
                name = B.getFullFieldName(co.data, o.ecn),
                _convertData = function(find) {
                    if (typeof find === 'string') {
                        if (Bajt.json.isArray(find)) {
                            return JSON.parse(find);
                        } else if (find.indexOf(separator) > 0) {
                            return find.split(separator);
                        }
                    }
                    return find;
                },
                value = B.getFromDictionary(co.dicName || name, o.ecn, _convertData(data), { name: null });
            return DT._display(name, value, co);
        },
        detail: function(data, type, full, meta) {
            return '';
        },
        precent: function(data, type, full, meta) {
            return B.str.fixed(data, 2) + '%';
        }
    }
};

$.extend(
    true,
    DT.options,
    (function(o) {
        var exto = {
            selClassPrefix: o.selName + '-',
            selClasses: {},
            selectors: {}
        };
        for (var type in o.selTypes) {
            var types = $.isArray(o.selTypes[type]) ? o.selTypes[type] : [o.selTypes[type]],
                classes = [],
                selectors = [],
                selPrefix = '.' + exto.selClassPrefix;
            for (var j = 0; j < types.length; j++) {
                classes.push(exto.selClassPrefix + types[j]);
                selectors.push(selPrefix + types[j]);
            }
            exto.selClasses[type] = classes.join(' ');
            exto.selectors[type] = selectors.join();
        }
        return exto;
    })(DT.options)
);

function tabDetailOrders(data, tmpl, entityClassName) {
    var $detail = $(tmpl),
        filled = B.entity.fill(data, entityClassName, {
            // checkDiff: ordersCheckParameters(data)
        });
    $detail.fill(filled, 'Orders', {
        full: true
    });
    return $detail;
}

$('body').on('shown.bs.tab', 'a[data-toggle="tab"]', function(e) {
    $($(e.target).attr('href')).redrawDataTables();
});

$('body').on('click', '.dataTable a[data-action]', function(e) {
    e.preventDefault();
    $(this).dtBtnAction();
});

$(window).on('resize', function(e) {
    $('body').redrawDataTables();
});

(function($) {
    //    console.log($.fn.dataTableExt.oStdClasses);
    // var _dtClasses = {
    //     sWrapper: ['flex-auto', 'flex-box'],
    //     sScrollWrapper: ['flex-auto', 'flex-box'],
    //     sScrollBody: ['flex-auto']
    // };

    function _dtAddClass(settings, name, classes) {
        console.log('_dtAddClass');
        if (Bajt.obj.is(name)) {
            $.each(name, function(key, val) {
                _dtAddClass(settings, key, val);
            });
        } else if (typeof name === 'string' && typeof classes !== undefined) {
            var c = (settings[name] || '').split(' '),
                c1 = $.isArray(classes) ? classes : classes.split('');
            settings[name] = c.concat(c1).join(' ');
            console.log(settings[name]);
        }
    }
    //    _dtAddClass($.fn.dataTableExt.oStdClasses, _dtClasses);

    //    console.log($.fn)
    $.fn.initDataTable = function() {
        var $this = $(this),
            tableOptions = $this.data(),
            ecn = tableOptions.ecn,
            name = tableOptions.name,
            rowPrefix = tableOptions.rowPrefix || 'dt_' + name + '_',
            defaults = {
                language: {
                    processing: '<div class="animate"></div><div class="msg">Poczekaj, wczytuję ...</div>',
                    search: 'Szukaj:',
                    print: 'Drukuj',
                    lengthMenu: 'Pokaż _MENU_ pozycji',
                    info: 'Pozycje od _START_ do _END_ z _TOTAL_ łącznie',
                    infoEmpty: 'Pozycji 0 z 0 dostępnych',
                    infoFiltered: '(filtrowanie spośród _MAX_ dostępnych pozycji)',
                    infoPostFix: '',
                    loadingRecords: 'Wczytywanie...',
                    zeroRecords: 'Nie znaleziono pasujących pozycji',
                    emptyTable: 'Brak danych',
                    select: {
                        rows: { _: ' (zaznaczono %d wierszy)', 0: '', 1: ' (zaznaczony wiersz' },
                        columns: { _: ' (zaznaczono %d kolumn)', 0: '', 1: ' (zaznaczono 1 kolumnę)' },
                        cells: { _: ' (zaznaczono %d komórek)', 0: '', 1: ' (zaznaczono 1 komórkę)' }
                    },
                    buttons: {
                        selected: 'Zanaczono',
                        selectedSingle: 'Zaznaczenie pojedyńcze',
                        selectNone: 'Odznacz',
                        selectAll: 'Zaznacz',
                        selectRow: 'Zaznaczono wiersz',
                        selectRows: 'Zaznaczono wiersze',
                        selectColumn: 'Zaznaczono kolumnę',
                        selectColumns: 'Zaznaczono kolumny',
                        selectCell: 'Zaznaczono komórkę',
                        selectCells: 'Zaznaczono komórki'
                    },
                    paginate: {
                        first: 'Pierwsza',
                        previous: 'Poprzednia',
                        next: 'Następna',
                        last: 'Ostatnia'
                    },
                    aria: {
                        sortAscending: ': aktywuj, by posortować kolumnę rosnąco',
                        sortDescending: ': aktywuj, by posortować kolumnę malejąco'
                    }
                },
                processing: true,
                autoWidth: false,
                dom:
                    '<"d-flex flex-wrap my-1 justify-content-between dataTables_utils"Bf>' +
                    'tr' +
                    '<"d-flex flex-wrap my-1 justify-content-between  dataTables_utils"ip>',
                buttons: [
                    {
                        extend: 'colvis',
                        text: 'Widoczne kolumny'
                    },
                    {
                        extend: 'pdf',
                        text: 'PDF'
                    },
                    {
                        extend: 'csv',
                        text: 'CSV'
                    },
                    {
                        extend: 'excel',
                        text: 'Excel'
                    }
                ],
                ajax: {
                    data: DT.filter
                },
                pageLength: 100,
                scrollY: true,
                scrollCollapse: true,
                order: [],
                rowPrefix: rowPrefix,
                classes: {
                    scrollBody: 'vvvc'
                },
                createdRow: function(row, data, index) {
                    $(row).attr('id', rowPrefix + data.id);
                }
            };
        tableOptions.entitySettings = Bajt.getEntitySettings(ecn);
        $.each(tableOptions.columns, function(idx, column) {
            var fn,
                fullname = B.getFullFieldName(column.data || '', ecn),
                align = column.align || 'center',
                className = column.className ? [column.className] : [];
            if (fullname) {
                column.name = fullname;
            }
            if (column.render !== undefined) {
                fn = column.render;
            } else {
                //default renders
                switch (fullname) {
                    case 'area':
                    case 'areaLack':
                        fn = 'area';
                        break;
                    default:
                        fn = 'generic';
                }
            }
            if (fn !== undefined) {
                var fn_cc = B.str.camelCase(fn);
                if (typeof DT.renders[fn_cc] === 'function') {
                    column.render = DT.renders[fn_cc];
                } else {
                    fn = 'tabRender' + B.str.capitalise(fn);
                    if (typeof window[fn] === 'function') {
                        column.render = window[fn];
                    }
                }
            }
            if (typeof align === 'string') {
                className.push('dt-' + align);
            } else {
                className.push('dt-head-' + (align.head || 'center'));
                className.push('dt-body-' + (align.body || 'center'));
            }
            column.className = className.join(' ');
        });
        if (Bajt.obj.is(tableOptions.details)) {
            var fn = tableOptions.details.render;
            if (fn) {
                fn = 'tabDetail' + B.str.capitalise(fn);
                if (typeof window[fn] !== 'undefined') {
                    tableOptions.details.render = window[fn];
                } else {
                    delete tableOptions.details['render'];
                }
            }
        }
        if(Bajt.obj.is(tableOptions.select)){
            defaults.buttons.unshift( 'selectAll', 'selectNone');
        }
        if (tableOptions.hasOwnProperty('copyTextarea')) {
            var $textarea = $(tableOptions.copyTextarea);
            if (Bajt.obj.is$($textarea)) {
                console.log('dt copy area init');
                $textarea.initCopyTextarea({
                    entitySettings: tableOptions.entitySettings
                });
            }
        }
        $this.data($.extend(true, {}, defaults, tableOptions));
        dataTables[name] = $this.DataTable();
        $this.on('click', 'tr td.dt-detail', function() {
            var tr = $(this).closest('tr'),
                row = dataTables[name].row(tr),
                opt = dataTables[name].settings()[0].oInit;
            if (typeof opt.details.render === 'function') {
                if (row.child.isShown()) {
                    row.child.hide();
                    tr.removeClass('shown');
                    tr.trigger('details-hidden.dt', [dataTables[name], row]);
                } else {
                    row.child(opt.details.render(row.data(), opt.detailTmpl, opt.ecn)).show();
                    tr.addClass('shown');
                    tr.trigger('details-shown.dt', [dataTables[name], row]);
                }
            }
        });
    };

    $.fn.redrawDataTables = function() {
        var $dt = $(this).find('.datatable');
        if (Bajt.obj.is$($dt)) {
            $dt.each(function() {
                $(this)
                    .DataTable()
                    .draw();
            });
        }
    };

    $.fn.initDataTables = function() {
        $(this)
            .find('.datatable')
            .each(function() {
                var $table = $(this);
                $table.initDataTable();
                //            $table.parents('.dataTables_wrapper').find('.dt-buttons, .dataTables_filter').addClass('col-xs').wrapAll('<div class="flex-on"></div>');
                //            $table.parents('.dataTables_wrapper').find('.dataTables_info, .dataTables_paginate').addClass('col-xs').wrapAll('<div class="flex-on"></div>');
                //                $(this).DataTable({
                //                language: {
                //                    "processing":     "Przetwarzanie...",
                //                    "search":         "Szukaj:",
                //                    "print":    "Drukuj",
                //                    "lengthMenu":     "Pokaż _MENU_ pozycji",
                //                    "info":           "Pozycje od _START_ do _END_ z _TOTAL_ łącznie",
                //                    "infoEmpty":      "Pozycji 0 z 0 dostępnych",
                //                    "infoFiltered":   "(filtrowanie spośród _MAX_ dostępnych pozycji)",
                //                    "infoPostFix":    "",
                //                    "loadingRecords": "Wczytywanie...",
                //                    "zeroRecords":    "Nie znaleziono pasujących pozycji",
                //                    "emptyTable":     "Brak danych",
                //                    "paginate": {
                //                            "first":      "Pierwsza",
                //                            "previous":   "Poprzednia",
                //                            "next":       "Następna",
                //                            "last":       "Ostatnia"
                //                    },
                //                    "aria": {
                //                            "sortAscending": ": aktywuj, by posortować kolumnę rosnąco",
                //                            "sortDescending": ": aktywuj, by posortować kolumnę malejąco"
                //                    }
                //            },
                //                autoWidth : false,
                //                dom: "Bfrtip",
                //                buttons: [
                //                    { extend:  'colvis', text : 'Widoczne kolumny'},
                //                    { extend:  'pdf', text : 'PDF'},
                //                    { extend:  'excel', text : 'Excel'},
                //                    { extend:  'print', text : 'Drukuj'}
                //                ],
                //                pageLength: 100
                //            });
            });
    };

    $.widget('bajt.filterbar', {
        options: {
            tmpl:
                '<div class="row-data"><div class="col-xs-4">__0__</div><div class="col-xs-8">__1__</div><div class="col-xs-8">__2__</div><div class="col-xs-4">__3__</div></div>'
        },
        _create: function() {
            var $e = this.element,
                settings = $e.data('options');
            this.fdata = {
                value: {},
                hiddens: settings ? settings.hiddenFilters || {} : {}
            };
            this.tableName = $e.attr('id').replace('_filterbar', '');
            this.$filters = $e.find('.filter');
            this.$submit = $e.find('.btn-filter');
            this._read();
            this._bind();
        },
        _bind: function() {
            var that = this;
            that._on(that.$submit, {
                click: that._submit
            });
        },
        _read: function() {
            var that = this,
                d = this.fdata,
                filters = {};
            that.$filters.each(function() {
                var $f = $(this),
                    f_opt = $f.data('filter-options'),
                    fname = $f.getFieldName(),
                    name = $f.data('name'),
                    value = $f.readField('string');
                if (isSet(value) && !($.isArray(value) && value.length === $f.find('option').length)) {
                    filters[fname] = {
                        value: value,
                        options: f_opt
                    };
                    if (name) {
                        filters[fname].name = name;
                    }
                }
            });
            return (d.value = filters);
        },
        value: function(value) {
            var d = this.fdata;
            if (value === undefined) {
                return $.extend({}, d.value, d.hiddens);
            }
            d.value = value;
        },
        //        hidden:function(value){
        //            var d=this.fdata;
        //            if ( value === undefined )
        //                return d.hiddens;
        //            d.hiddens=value;
        //        },
        hidden: function(filters) {
            var hf = this.fdata.hiddens;
            if (filters !== undefined) {
                for (var fn in hf) {
                    hf[fn] = filters[fn];
                }
            }
            return hf;
        },
        rmHidden: function(filterName) {
            var hf = this.fdata.hiddens;
            if (hf.hasOwnProperty(filterName)) {
                delete hf[filterName];
            }
        },
        getJSON: function() {
            return JSON.stringify(this.fdata.value);
        },
        _submit: function() {
            //            this.$datatable.data('filters', this._read());
            this._read();
            //            var kk= this.$datatable.data('bootstrap.table');
            //            this.$datatable.bootstrapTable('refresh');
            //console.log('filter');
            dataTables[this.tableName].ajax.reload();
        },
        _clear: function() {},
        _recognize: function() {},
        _save: function(e, data) {},
        _change: function(e, data) {},
        _title: function() {},
        _view: function() {},
        show: function(order) {}
        //
    });

    $.fn.initFilterBar = function() {
        this.find('.filterbar').each(function() {
            var $this = $(this),
                name = $this.attr('id').replace('_filterbar', '');
            filterBars[name] = $this.filterbar().data('bajtFilterbar');
        });
    };
})(jQuery);

// function queryParams(params) {
//     var
//         $filterbar = $(Bajt.html.validateSelector(this.filterbar)),
//         filters = isSet($filterbar) ? $filterbar.filterbar('value') : {};
//     if (typeof (this.filters) != 'undefined') {
//         $.extend(true, filters, this.filters);
//     }
//     return {
//         filters: JSON.stringify(filters)
//     };
// };

// function tabRenderDic(data, type, full, meta){

//     var o=meta.settings.oInit,
//         co=o.columns[meta.col],
//         name=B.getFullFieldName(co.data, o.ecn),
//         dispClass=co.dispClass || 'disp-'+name,
//         dispKey=co.dispKey || 'n',
//         titleKey=co.titleKey || 'd',
//         separator=co.separator || ',',
//         _convertData=function(find){
//             if(typeof find === 'string'){
//                 if(Bajt.json.isArray(find)){
//                     return JSON.parse(find);
//                 }else if(find.indexOf(separator)>0){
//                     return find.split(separator);
//                 }
//             }
//             return find;
//         },
//         _disp=function(val){
//             var disp=val,
//                 title='',
//                 id='';
//             if(Bajt.obj.is(val)){
//                 var strVal=JSON.stringify(val);
//                 disp= val.hasOwnProperty(dispKey) ? val[dispKey] : JSON.stringify(val);
//                 title= val.hasOwnProperty(titleKey) ? val[titleKey] : disp;
//                 id= val.v || val.id || val.value;
//             }
//             if(co.tmpl){
//                 var $el=$(typeof co.tmpl === 'string' ? co.tmpl :  '<span class="label"></span>');
//                 $el.text(disp).attr('title', title );
//                 $el.addClass(dispClass+ " disp");
//                 $el.attr('data-value', id);
//                 return $el[0].outerHTML;
//             }
//             return disp;
//         },
//         value=B.getFromDictionary(co.dicName || name, o.ecn, _convertData(data), {name: null});
//     if($.isArray(value)){
//         var shows=[];
//         for(var i=0; i<value.length; i++){
//             shows.push(_disp(value[i]));
//         }
//         return shows.join(separator);
//     }else if(Bajt.obj.is(value)){
//         return _disp(value);
//     }
//     return co.dispEmpty || '';
// }
// function tabRenderDic(data, type, full, meta){
//     var o=meta.settings.oInit,
//         co=o.columns[meta.col],
//         disp=data,
//         title=data,
//         find=data,
//         value;
//         value=B.getFromDictionary(co.dicName || co.name, o.ecn, data);
//     if(Bajt.obj.is(value)){
//         var
//             dispKey=co.dispKey || 'n',
//             titleKey=co.titleKey || 'd';
//         if(value.hasOwnProperty(dispKey)) disp=value[dispKey];
//         if(value.hasOwnProperty(titleKey)) title=value[titleKey];
//     }
//     if(co.tmpl){
//         var $el=$(typeof co.tmpl === 'string' ? co.tmpl :  '<span class="label"></span>');
//         $el.text(disp).addClass((co.dispClass || co.name) +'-'+data).attr('title', title );
//         return $el[0].outerHTML;
//     }
// //        console.log(co);
//     return disp;
// }

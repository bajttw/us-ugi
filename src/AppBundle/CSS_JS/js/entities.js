// function validateEntityName(name) {
//     return (name === 'positionLackers' ? 'lackers' : (name.slice(-1) === 's' ? name : name + 's'));
// }
(function($, B) {
    'use strict';
    $.extend(true, B, {
        settings: {
            entities: {}
        },
        entity: {
            fill: function(entity, entityClassName, options) {
                var ne = {},
                    o = $.extend(
                        {
                            def: ''
                        },
                        options || {}
                    ),
                    _trans = function(value, fieldName) {
                        if (value === undefined || value === null) {
                            return o.def;
                        }
                        var record = B.getFromDictionary(fieldName, entityClassName, value, { name: false });
                        return B.obj.is(record) ? record : value;
                    },
                    _compare = function(v1, v2, fieldName) {
                        if (fieldName === 'lackers' || fieldName === 'positionLackers') {
                            var ok = true;

                            if ($.isArray(v1) && $.isArray(v2) && v1.length === v2.length) {
                                for (var i = 0; i < v1.length && ok; i++) {
                                    ok =
                                        ok &&
                                        v1[i].sq === v2[i].sq &&
                                        v1[i].opt === v2[i].opt &&
                                        v1[i].com === v2[i].com &&
                                        v1[i].color.id === v2[i].color.id;
                                }
                            } else {
                                ok = false;
                            }
                            return ok;
                        } else if (B.obj.is(v1) || $.isArray(v1)) {
                            return JSON.stringify(v1) === JSON.stringify(v2);
                        }
                        return v1 === v2;
                    };
                for (var key in entity) {
                    var k = B.getFullFieldName(key, entityClassName), //get field name
                        nv,
                        diff,
                        checkDiff = o.checkDiff ? o.checkDiff[k] : false,
                        v = B.json.is(entity[key]) ? JSON.parse(entity[key]) : entity[key];
                    if (checkDiff) {
                        diff = !_compare(checkDiff.value, v, k);
                    }
                    if ($.isArray(v) || B.obj.is(v)) {
                        var child_ecn = B.entity.getChildClass(k, entityClassName);
                        if ($.isArray(v)) {
                            nv = [];
                            for (var i = 0, ien = v.length; i < ien; i++) {
                                nv.push(B.obj.is(v[i]) ? B.entity.fill(v[i], child_ecn, options) : _trans(v[i], k));
                            }
                        } else {
                            nv = B.entity.fill(v, child_ecn, options);
                        }
                    } else {
                        nv = _trans(v, k);
                    }
                    ne[k] = checkDiff ? $.extend({ Value: nv, diff: diff }, checkDiff.opt || {}) : nv;
                }
                return ne;
            },
            getChildClass: function(field, fields) {
                if (typeof fields === 'string') {
                    fields = B.entity.getFields(fields);
                }
                if (B.obj.is(fields) && fields.hasOwnProperty('childs')) {
                    return fields.childs[typeof field === 'string' ? field : field[0]];
                }
                return null;
            },
            getChildName: function(field, fields) {
                var childName = this.entity.getChildClass(field, fields),
                    es = B.settings.entities;
                if (es.hasOwnProperty(childName)) {
                    return es[childName].en;
                }
                return null;
            },
            getFields: function(entityClassName) {
                return B.getEntitySettings(entityClassName).fields;
            },
            getChildFields: function(field, fields) {
                var childName = B.entity.getChildClass(field, fields),
                    es = B.settings.entities;
                if (es.hasOwnProperty(childName)) {
                    return es[childName].fields;
                }
                return null;
            },
            getName: function(entityClassName) {
                var es = this.settings.entities;
                if (es.hasOwnProperty(entityClassName)) {
                    return es[entityClassName].en;
                }
                return null;
            },
            export: function(entity, entityClassName, fields, customExport) {
                var dataIn = B.entity.fill(entity, entityClassName),
                    dataOut = {};
                if (!B.obj.is(fields)) {
                    fields = ['id'];
                }
                for (var i in fields) {
                    var val = B.obj.getValue(fields[i], dataIn);
                    val = B.json.is(val) ? JSON.parse(val) : val;
                    if (B.obj.is(val) && val.hasOwnProperty('v')) {
                        val = parseInt(val.v, 10);
                    }
                    if (isNaN(Number(i))) {
                        dataOut[i] = val;
                    } else {
                        dataOut[fields[i]] = val;
                    }
                }
                dataOut = B.convertDataGroup(dataOut);
                return typeof customExport === 'function' ? customExport.apply(this, [dataOut, entity]) : dataOut;
            }
        },

        convertDataGroup: function(data) {
            var key,
                keys,
                _set = function(obj) {
                    var k0 = keys.shift();
                    if (keys.length > 0) {
                        if (!B.obj.is(obj[k0])) {
                            obj[k0] = {};
                        }
                        _set(obj[k0]);
                    } else {
                        obj[k0] = data[key];
                    }
                };
            if (B.obj.is(data)) {
                for (key in data) {
                    keys = key.split('.');
                    if (keys.length > 1) {
                        _set(data);
                        delete data[key];
                    }
                }
            }
            return data;
        },
        genNumber: function(generator, nr, options) {
            var gen = [],
                entity = B.obj.getValue('entity', options, {}),
                fields = B.obj.getValue('fields', options, {});
            nr = nr ? String(nr) : '';
            if (B.obj.is(generator)) {
                for (var k in generator) {
                    var g = generator[k];
                    if (B.obj.is(g)) {
                        var type = B.obj.getValue('type', g, '').toLowerCase(),
                            code = B.obj.getValue('code', g, '');
                        switch (type) {
                            case 'field':
                                var v = B.getFieldValue(entity, code, fields);
                                if (v !== undefined) {
                                    gen.push(String(v));
                                }
                                break;
                            case 'date':
                                gen.push(moment.format(code));
                                break;
                            default:
                                switch (code) {
                                    case 'nr':
                                        gen.push(nr);
                                        break;
                                    default:
                                        gen.push(code);
                                }
                        }
                    } else {
                        gen.push(g);
                    }
                }
            }
            return gen.length > 0 ? gen.join('') : nr;
        },
        getFieldNames: function(field, fields) {
            var names = (function() {
                    if ($.isArray(field)) {
                        return field;
                    }
                    return field.indexOf('.') > 0 ? field.split('.') : field.split('_');
                })(),
                fns = [],
                sns = [];
            if (typeof fields === 'string') {
                fields = this.entity.getFields(fields);
            }

            for (var i = 0; i < names.length; i++) {
                var fn = names[i],
                    sn = names[i];
                if (B.obj.is(fields)) {
                    for (var n in fields) {
                        if (fn === n || fn === fields[n]) {
                            fn = n;
                            sn = fields[n];
                            break;
                        }
                    }
                    if (i + 1 < names.length) {
                        fields = B.entity.getChildFields(fn, fields);
                    }
                }
                fns.push(fn);
                sns.push(sn);

                // for (var name in fields){
                //     if (field === name || field === fields[name] )
                //         return [ name, fields[name] ];
                // }
            }
            return [fns.join('.'), sns.join('.')];
        },
        getFieldValue: function(obj, name, fields, key) {
            if (!B.obj.is(obj)) {
                return undefined;
            }
            if (typeof fields === 'string') {
                fields = this.entity.getFields(fields);
            }
            var names = name.split('.'), //nazwa zmiennej w obiekcie zagłębienie rozdzielone . (obj.obj1.obj2.val)
                value = obj,
                i = 0,
                n;
            while (names[i]) {
                n = this.getFieldNames(names[i], fields); //pobranie nazwy lub skrótu
                if (typeof value === 'undefined') {
                    console.log('value undefined');
                    console.log(n);
                }
                value = typeof n === 'string' ? value[n] : value[n[0]] || value[n[1]];
                fields = this.entity.getChildFields(n, fields);
                i++;
            }
            return B.obj.is(value) && key ? value[key] : value;
        },        
        setFieldValue: function(obj, name, fields, value) {
            if (typeof fields === 'string') {
                fields = this.entity.getFields(fields);
            }
            var n = this.getFieldNames(name, fields),
                key;
            if (typeof n === 'string') {
                key = n;
            } else if (n[0] in obj) {
                key = n[0];
            } else {
                key = n[1];
            }
            obj[key] = value;
            return obj;
        },
        getFromDictionary: function(dicName, entityClassName, value, options) {
            if (B.obj.is(options)) {
                if (!options.hasOwnProperty('name')) {
                    options.name = 'n';
                }
            } else {
                options = { name: 'n' };
            }
            value = B.dic.from(B.dic.get(dicName, entityClassName), value, options);
            return value;
        },
        getFullFieldName: function(field, fields) {
            if (typeof fields === 'string') {
                fields = this.entity.getFields(fields);
            }
            var names = this.getFieldNames(field, fields);
            return B.obj.is(names) ? names[0] : names || '';
        },
        getEntitySettings: function(entityClassName) {
            return B.settings.entities[entityClassName];
        },

        html: {
            showObj: function(obj, tmpl, entityClassName) {
                var that = this,
                    $show = $(tmpl),
                    fields = this.entity.getFields(entityClassName),
                    $fields = $show.find('[data-name]');
                $fields.each(function() {
                    var $f = $(this),
                        opt = $f.data(),
                        value = that.getFieldValue(obj, opt.name, fields);
                    if (opt.dictionary) {
                        var row = B.dic.from(opt.dictionary, value);
                        value = row ? row['n'] : value;
                    }
                    if (opt.tip) {
                        if (value) {
                            $f.data('content', value);
                            $f.popover({ container: 'body' });
                            $f.show();
                        }
                    } else {
                        // var type = $f.getFieldType();
                        //            var gg= $.inArray(type, ['select','input','textarea'] ) >=0;
                        //            if ($f.hasClass('form-control'))
                        if ($f.is(':input')) {
                            $f.val(value);
                        } else {
                            $f.html(value);
                        }
                        $f.attr('title', value);
                    }
                    if (opt.signal) {
                        if (value) {
                            $f.show();
                        } else {
                            $f.hide();
                        }
                    }
                });
                return $show;
            }
        }
    });

    $.fn.fill = function(data, entityClassName, options) {
        var $this = $(this),
            o = $.extend(
                true,
                {
                    empty: '',
                    full: false,
                    diffClass: 'diff',
                    templates: {
                        diff: B.html.get('icon', { icon: 'star', addClass: 'md-14 show-diff' })
                    }
                },
                options || {},
                $this.data() || {}
            ),
            // fieldsNames=B.getFieldNames(entityClassName),
            _template = function(field, $element) {
                var p;
                if (B.obj.is(field)) {
                    if (o.templates) {
                        p = o.templates[field.options.tmplName || field.fullname];
                    }
                    if (!p) {
                        p = field.options.tmpl;
                    }
                    field.tmpl = p;
                } else {
                    if (o.templates) {
                        p = o.templates[field === 'positionLackers' ? 'lackers' : field];
                    }
                    if (!p) {
                        p = $element.data('tmpl');
                    }
                }
                return p;
            },
            _trans = function(field) {
                var val,
                    fo = field.options || {},
                    transCustom = B.obj.getValue('trans', fo),
                    disp = B.obj.getValue('disp', fo);
                if (B.obj.is(field.value) && 'Value' in field.value) {
                    //expand diff value
                    field.diff = field.value.diff;
                    field.defVal = field.value.defVal;
                    if (field.diff === false && field.value.sameVal) {
                        field.value = field.value.sameVal;
                        return field;
                    }
                    val = field.value.Value;
                } else {
                    val = field.value;
                }
                if (val === undefined || val === null) {
                    val = field.options.empty || o.empty;
                }
                if (transCustom) {
                    if (B.obj.is(transCustom) && typeof window[transCustom.fn] === 'function') {
                        val = window[transCustom.fn](val, transCustom.par);
                    } else if (typeof window[transCustom] === 'function') {
                        val = window[transCustom](val);
                    }
                }
                if (!B.obj.is(val)) {
                    var dicVal = B.getFromDictionary(
                        B.obj.getValue('dicName', fo, field.fullname),
                        entityClassName,
                        val,
                        { name: disp }
                    );
                    if (dicVal) {
                        val = dicVal;
                    }
                }
                if (disp && B.obj.is(val)) {
                    var v = B.getFieldValue(val, disp, field.ecn);
                    if (v) {
                        val = v;
                    }
                }
                field.value = val;
                return field;
            },
            _diff = function(field) {
                if (B.obj.getValue('value.diff', field)) {
                    field.$element.addClass(B.obj.getValue('options.diffClass', field, o.diffClass));
                }
            },
            _show = function(field, index) {
                var val = index === undefined ? field.value : field.value[index],
                    signal = B.obj.getValue('options.signal', field),
                    wrapper = field.diff && B.obj.getValue('options.diffWrap', field, true) ? o.templates.diff : null,
                    html;
                if (B.obj.is(val)) {
                    if (field.tmpl) {
                        html = $(field.tmpl).fill(val, field.ecn, o);
                    } else {
                        html = JSON.stringify(val);
                    }
                } else {
                    if (field.options.convert) {
                        // var kk = 0;
                    }
                    if (typeof B.str[field.options.convert] === 'function') {
                        val = B.str[field.options.convert](val, field.options);
                    }
                    if (typeof field.tmpl === 'string') {
                        if (field.tmpl.indexOf('data-container') > 0) {
                            //jeśli prototyp przeznaczony na tabelę ale wartość nie jest tabelą
                            console.log('fn.fill _show is data-container');
                            console.log(field);
                            html = val;
                        } else {
                            html = field.tmpl.replace('__v__', val);
                        }
                    } else {
                        html = val;
                    }
                }
                if (signal) {
                    // field.$element.attr('data-value', html);
                    // field.$element.append( signal > 1 && html ? html : disp );
                    field.$element.html(B.obj.getValue('options.disp', field));
                } else {
                    field.$element.append(wrapper ? $(wrapper).html(html) : html);
                }
            },
            _traversData = function(field) {
                var names = field.options.name.split('.'); //nazwa zmiennej w obiekcie zagłębienie rozdzielone . (obj.obj1.obj2.val)
                for (var i = 0; i < names.length; i++) {
                    //trawersowanie po obiekcie
                    var n = B.getFieldNames(names[i], field.ecn); //pobranie nazwy lub skrótu
                    field.fullname = typeof n === 'string' ? n : n[0];
                    field.value = B.getValue(field.value, n);
                    field.ecn = B.entity.getChildClass(field.fullname, field.ecn) || field.ecn;
                }
                return field;
            },
            _setData = function(field) {
                var nv = B.obj.getValue('options.values', field),
                    _sd = function(obj) {
                        if (B.obj.is(obj)) {
                            var val = obj.key ? B.obj.getValue(obj.key, field.value, '') : field.value;
                            if (B.obj.is(val) && val.hasOwnProperty('Value')) {
                                val = val.Value;
                            }
                            field.$element.attr('data-' + obj.name, B.obj.is(val) ? JSON.stringify(val) : val);
                            field.$element.data(obj.name, val);
                        }
                    };
                if (B.obj.isIterate(nv)) {
                    for (var i in nv) {
                        _sd(nv[i]);
                    }
                } else {
                    _sd(nv);
                }
            };
        _setData({ $element: $this, value: data, options: o });
        // _setData({ $element: $this, value: data });
        $this.find('[data-name]').each(function() {
            var $field = $(this),
                f = {
                    value: data,
                    ecn: entityClassName,
                    tmpl: false,
                    $element: $field,
                    options: $field.data()
                },
                fo = f.options;
            if (o.excludeFields && o.excludeFields.indexOf(fo.name) >= 0) {
                return true;
            }
            _traversData(f);
            _setData(f);
            if (fo.edit) {
                var editValue = B.obj.is(f.value) && f.value.hasOwnProperty('Value') ? f.value.Value : f.value;
                if (B.obj.is(editValue)) {
                    editValue = B.obj.getValue(fo.edit, editValue);
                }
                if(isSet(editValue)){
                    $field.writeField(editValue);
                }
            } else {
                _diff(f);
                if (B.obj.getValue('disp', fo, true)) {
                    _template(f);
                    _trans(f);
                    $field.empty();
                    if ($.isArray(f.value)) {
                        if (f.tmpl) {
                            var $c = $(f.tmpl);
                            if ($c.data('container') !== undefined) {
                                //sprawdzenie czy jest container
                                f.tmpl = _template(f.fullname + '_entry', $c);
                                $field.append($c);
                                $field = $c;
                            }
                        }
                        for (var i = 0, ien = f.value.length; i < ien; i++) {
                            _show(f, i);
                        }
                    } else {
                        _show(f);
                    }
                }
            }
        });
        return $this;
    };
})(jQuery, Bajt);

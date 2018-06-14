(function($, B) {
    'use strict';
    $.extend(true, B, {
        dic: {
            next: function(dictionary, value) {
                var result,
                    finded = false;
                $.each(dictionary, function(index, row) {
                    if (finded) {
                        result = row;
                        return false;
                    }
                    // finded = row.hasOwnProperty('v') ? row.v == value : row.value == value;
                    finded = B.checkValue(row, value);
                });
                return result ? result : dictionary[0];
            },
            getValue: function(dicName, entityClassName, value, options) {
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
            from: function(dictionary, value, options) {
                var result = null,
                    name = B.obj.getValue('name', options),
                    _find = function(val) {
                        var found = '';
                        if (typeof val === 'boolean') {
                            val = val ? 1 : 0;
                        } else if (B.json.isObj(val)) {
                            val = JSON.parse(val);
                        }
                        if (B.obj.is(val)) {
                            val = val.v || val.id || val.value;
                        }
                        if (B.obj.isIterate(dictionary)) {
                            for (var i in dictionary) {
                                var row = dictionary[i];
                                // if ((row.hasOwnProperty('v') && row.v == val) || row.value == val) {
                                if (B.checkValue(row, val)) {
                                    found = row;
                                    break;
                                }
                            }
                        }
                        if (name) {
                            if (B.obj.is(found)) {
                                found = B.obj.getValue(name, found, '.');
                            } else {
                                found = B.obj.getValue('empty', options, '');
                            }
                        }
                        return found;
                    };
                if (isSet(value) && B.obj.is(dictionary)) {
                    if ($.isArray(value)) {
                        result = [];
                        for (var i = 0; i < value.length; i++) {
                            result.push(_find(value[i]));
                        }
                    } else {
                        result = _find(value);
                    }
                }
                return result;
            },
            get: function(dicName, entityClassName) {
                if (!$.isArray(dicName)) {
                    dicName = dicName.split('.');
                }
                if (dicName.length > 1) {
                    entityClassName = B.entity.getChildClass(dicName[0], entityClassName);
                    dicName = dicName[1];
                } else {
                    dicName = dicName[0];
                }
                var es = B.getEntitySettings(entityClassName),
                    dic;

                if (B.obj.is(es) && es.hasOwnProperty('dictionaries')) {
                    var names = [
                        dicName,
                        B.str.capitalise(dicName),
                        dicName + 's',
                        B.obj.getValue(['fields', 'childs', dicName], es, '')
                    ];
                    for (var i = 0; i < names.length && !dic; i++) {
                        dic = es.dictionaries[names[i]];
                    }
                }
                return dic;
            }
        }
    });
})(jQuery, Bajt);

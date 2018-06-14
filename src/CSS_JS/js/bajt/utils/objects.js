(function($, B) {
    'use strict';
    $.extend(true, B, {
        obj: {
            getValue: function(keys, obj, def) {
                if (!B.obj.is(obj)) {
                    return def;
                }
                if (!B.obj.isIterate(keys)) {
                    if (obj.hasOwnProperty(keys)) {
                        return obj[keys];
                    }
                    keys = keys.split('.');
                }
                var current = obj,
                    ok = true;
                for (var k in keys) {
                    var key = keys[k];
                    if (B.obj.is(current) && current.hasOwnProperty(key)) {
                        current = current[key];
                    } else {
                        ok = false;
                        break;
                    }
                }
                return ok ? current : def;
            },
            summary: function(dest, source) {
                var n;
                if (B.obj.is(dest) && Object.keys(dest).length > 0) {
                    for (n in dest) {
                        dest[n] += source[n] || 0;
                    }
                } else {
                    dest = {};
                    for (n in source) {
                        dest[n] = source[n];
                    }
                }
                return dest;
            },
            addSum: function(obj, sum, name) {
                name = undefined !== name ? name : 'sum';
                if (obj[name] === null) {
                    obj[name] = B.obj.is(sum) ? B.obj.summary({}, sum) : sum;
                } else {
                    if (B.obj.is(obj[name])) {
                        B.obj.summary(obj[name], sum);
                    } else {
                        obj[name] += sum;
                    }
                }
                return obj;
            },
            supplement: function(target, source) {
                if (B.obj.is(target) && B.obj.is(source)) {
                    for (var i in source) {
                        if (!target.hasOwnProperty(i)) {
                            target[i] = B.obj.is(source[i]) ? $.extend({}, source[i]) : source[i];
                        }
                    }
                    return target;
                }
                return {};
            },
            keys: function(obj, filter) {
                var keys = [];
                if (B.obj.is(obj)) {
                    for (var k in obj) {
                        var push = true;
                        if (B.obj.is(filter)) {
                            push =
                                filter.type === 'include'
                                    ? filter.values.indexOf(k) >= 0
                                    : filter.values.indexOf(k) < 0;
                        }
                        if (push) {
                            keys.push(k);
                        }
                    }
                }
                return keys;
            },
            is: function(value) {
                return value != null && typeof value === 'object';
            },
            isEmpty: function(value) {
                return value != null && typeof value === 'object'  && Object.keys(value).length === 0;
            },
            isNotEmpty: function(value) {
                return value != null && typeof value === 'object' && Object.keys(value).length > 0;
            },
            is$: function(value) {
                return B.obj.is(value) && value.jquery && value.length > 0;
            },
            isIterate: function(value) {
                return $.isArray(value) && value.length > 0;
            },
            arrayDiff:function(array1, array2){
                return array1.concat(array2).filter(function (e, i, array) {
                    return array.indexOf(e) === array.lastIndexOf(e);
                });
            },
            addToArray: function(target, source, unique) {
                var push = true;
                if (B.obj.is(target)) {
                    if (!$.isArray(target)) {
                        target = [target];
                    }
                } else {
                    target = [];
                }
                if (unique) {
                    var unigueValue = B.obj.getValue(unique, source);
                    if (unigueValue) {
                        for (var i = 0; i < target.length && push; i++) {
                            push = target[i][unique] !== unigueValue;
                        }
                    }
                }
                if (push) {
                    target.push(source);
                }
                return target;
            }
        }
    });
})(jQuery, Bajt);

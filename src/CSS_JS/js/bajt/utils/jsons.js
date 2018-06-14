(function($, B) {
    'use strict';
    $.extend(true, B, {
        json: {
            is: function(str) {
                if (typeof str === 'string' && str.length > 0) {
                    var firstChar = str.charAt(0);
                    return firstChar === '[' || firstChar === '{';
                }
                return false;
            },
            isObj: function(value) {
                return typeof value === 'string' && value.charAt(0) === '{';
            },
            isArray: function(value) {
                return typeof value === 'string' && value.charAt(0) === '[';
            },
            getValue: function(value, key) {
                value = B.json.is(value) ? JSON.parse(value) : value;
                if (B.obj.is(value)) {
                    return B.obj.getValue(key || 'v', value);
                }
                return value;
            }
        }
    });
})(jQuery, Bajt);

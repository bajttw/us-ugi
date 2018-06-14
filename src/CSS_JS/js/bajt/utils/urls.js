(function($, B) {
    'use strict';
    $.extend(true, B, {
        url: {
            getBase: function(url) {
                return url.replace(/\?.*/, '');
            },
            getParameters: function(url) {
                return url.indexOf('?') > 0 ? url.replace(/.*\?/, '') : '';
            },
            getParametersObj: function(url) {
                return B.str.toObj(B.url.getParameters(url), '&');
            },
            replaceParameters: function(url, parametersObj) {
                var pstr = B.str.obj(parametersObj, '&');
                return pstr ? B.url.getBase(url) + '?' + pstr : B.url.getBase(url);
            },
            updateParameters: function(url, parametersObj) {
                return B.url.replaceParameters(url, $.extend(B.url.getParametersObj(url), parametersObj));
            },
            setPageTitle: function(title, selector) {
                $('#page_title' + (selector ? ' ' + selector : '')).html(title);
                document.title = title;
            },
            from: function(dictionary, value, options) {
                var result = null,
                    name = this.obj.getValue('name', options),
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
            modify: function(url, oldAction, newAction, parameters) {
                var decompose = url.split('?'),
                    newUrl = decompose[0].replace(oldAction, newAction),
                    newParam = {},
                    pt;
                if (decompose.length > 1) {
                    pt = decompose[1].split('&');
                    for (var i = 0, ien = pt.length; i < ien; i++) {
                        var p = pt[i].split('=');
                        newParam[p[0]] = p[1];
                    }
                }
                $.extend(newParam, parameters);
                pt = [];
                for (var k in newParam) {
                    pt.push(k + '=' + newParam[k]);
                }
                if (pt.length > 0) {
                    newUrl += '?' + pt.join('&');
                }
                return newUrl;
            }
        }
    });
})(jQuery, Bajt);

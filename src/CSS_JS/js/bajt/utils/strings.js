(function($, B) {
    'use strict';
    $.extend(true, B, {
        str: {
            match: function(search, type) {
                var match = null;
                if (typeof search === 'string' && search !== '') {
                    switch (type) {
                        case 'sufix':
                            break;
                        case 'contains':
                            match = new RegExp('(' + search + ')', 'g');
                            break;
                        default:
                            match = new RegExp('\\b(' + search + '\\S*)', 'g');
                    }
                }
                return match;
            },
            capitalise: function(str) {
                if (B.str.is(str)) {
                    var pieces = str.split('_');
                    for (var i in pieces) {
                        pieces[i] = pieces[i].charAt(0).toUpperCase() + pieces[i].slice(1).toLowerCase();
                    }
                    return pieces.join('');
                } else {
                    return str;
                }
            },
            camelCase: function(str) {
                if (B.str.is(str)) {
                    var pieces = str.split('_');
                    pieces[0] = pieces[0].toLowerCase();
                    for (var i = 1; i < pieces.length; i++) {
                        pieces[i] = pieces[i].charAt(0).toUpperCase() + pieces[i].slice(1).toLowerCase();
                    }
                    return pieces.join('');
                } else {
                    return str;
                }
            },
            cut: function(str, start, end) {
                return str.substring(0, start) + str.substring(end);
            },
            dispValue: function(value, tmpl) {
                return B.str.is(tmpl) && tmpl.indexOf('__v__') >= 0 ? tmpl.replace('__v__', value) : value;
            },
            firstLower: function(str) {
                if (B.str.is(str)) {
                    return str.charAt(0).toLowerCase() + str.slice(1);
                } else {
                    return str;
                }
            },
            firstUpper: function(str) {
                if (B.str.is(str)) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                } else {
                    return str;
                }
            },
            date: function(value, options) {
                var format = B.obj.getValue('format', options),
                    showTime = B.obj.getValue('showTime', options),
                    date = B.obj.is(value) && value.hasOwnProperty('date') ? value.date : value,
                    m = moment(date);
                if (m.isValid()) {
                    if (!format) {
                        format = 'YYYY-MM-DD' + (showTime ? ' HH:mm' : '');
                    }
                    return m.format(format);
                }
                if (B.obj.is(date) && typeof date.toISOString === 'function') {
                    date = date.toISOString().replace('T', ' ');
                }
                if (B.str.is(date)) {
                    return date.substr(0, showTime ? 16 : 10);
                }
                return '';
            },
            fixed: function(value, precision) {
                value = this.toFloat(value);
                if (B.obj.is(precision)) {
                    precision = precision.precision;
                }
                precision = parseInt(precision, 10);
                return value.toFixed(isNaN(precision) ? 2 : precision).replace('.', ',');
            },
            toFloat: function(value, precision, round) {
                if (B.str.is(value)) {
                    value = value.replace(',', '.');
                }
                value = parseFloat(value);
                if (isNaN(value)) {
                    return 0;
                }
                if (!isNaN(precision)) {
                    if (round > 0) {
                        value = Math.floor(value / round) * round + (value % round > round / 2 ? round : 0);
                    }
                    value = parseFloat(value.toFixed(precision));
                }
                return value;
            },
            obj: function(obj, glue) {
                var a = [];
                if (B.obj.is(obj)) {
                    for (var k in obj) {
                        a.push(k + '=' + obj[k]);
                    }
                }
                return a.join(glue || ';');
            },
            toObj: function(str, glue) {
                var a = str.split(glue || ';'),
                    o = {};
                for (var i = 0; i < a.length; i++) {
                    var p = a[i].split('=');
                    o[p[0]] = p[1];
                }
                return o;
            },
            addUnique: function(str1, str2, separator) {
                var _toArray = function(str) {
                    if (B.str.is(str)) {
                        str = str.split(separator);
                    }
                    return $.isArray(str) ? str : [];
                };
                separator = B.str.is(separator) ? separator : ' ';
                str1 = _toArray(str1);
                str2 = _toArray(str2);
                for (var i = 0; i < str2.length; i++) {
                    if (str1.indexOf(str2[i]) < 0) {
                        str1.push(str2[i]);
                    }
                }
                return str1.join(separator);
            },
            is: function(value) {
                return typeof value === 'string' && value.length > 0;
            },
            getName: function(str) {
                var name = '',
                    match = /\[[^\].]*]$/.exec(str);
                if (match) {
                    name = match[0].slice(1, match[0].length - 1);
                }
                return name;
            }
        }
    });
})(jQuery, Bajt);

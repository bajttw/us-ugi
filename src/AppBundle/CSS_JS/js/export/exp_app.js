(function(E, B) {
    'use strict';

    function _lackersConvert(lackers, asStr) {
        var lack,
            lackerConvert = function(lacker) {
                var lack = [
                    lacker.sequence.toString(),
                    B.dic.from('options', 'PositionsLackers', lacker.option, {
                        empty: '-'
                    }),
                    lacker.lacker.name,
                    lacker.comment
                ];
                return asStr ? lack.join(', ') : lack;
            };
        if ($.isArray(lackers)) {
            var ll = [];
            for (var i = 0, ien = lackers.length; i < ien; i++) {
                ll.push(lackerConvert(lackers[i]));
            }
            lack = asStr ? ll.join('; ') : ll;
        } else {
            lack = lackerConvert(lackers);
        }
        return lack;
    }

    
    // var _paramConvert_pdf = function(value, name, options) {
    //     var val = '',
    //         diffTxt = B.obj.getValue('diffTxt', options, '* '),
    //         diffStyle = B.obj.getValue('diffStyle', options, 'diff'),
    //         diffOnly = B.obj.getValue('diffOnly', options, false),
    //         diff = B.obj.getValue('diff', options, false);
    //     if (diff || !diffOnly) {
    //         if (B.obj.is(value)) {
    //             var disp = B.obj.getValue('disp', options, 'name');
    //             val = value.hasOwnProperty(disp) ? value[disp] : JSON.stringify(value);
    //         } else {
    //             val = _fromOrdersDic(name, value, options);
    //         }
    //         if (diff) {
    //             val = this._styleText(this._addPrefix(val, diffTxt), diffStyle);
    //         }
    //     }
    //     return val;
    // };

    // var _areaConvert_pdf = function(value, name, options) {
    //     return B.str.fixed(value, 3);
    // };

    // var _price_pdf = function(value, name, options) {
    //     return B.str.fixed(value, 2) + ' zł';
    // };
    // var _priceBrutto_pdf = function(value, name, options) {
    //     return _price_pdf(B.str.toFloat(value) * 1.23, name, options);
    // };

    $.extend(true, E.labels, {
        lp: 'Lp.',
        summary: 'Łącznie',
        default: 'domyślne',
        sign_company: 'podpis serwisu',
        sign_client: 'podpis klienta',
        Clients: {
            code: 'Kod kl.',
            name: 'Nazwa kl.'
        }

    });

    $.extend(true, E.fields, {
        Clients: {
            basic: ['code']
        }
    });

    $.extend(true, E.xls.converters, {
        positionLackers: function(value, name, options) {
            var diff = B.obj.getValue('diff', options);
            var defaultLabel = B.obj.getValue('defaultLabel', options);
            if (diff) {
                return this.converters.lackers(value, diff);
            }
            return defaultLabel ? defaultLabel : E._label('default');
        },
        lackers: function(value, name, options) {
            var lack = [];
            for (var i = 0, ien = value.length; i < ien; i++) {
                lack.push(_lackersConvert(value[i]));
            }
            return lack.join(';');
        }
    });

    $.extend(true, E.pdf.widths, {
        default: {
            code: 50,
            number: '*',
            generated: 110,
            created: 110,
            exspress: 60,
            parameters: 90,
            comments: '*'
        },
        summary: {
            quantity: 50
        }
    });

    // $.extend(true, E.pdf.converters, {
    //     area: _areaConvert_pdf
    // });


    $.extend(true, E.pdf.generators, {
        sign: function(name, entityClassName) {
            var pdf = this.pdf;
            return pdf._table([[''], [E._label('sign_' + name, entityClassName)]], {
                options: {
                    margin: [10, 40, 10, 0],
                    fontSize: 8,
                    italics: true,
                    alignment: 'center',
                    layout: 'lightHorizontalLines',
                    table: {
                        headerRows: 0,
                        widths: ['*']
                    }
                }
            });
        },
        signs: function(company, client) {
            var pdf = this.pdf;
            return pdf._table(
                [
                    [
                        company ? pdf.generators.sign.call(this, 'company') : '',
                        '',
                        client ? pdf.generators.sign.call(this, 'client') : ''
                    ]
                ],
                {
                    options: {
                        layout: 'noBorders',
                        table: {
                            widths: ['*', 20, '*']
                        }
                    }
                }
            );
        },
        client: function() {
            var pdf = this.pdf;
            var _convert = function(name) {
                return E.convertField.call(pdf, pdf.data.client[name], name);
            };
            return [
                _convert('name'),
                _convert('street') + ', ' + _convert('zipCode') + ' ' + _convert('city'),
                'tel. ' + _convert('tel') + ', kom. ' + _convert('mobile')
            ];
        },
        membersTable: function(ecn) {
            var pdf = this.pdf;
            return pdf._table([[this.options.bajt, pdf.generators.client.call(this)]], {
                header: E._labelFields(['company', 'client'], ecn),
                options: {
                    layout: 'noBorders',
                    fontSize: 8,
                    table: {
                        widths: ['*', '*']
                    }
                }
            });
        }

    });

})(Export, Bajt);

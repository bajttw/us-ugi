(function(E, B) {
    'use strict';
    $.extend(true, E.labels, {
        ExternalServices: {
            used: 'Użyto',
            description: 'Opis',
            value: 'Cena netto',
            valueBrutto: 'Cena',
            discount: 'Rabat [%]',
            warranty: 'Gwarancja',
            summary: 'Wartość netto',
            summaryBrutto: 'Wartość'
        }
    });

    $.extend(true, E.fields, {
        ExternalServices: {
            basic: [
                'performed',
                'description',
                'valueBrutto',
                'discount',
                'summaryBrutto'
            ]
        }
    });

    $.extend(E.xls.generators, {

    });

    $.extend(true, E.pdf.widths, {
        ExternalServices: {
            name: '*',
            used: 50,
            warranty: 40,
            discount: 40,
            value: 40,
            valueBrutto: 40,
            summary: 40,
            summaryBrutto: 40
        }
    });


    $.extend(E.pdf.converters, {
        Materials: {
            value: E.pdf.converters.price,
            valueBrutto: function(value, name, options) {
                return E.pdf.converters.priceBrutto(
                    B.obj.getValue('data.value', options, 0)
                );
            },
            summary: E.pdf.converters.price,
            summaryBrutto: function(value, name, options) {
                return E.pdf.converters.priceBrutto(
                    B.obj.getValue('data.summary', options, 0)
                );
            }
        }
    });

    $.extend(E.pdf.generators, {
        ExternalServices: {
            generators: {
                table: function(type) {
                    var pdf = this.pdf,
                        ecn = 'ExternalServices',
                        pos = pdf.data.pos,
                        fields = E.fields[ecn][type || 'basic'],
                        rows = [
                            pdf._rowStyle(
                                E._labelFields(fields, ecn),
                                'tableHeader'
                            )
                        ];
                    for (var i in pos) {
                        rows.push(
                            E.convertFields.call( pdf,
                                pos[i],
                                fields,
                                E.convertField
                            )
                        );
                    }
                    return pdf._table(rows, {
                        options: {
                            margin: [0, 5, 0, 0],
                            fontSize: 8,
                            layout: 'noBorders',
                            table: {
                                widths: pdf._cellsWidth(fields, ecn)
                            }
                        }
                    });
                }
            }
        }
    });

})(Export, Bajt);

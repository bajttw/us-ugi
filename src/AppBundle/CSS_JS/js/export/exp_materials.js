(function(E, B) {
    'use strict';

    $.extend(true, E.labels, {
        Materials: {
            used: 'Użyto',
            name: 'Materiał',
            value: 'Cena netto',
            valueBrutto: 'Cena',
            discount: 'Rabat [%]',
            warranty: 'Gwarancja',
            summary: 'Wartość netto',
            summaryBrutto: 'Wartość'
        }
    });

    $.extend(true, E.fields, {
        Materials: {
            basic: [
                'used',
                'name',
                'warranty',
                'valueBrutto',
                'discount',
                'summaryBrutto'
            ]
        }
    });

    $.extend(E.xls.generators, {

    });

    $.extend(true, E.pdf.widths, {
        Materials: {
            used: 50,
            warranty: 40,
            discount: 40,
            value: 40,
            valueBrutto: 40,
            summary: 40,
            summaryBrutto: 40,
            name: '*'
        }
    });

    $.extend(E.pdf.converters, {
    });

    $.extend(E.pdf.generators, {
        Materials: {
            generators: {
                table: function(type) {
                    var pdf = this.pdf,
                        ecn = 'Materials',
                        pos = pdf.data.materials,
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

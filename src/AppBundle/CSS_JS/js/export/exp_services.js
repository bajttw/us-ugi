(function(E, B) {
    'use strict';

    $.extend(true, E.labels, {
        Services: {
            performed: 'Wykonano',
            title: 'Usługa',
            value: 'Cena netto',
            valueBrutto: 'Cena',
            discount: 'Rabat [%]',
            optionsSummary: 'Opcje netto',
            optionsSummaryBrutto: 'Opcje',
            summary: 'Wartość netto',
            summaryBrutto: 'Wartość'
        }
    });

    $.extend(true, E.fields, {
        Services: {
            basic: [
                'performed',
                'title',
                'valueBrutto',
                'optionsSummaryBrutto',
                'discount',
                'summaryBrutto'
            ]
        }    
    });

    $.extend(E.xls.generators, {

    });

    $.extend(true, E.pdf.widths, {
    Services: {
        performed: 50,
        discount: 40,
        value: 40,
        valueBrutto: 40,
        optionsSummary: 40,
        optionsSummaryBrutto: 40,
        summary: 40,
        summaryBrutto: 40,
        title: '*'
    }
    });

    $.extend(E.pdf.converters, {
        Services: {
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
            },
            optionsSummary: function(value, name, options) {
                return E.pdf.converters.price(
                    B.obj.getValue('data.summary', options, 0) -
                        B.obj.getValue('data.value', options, 0)
                );
            },
            optionsSummaryBrutto: function(value, name, options) {
                return E.pdf.converters.priceBrutto(
                    B.obj.getValue('data.summary', options, 0) -
                        B.obj.getValue('data.value', options, 0)
                );
            }
        },
        ServiceOptions: {}    
    });

    $.extend(E.pdf.generators, {
        Services: {
            generators: {
                details: function() {
                    var pdf = this.pdf;
                    return '';
                },
                row: function() {
                    var pdf = this.pdf;
                    return '';
                },
                table: function(type) {
                    var pdf = this.pdf,
                        ecn = 'Services',
                        pos = pdf.data.services,
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
                },
                serviceOptions: function() {
                    var pdf = this.pdf;
                    return '';
                }
            }
        }
    });
})(Export, Bajt);

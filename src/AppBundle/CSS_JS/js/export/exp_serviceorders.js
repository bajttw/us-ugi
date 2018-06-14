(function(E, B) {
    'use strict';
    $.extend(true, E.labels, {
        ServiceOrders: {
            accessory: 'Akcesoria',
            company: 'Firma',
            client: 'Klient',
            express: 'Ekspres',
            description: 'Opis',
            number: 'Numer',
            created: 'Utworzone',
            closed: 'Zakończone',
            type: 'Tryb',
            value: 'Cena netto',
            valueBrutto: 'Cena'
        }    
    });

    $.extend(true, E.fields, {
        ServiceOrders: {
            basic: ['number', 'created', 'type', 'express'],
            basicReport: ['number', 'created', 'closed', 'type', 'express']
        }
    });

    $.extend(E.xls.generators, {

    });

    var _fromServiceOrdersDic = function(value, name, options) {
        return (
            B.getFromDictionary(name, 'ServiceOrders', value, {
                name: B.obj.getValue('disp', options, 'n')
            }) || value
        );
    };

    $.extend(E.pdf.converters, {
        ServiceOrders: {
            quantity: E.pdf.converters.int,
            express: _fromServiceOrdersDic,
            type: _fromServiceOrdersDic,
            value: _fromServiceOrdersDic,
            valueBrutto: function(value, name, options) {
                return E.pdf.converters.priceBrutto(
                    B.obj.getValue('data.value', options, 0)
                );
            }
        }
    });

    $.extend(E.pdf.generators, {
        ServiceOrders: {
            generators: {
                basicData: function(type) {
                    var pdf = this.pdf,
                        ecn = this.options.ecn,
                        _convert = function(name) {
                            return E.convertField.call(
                                pdf,
                                pdf.data[name],
                                name
                            );
                        },
                        fields = E.fields.ServiceOrders[type || 'basic'],
                        // console.log(pdf._styleText('pdf.data.accessory', 'justify'));
                        rows = [
                            pdf._rowStyle(
                                E._labelFields(fields, ecn),
                                'tableHeader'
                            ),
                            E.convertFields.call( pdf,
                                pdf.data,
                                fields
                            ),
                            pdf._fillEmptyCells(
                                [
                                    {
                                        style: 'tableHeader',
                                        colSpan: fields.length,
                                        text: E._label('description', ecn)
                                    }
                                ],
                                fields.length - 1
                            ),
                            pdf._fillEmptyCells(
                                [
                                    {
                                        colSpan: fields.length,
                                        text: pdf.data.description,
                                        style: 'justify'
                                    }
                                ],
                                fields.length - 1
                            )
                        ];
                    if (pdf.data.accessory) {
                        rows.push(
                            pdf._fillEmptyCells(
                                [
                                    {
                                        style: 'tableHeader',
                                        colSpan: fields.length,
                                        text: E._label('accessory', ecn)
                                    }
                                ],
                                fields.length - 1
                            )
                        );
                        rows.push(
                            pdf._fillEmptyCells(
                                [
                                    {
                                        colSpan: fields.length,
                                        text: pdf.data.accessory,
                                        style: 'justify'
                                    }
                                ],
                                fields.length - 1
                            )
                        );
                    }
                    return pdf._table(rows, {
                        options: {
                            margin: [0, 5, 0, 0],
                            fontSize: 8,
                            layout: 'noBorders',
                            table: {
                                widths: (function() {
                                    var w = [];
                                    for (var i = 0; i < fields.length; i++) {
                                        w.push('*');
                                    }
                                    return w;
                                })()
                            }
                        }
                    });
                }
            },
            agreement: {
                pdf: null,
                header: function() {
                    var pdf = this.pdf;
                    return pdf.generators.header.call(
                        this,
                        'Umowa serwisowa NR ' + pdf.data.number
                    );
                },
                doc: {
                    pageOrientation: 'landscape',
                    styles: {
                        defaultStyle: {
                            fontSize: 8
                        },
                        title: {
                            fontSize: 10
                        }
                    }
                },
                options: {},
                _options: function(options) {
                    this.options = $.extend(
                        true,
                        {
                            ecn: 'ServiceOrders',
                            title: 'POTWIERDZENIE PRZYJĘCIA SERWISOWEGO'
                        },
                        B.obj.is(options) ? options : {}
                    );
                },
                content: function() {
                    return {
                        margin: [20, 5],
                        stack: [
                            this.header(),
                            this.pdf.generators.membersTable.call(
                                this,
                                'ServiceOrders'
                            ),
                            this.pdf.generators.ServiceOrders.generators.basicData.call(
                                this
                            ),
                            {
                                style: 'justify',
                                fontSize: 8,
                                stack: this.options.content
                            },
                            {
                                fontSize: 8,
                                margin: [20, 10],
                                stack: this.options.personal
                            },
                            this.pdf.generators.signs.call(this, true, true)
                        ]
                    };
                },
                generate: function(pdf, options) {
                    this.pdf = pdf;
                    this._options(options);
                    var content = this.content();
                    return pdf._table(
                        [[content, $.extend(true, {}, content)]],
                        {
                            options: {
                                table: {
                                    widths: ['*', '*']
                                },
                                layout: 'noBorders'
                            }
                        }
                    );
                }
            },
            report: {
                pdf: null,
                header: function() {
                    var pdf = this.pdf;
                    return pdf.generators.header.call(
                        this,
                        'Zlecenie serwisowe NR ' + pdf.data.number
                    );
                },
                doc: {
                    // pageOrientation: "landscape",
                    styles: {
                        defaultStyle: {
                            fontSize: 8
                        },
                        title: {
                            fontSize: 10
                        }
                    }
                },
                options: {},
                _options: function(options) {
                    this.options = $.extend(
                        true,
                        {
                            ecn: 'ServiceOrders',
                            title: 'RAPORT SERWISOWY'
                        },
                        B.obj.is(options) ? options : {}
                    );
                },
                services: function() {
                    var pdf = this.pdf,
                        content = [{ text: 'Usługi:', style: 'h' }];
                    content.push(
                        pdf.generators.Services.generators.table.call(this)
                    );
                    return { style: 'justify', fontSize: 8, stack: content };
                },
                materials: function() {
                    var pdf = this.pdf,
                        materials = pdf.data.materials;
                    if ($.isArray(materials) && materials.length > 0) {
                        var content = [{ text: 'Materiały:', style: 'h' }];
                        content.push(
                            pdf.generators.Materials.generators.table.call(this)
                        );
                        return {
                            style: 'justify',
                            fontSize: 8,
                            stack: content
                        };
                    }
                    return '';
                },
                externalServices: function() {
                    var pdf = this.pdf,
                        externalServices = pdf.data.externalServices;
                    // if(isArray(externalServices) && externalServices.length >0){
                    // 	var content=[{"text":"Usługi zewnętrznych serwisów:","style":"h"}];
                    // 	content.push(pdf.generators.Materials.generators.table.call(this));
                    // 	return { style: 'justify', fontSize: 8, stack: content };
                    // }
                    return '';
                },
                summary: function() {
                    var pdf = this.pdf;
                    return '';
                },
                content: function() {
                    return {
                        margin: [20, 5],
                        stack: [
                            this.header(),
                            this.pdf.generators.membersTable.call(
                                this,
                                'ServiceOrders'
                            ),
                            this.pdf.generators.ServiceOrders.generators.basicData.call(
                                this,
                                'basicReport'
                            ),
                            this.services(),
                            this.materials(),
                            this.externalServices(),
                            this.summary(),
                            {
                                style: 'comment',
                                fontSize: 8,
                                stack: this.options.comments
                            },
                            this.pdf.generators.signs.call(this, true)
                        ]
                    };
                },
                generate: function(pdf, options) {
                    this.pdf = pdf;
                    console.log(pdf.data);
                    this._options(options);
                    var content = this.content();
                    return content;
                }
            }
        }
    });

})(Export, Bajt);

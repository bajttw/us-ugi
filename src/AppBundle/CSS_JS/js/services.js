(function($, B) {
    'use strict';
    $.widget(
        'bajt.formService',
        $.extend(true, {}, B.basicForm, {
            options: {
                formFields: [
                 	'client',
                    'serviceOrderType',
                    'serviceOrderId',
                    'performed',
                    'title',
                    'description',
                    {
                        name: 'options',
                        options: {
                            calc: 1,
                            control: {
                                type: 'modal',
                                modal: 'serviceoptions',
                                modalWidget: 'modalTableImport',
                                signal: 2
                            },
                            disp: {
                                type: 'ajson'
                            }
                        }
                    },
                    {
                        name: 'value',
                        options: {
                            autocorrect: true,
                            type: 'float',
                            calc: 1
                        }
                    }
                ]
            },
            _create: function() {
                this.state('init');
                this._createBasicControls();
                this._createBasicOptions();
                this._createData();
                this._createFields();
                this.$client = this.element.find('#clients_dic');
                this._bind();
                this.state('normal');
            },
            _bind: function() {
                this._on(this.element, {
                    changed: this._change,
                    submit: this._submit
                });
                var ll = this.field('client').element;
                this._on(this.field('client').element, {
                    changed: this._reloadServiceOrders
                });
                this._on(this.field('serviceOrderType').element, {
                    changes: this._reloadServiceOrders
                });
            },
            _reloadServiceOrders: function() {
                var o = this.options,
                    client = this.field('client').value(),
                    serviceOrderType = this.field('serviceOrderType').value(),
                    serviceOrderCombobox = this.field('serviceOrderId').element.data('bajtCombobox'),
                    filters = {
                        closed: { value: null }
                    };
                if (client && client !== '-') {
                    filters.client = { value: client };
                }
                if (serviceOrderType && serviceOrderType !== '-') {
                    filters.type = { value: serviceOrderType };
                }
                $.ajax({
                    url: o.dicServiceOrders,
                    data: {
                        f: JSON.stringify(filters),
                        o: 'created'
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        alert(errorThrown);
                    },
                    success: function(data, textStatus, jqXHR) {
                        var so = '-';
                        if (B.obj.is(data)) {
                            for (var i in data) {
                                if (String(data[i].t) === serviceOrderType) {
                                    so = data[i].v;
                                }
                            }
                        }
                        serviceOrderCombobox.reloadDictionary(data || [], so);
                    }
                });
            }
        })
    );
    $.fn.initFormService = function() {
        var $form = $(this).find('form[data-form=services]');
        if (B.obj.is$($form)) {
            $('#serviceoptions_modal').modalTableImport({
                ecn: 'ServiceOptions',                
                tableName: 'serviceoptions',
                importFields: ['id', 'name', 'value', 'type'],
                maxCount: 4,
                showLp: true,
                sortable: true,
                custom: {
                    _customImportData: function(dataOut, dataIn) {
                        return dataOut;
                    }
                }
            });
            $form.formService();
        }
    };
})(jQuery, Bajt);

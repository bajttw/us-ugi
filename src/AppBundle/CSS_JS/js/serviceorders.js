(function($, B) {
    'use strict';

    $.widget(
        'bajt.positionExternalServices',
        $.extend(true, {}, B.formPosition, {
            options: {
                ecn: 'ExternalServices',
                locale:{
                    validate:{
                        position: 'Usługa zewnętrzna'
                    }
                },
                formFields: [
                    {
                        name: 'subcontractor',
                        options: {
                            widget: {
                                type: 'combobox'
                            }
                        }
                    },
                    {
                        name: 'consigned',
                        options: {
                            navi: 1,
                            type: 'date'
                        }
                    },
                    {
                        name: 'number',
                        options: {
                            navi: 2
                        }
                    },
                    {
                        name: 'returned',
                        options: {
                            navi: 3,
                            type: 'date',
                            widget: {
                                type: 'datepicker',
                                options: {
                                    autoUpdateInput: false,
                                    timePicker: true,
                                    timePicker24Hour: true
                                }
                            }
                        }
                    },
                    {
                        name: 'cost',
                        options: {
                            autocorrect: true,
                            type: 'float',
                            check_key: 1,
                            calc: 1,
                            navi: 4,
                            selectOnFocus:true
                        }
                    },
                    {
                        name: 'cartage',
                        options: {
                            autocorrect: true,
                            type: 'float',
                            check_key: 1,
                            calc: 1,
                            navi: 5,
                            selectOnFocus:true
                        }
                    },
                    {
                        name: 'serviceCharge',
                        options: {
                            autocorrect: true,
                            type: 'float',
                            check_key: 1,
                            calc: 1,
                            navi: 6,
                            selectOnFocus:true                           
                        }
                    },
                    {
                        name: 'discount',
                        options: {
                            check_key: 1,
                            calc: 1,
                            navi: 7,
                            selectOnFocus:true                           
                        }
                    },
                    {
                        name: 'summary',
                        options: {
                            type: 'float',
                            disp: {
                                type: 1,
                                def: '-'
                            }
                        }
                    },
                    'description'
                ],
                summaryField: 'summary'
            },
            calc: function() {
                var discount = this.field('discount').value();
                this.sum = this._sumFields(['cost', 'cartage', 'serviceCharge']);
                if (discount > 0) {
                    this.sum = discount < 100 ? this.sum * (100 - discount) / 100 : 0;
                }
                this._sumVal(this.sum);
                return this.getSummary();
            }
        })
    );

    $.widget(
        'bajt.positionServices',
        $.extend(true, {}, B.formPosition, {
            options: {
                ecn: 'Services',
                locale:{
                    validate:{
                        position: 'Usługa'
                    }
                },
                formFields: [
                    {
                        name: 'performed',
                        options: {
                            navi: 1,
                            type: 'date'
                        }
                    },
                    {
                        name: 'title',
                        options: {
                            navi: 2
                        }
                    },
                    {
                        name: 'duration',
                        options: {
                            check_key: 1,
                            calc: 1,
                            navi: 3,
                            selectOnFocus:true
                        }
                    },
                    {
                        name: 'value',
                        options: {
                            autocorrect: true,
                            type: 'float',
                            check_key: 1,
                            calc: 1,
                            navi: 4,
                            selectOnFocus:true
                        }
                    },
                    {
                        name: 'discount',
                        options: {
                            check_key: 1,
                            calc: 1,
                            navi: 5,
                            selectOnFocus:true
                        }
                    },
                    {
                        name: 'summary',
                        options: {
                            type: 'float',
                            disp: {
                                type: 1,
                                def: '-'
                            }
                        }
                    },
                    {
                        name: 'options',
                        options: {
                            calc: 1,
                            control: {
                                type: 'modal',
                                modal: 'serviceoptions',
                                modalWidget: 'modalTableImportDT',
                                signal: 2
                            },
                            disp: {
                                type: 'ajson'
                            }
                        }
                    },
                    'description',
                    'details'
                ],
                customActions:['details'],
                summaryField: 'summary'                               
            },
            _calcOptions: function(value) {
                var field = this.field('options'),
                    ecn = field.option('ecn'),
                    opt = field.value();
                if ($.isArray(opt)) {
                    var add = 0,
                        precent = 0;
                    for (var i in opt) {
                        var v = B.getFieldValue(opt[i], 'value', ecn);
                        if (parseInt(B.getFieldValue(opt[i], 'type', ecn), 10) === 1) {
                            precent += v;
                        } else {
                            add += v;
                        }
                    }
                    value = (precent !== 0 ? value * (100 + precent) / 100 : value) + add;
                }
                return value;
            },
            _customCreateBasicOptions: function() {
                var o = this.options;
                o.fieldOptions = {
                    options: this._paramOptions
                };
            },
            _paramOptions: function() {
                return {
                    disp: {
                        tmpl: this.options.templates.option
                    }
                };
            },
            calc: function() {
                var discount = this.field('discount').value();
                this.sum = this._calcOptions(this.field('value').value() || 0);
                if (discount > 0) {
                    this.sum = discount < 100 ? this.sum * (100 - discount) / 100 : 0;
                }
                this._sumVal(this.sum);
                return this.getSummary();
            }
        })
    );

    $.widget(
        'bajt.positionMaterials',
        $.extend(true, {}, B.formPosition, {
            options: {
                ecn: 'Materials',
                locale:{
                    validate:{
                        position: 'Materiał'
                    }
                },
                formFields: [
                    {
                        name: 'used',
                        options: {
                            navi: 1,
                            type: 'date'
                        }
                    },
                    {
                        name: 'name',
                        options: {
                            navi: 2
                        }
                    },
                    {
                        name: 'warranty',
                        options: {
                            check_key: 1,
                            navi: 3,
                            selectOnFocus:true
                        }
                    },
                    {
                        name: 'value',
                        options: {
                            autocorrect: true,
                            type: 'float',
                            check_key: 1,
                            calc: 1,
                            navi: 4,
                            selectOnFocus:true                           
                        }
                    },
                    {
                        name: 'discount',
                        options: {
                            check_key: 1,
                            calc: 1,
                            navi: 5,
                            selectOnFocus:true                            
                        }
                    },
                    {
                        name: 'summary',
                        options: {
                            type: 'float',
                            disp: {
                                type: 1,
                                def: '-'
                            }
                        }
                    },
                    'description'
                ],
                summaryField: 'summary'                
            },
            calc: function() {
                var discount = this.field('discount').value();
                this.sum = this.field('value').value() || 0;
                if (discount > 0) {
                    this.sum = discount < 100 ? this.sum * (100 - discount) / 100 : 0;
                }
                this._sumVal(this.sum);
                return this.getSummary();
            }
        })
    );

    $.widget(
        'bajt.formServiceOrder',
        $.extend(true, {}, B.basicForm, B.extFormMultiPositions, {
            options: {
                expBtns:true,
                formFields: [
                    'client',
                    {
                        name: 'number',
                        options: {
                            disp: {
                                type: 1,
                                def: 'auto'
                            }
                        }
                    },
                    {
                        name: 'created',
                        options: {
                            type: 'date',
                            format: 'YYYY-MM-DD HH:mm',
                            disp: {
                                type: 1,
                                def: '-auto-'
                            }
                        }
                    },
                    {
                        name: 'type',
                        options: {
                            widget: {
                                type: 'combobox'
                            },
                            dictionary: true
                        }
                    },
                    {
                        name: 'express',
                        options: {
                            calc: 1,
                            widget: {
                                type: 'combobox'
                            },
                            dictionary: true
                        }
                    },
                    {
                        name: 'closed',
                        options: {
                            type: 'date',
                            format: 'YYYY-MM-DD HH:mm',
                            disp: {
                                type: 1,
                                def: '-'
                            }
                        }
                    },
                    {
                        name: 'receipt',
                        options: {
                            type: 'date',
                            format: 'YYYY-MM-DD HH:mm',
                            disp: {
                                type: 1,
                                def: '-'
                            }
                        }
                    },
                    {
                        name: 'paid',
                        options: {
                            type: 'date',
                            format: 'YYYY-MM-DD HH:mm',
                            disp: {
                                type: 1,
                                def: '-'
                            }
                        }
                    },
                    {
                        name: 'status',
                        options: {
                            disp: {
                                def: '-',
                                type: 'dic'
                            },
                            dictionary: true
                        }
                    },
                    {
                        name: 'value',
                        options: {
                            type: 'float'
                        }
                    },
                    'description',
                    'title',
                    'accessory'
                ],
                positionsOptions: {
                    ExternalServices: {
                        autoNew: true,
                        calc: true,
                        focusField: 'consigned',
                        actions: ['add']
                    },
                    Materials: {
                        autoNew: true,
                        calc: true,
                        focusField: 'name',
                        actions: ['add']                        
                    },
                    Services: {
                        autoNew: true,
                        calc: true,
                        focusField: 'title',
                        actions: ['add'],
                        bind: {
                            dtImport_rowAdded : '_posServicesActionAdded',
                            formPosition_remove: '_posActionRemove'
                            
                        },
                        widget:{
                            type: 'dtImport',
                            ecn: 'Services',
                            saveData: false,
                            addBtn: '#servicecatalog_modal .btn-save',
                            modalBtn: '[data-positions-catalog=Services]',
                            table: '#servicecatalog_table', 
                            modal: '#servicecatalog_modal', 
                            importFields: [ 'title', 'value' ]
                        }                        
                    }
                },
                statusButtons: {
                    prev: {
                        2: {
                            label: 'Otwórz',
                            title: 'Otwórz',
                            addClass: '',
                            icon: 'unlock-alt'
                        },
                        3: {
                            label: 'Otwórz',
                            title: 'Otwórz',
                            addClass: '',
                            icon: 'unlock-alt'
                        },
                        4: {
                            label: 'Anuluj wydanie',
                            title: 'Anuluj wydanie',
                            addClass: '',
                            icon: 'arrow-down'
                        },
                        5: {
                            label: 'Anuluj rozliczenie',
                            title: 'Anuluj rozliczenie',
                            addClass: '',
                            icon: 'money'
                        }
                    },
                    next: {
                        2: {
                            label: 'Zakończ',
                            title: 'Zakończ',
                            addClass: '',
                            icon: 'lock'
                        },
                        3: {
                            label: 'Wydaj',
                            title: 'wydaj',
                            addClass: '',
                            icon: 'arrow-up'
                        },
                        4: {
                            label: 'Rozlicz',
                            title: 'Rozlicz',
                            addClass: '',
                            icon: 'money'
                        }
                    }
                },
                actions: [],
                summaryField: 'value'                                
            },
            _blockPartial: function() {
                var f,
                    status = this.field('status').value();
                if (status > 2) {
                    var noBlock = {
                        3: ['status', 'closed', 'receipt'],
                        4: ['status', 'receipt', 'paid'],
                        5: ['status', 'receipt', 'paid']
                    };
                    for (f in this._fieldsByName) {
                        if (noBlock[status].indexOf(f) < 0) {
                            this._fieldsByName[f].block(true);
                        } else {
                            this._fieldsByName[f].block(false);
                        }
                    }
                    this._blockPositions(true);
                    $(B.html.validateSelector(this.options.formName + '_client')).prop('disabled', true);
                    this._blockStatus=2;
                } else if (status === 2) {
                    var block = ['title', 'description', 'accessory', 'type', 'express'];
                    this._blockPositions(false);
                    for (f in block) {
                        this._fieldsByName[block[f]].block(true);
                    }
                    this._blockStatus=2;
                }else{
                    this.block(false);
                }
            },
            _checkStatus: function() {
                // if(that._fieldsByName['status'].value() == 2 && posit.servicesCount == 0)
                // that._fieldsByName['status'].value(1);
            },
            _customAllowedOperation: function(operation, data) {
                var allow = true;
                switch (operation) {
                    case 'prevStatus':
                        allow = !this.field('closed').isEmpty();
                        break;
                    case 'nextStatus':
                        var status = this.field('status').value();
                        allow = !this.field('created').isEmpty() && status > 1 && status < 5;
                        break;
                }
                return allow;
            },
            _customBlock: function(block) {
                $(B.html.validateSelector(this.options.formName + '_client')).prop('disabled', block);
            },
            _customChange: function(data) {
                // if (data.summary || (B.obj.is(data.field) && data.field.option('calc'))) {
                //     this.summary();
                // }
            },
            _customCreateData: function() {
                this.closed = false;
            },
            _customState: function(state, data) {
                switch (state) {
                    case 'start':
                    case 'normal':
                    case 'submitSuccess':
                        // this._showStatusBtn();
                        this._blockPartial();
                        break;
                }
                return this._state;
            },
            _posServicesActionAdded:function(e, data){
                this._$posInit(data.$row, 'Services');    
                this._positions.Services.$container.trigger('changed', { positions: this._positions.Services, summary: this.options.positionsOptions.Services.calc });
                            
            },
            _statusActionNext: function(e) {
                var $md = $('#date_modal'),
                    fieldStatus = this.field('status'),
                    fn = {
                        2: 'closed',
                        3: 'receipt',
                        4: 'paid'
                    },
                    status = fieldStatus.value(),
                    field = this._fieldsByName[fn[status]];
                // field.value(moment());
                $md['modalField']('show', field, this.$statusBtns.next).on('hide.bs.modal', function() {
                    if (!field.isEmpty()) {
                        fieldStatus.value(status + 1);
                    }
                    // fieldStatus.value(status);
                });
            },
            _statusActionPrev: function(e) {
                var status = this._statusRead(),
                    fn = {
                        3: 'closed',
                        4: 'receipt',
                        5: 'paid'
                    };
                this.field(fn[status]).value(null);
                this.field('status').value(status - 1);
            },
            _toggleServiceOrder: function() {
                var // co=this.$statusBtns.prev.data(),
                fc = this.field('closed');
                if (fc.isEmpty()) {
                    fc.value(new Date());
                } else {
                    fc.value(null);
                }
            },
            calc: function(options) {
                B.extFormMultiPositions.calc.call(this, options);
                return this;
            },
            summary: function(options) {
                var 
                    add = B.dic.from(this.getDictionary('express'), this.field('express').value(), { name: 'a' });
                this._posSummary(null);
                if (add) {
                    this.sum += this.sum * add / 100;
                }
                this._sumVal(this.sum);
                return this.getSummary();
            }
        })
    );

    $.fn.initFormServiceOrder = function() {
        var $form = $(this).find('form[data-form=serviceorders]');
        if (B.obj.is$($form)) {
            $('.modal-field').modalField();
            $('#serviceoptions_modal').modalTableImportDT({
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
            $form.formServiceOrder();
        }
    };
})(jQuery, Bajt);


// _fromServiceCatalog: function(e) {
//     stopTrigger(e);
//     var sc = this.serviceCatalog,
//         selected = sc.table.rows({ selected: true }),
//         services = [];
//     selected.every(function(rowIdx, tableLoop, rowLoop) {
//         var data = B.entity.fill(this.data(), 'ServiceCatalog'),
//             values = {},
//             fields = ['title', 'value', 'options'];
//         for (var i in fields) {
//             if (data[fields[i]]) {
//                 values[fields[i]] = data[fields[i]];
//             }
//         }
//         console.log(values);
//         services.push(values);
//     });
//     selected.deselect();
//     this.importPositions('Services', services);
//     //    sc.$modal.modal('hide');
// },


// importPositions: function(positionsECN, positions) {
//     if (B.obj.isIterate(positions) && this.allowedOperation('import' + positionsECN)) {
//         var that = this;
//         if (positions.length > 0) {
//             this.importQueue = positions.length;
//             $.each(positions, function(idx, position) {
//                 //   service.shift();
//                 that._newPosition(
//                     positionsECN,
//                     that.options.positionsOptions[positionsECN].focusField,
//                     position
//                 );
//             });
//         }
//     }
// },

// _bind:function(){
            //     this._bindForm();
            //     this._bindButtons(this.$statusBtns, '_statusAction');
            //     return this;
            // },

            // _showStatusBtn: function() {
            //     var status = this._statusRead(),
            //         o = this.options;
            //     for (var t in this.$statusBtns) {
            //         var sBtns = o.statusButtons[t];
            //         if (this.allowedOperation(t + 'Status')) {
            //             var opt = sBtns[status],
            //                 rm_class = [];
            //             for (var i in sBtns) {
            //                 if (Number(i) !== status && sBtns[i].addClass) {
            //                     rm_class.push(o.sBtns[i].addClass);
            //                 }
            //             }
            //             this.$statusBtns[t].find('.fa').changeIcon(opt.icon);
            //             this.$statusBtns[t].find('.text').html(opt.label);
            //             this.$statusBtns[t]
            //                 .removeClass(rm_class.join(' '))
            //                 .addClass(opt.addClass)
            //                 .attr('title', opt.title)
            //                 .show();
            //         } else {
            //             this.$statusBtns[t].hide();
            //         }
            //     }
            // },
            // _showStatus: function() {
            //     if (this.allowedOperation('showStatus')) {
            //         var status = this._statusRead()),
            //             o = this.options,
            //             opt = o.statusButtons[status];
            //         var rm_class = [];
            //         for (var i in o.statusButtons) {
            //             if (Number(i) !== status && o.statusButtons[i].addClass) {
            //                 rm_class.push(o.statusButtons[i].addClass);
            //             }
            //         }
            //         this.$nextStatusBtn
            //             .removeClass(rm_class.join(' '))
            //             .addClass(opt.addClass)
            //             .changeIcon(opt.icon)
            //             .attr('title', opt.title)
            //             .text(opt.label)
            //             .show();
            //     } else {
            //         this.$nextStatusBtn.hide();
            //     }
            // },

            // _removePosition: function(e, data) {
            //     var that = this,
            //         $position = data.position.element,
            //         positions = this._positions[data.position.option('ecn')];
            //     $position.slideToggle('fast', function() {
            //         positions.tab.splice(positions.tab.indexOf(data.position), 1);
            //         positions.count--;
            //         that.calc();
            //         that._checkStatus();
            //         $position.remove();
            //     });
            // },

            // _customValidate: function() {
            //     for (var p in this._positions) {
            //         var positions = this._positions[p].tab;
            //         for (var i in positions) {
            //             var pvalid = positions[i].validate();
            //             if (pvalid.msg) {
            //                 this._initValid();
            //                 this.valid.add(pvalid);
            //             }
            //         }
            //     }
            //     return this.valid;
            // },

            // _bind: function() {
            //     var that = this;
            //     this._on(this.element, {
            //         navigate: function(e, data) {
            //             if (B.obj.is(data) && data.field) {
            //                 that._navigate(e, data);
            //             } else {
            //                 that._navigateCtrl(e, data);
            //             }
            //         },
            //         positionRemove: this._removePosition,
            //         changed: this._change,
            //         submit: this._submit
            //     });
            //     this.$addPositionBtns.each(function() {
            //         var $this = $(this);
            //         that._on($this, {
            //             click: function(e) {
            //                 that._newPosition($this.data('add-position'));
            //             }
            //         });
            //     });
            //     this._on(this.serviceCatalog.$showBtn, {
            //         click: function() {
            //             that.serviceCatalog.$modal.modal('show');
            //         }
            //     });
            //     this._on(this.serviceCatalog.$addBtn, {
            //         click: this._fromServiceCatalog
            //     });
            //     this._on(this.$statusBtns.prev, {
            //         click: this._prevStatus
            //     });
            //     this._on(this.$statusBtns.next, {
            //         click: this._nextStatus
            //     });
            //     if (B.obj.is$(this.$close)) {
            //         // this.$close.confirmation('disable');
            //         this._on(this.$close, {
            //             click: this.close
            //         });
            //     }
            // },
            // _addPosition: function(postionsECN, $position) {
            //     var o = this.options,
            //         positions = this._positions[postionsECN],
            //         position = $position['position' + postionsECN](
            //             $.extend(
            //                 {
            //                     index: positions.index,
            //                     formName: o.formName,
            //                     nr: positions.count + 1,
            //                     parent: this
            //                 },
            //                 o.positionsOptions[postionsECN]
            //             )
            //         ).data('bajtPosition' + postionsECN);
            //     positions.tab.push(position);
            //     positions.index++;
            //     positions.count++;
            //     this._checkStatus();
            //     // if(this._fieldsByName['status'].value() < 2 && this.servicesCount)
            //     //     this._fieldsByName['status'].value(2);
            //     return position;
            // },
            // _navigateCtrl: function(e, data){
            //     if (data.service){
            //         var pTarget=data.service.options.nr - 1 + data.step;
            //         stopTrigger(e);
            //         if( 0 <= pTarget && pTarget < this.servicesCount ){
            //             data.target=data.index;
            //             this._services[pTarget].element.find('.row-data').naviElement(null, data);
            //         }
            //     }
            // },
            // _newPosition: function(positionsECN, focusField, values, eventData) {
            //     if (!this.allowedOperation('new' + positionsECN)) {
            //         return;
            //     }
            //     var that = this,
            //         o = this.options,
            //         $positions = this.$positions[positionsECN],
            //         $newPosition = $(
            //             o.positionsOptions[positionsECN].prototype.replace(
            //                 /__pn__/g,
            //                 this._positions[positionsECN].index
            //             )
            //         ),
            //         position = this._addPosition(positionsECN, $newPosition);
            //     $newPosition.appendTo($positions).slideDown('fast', function() {
            //         $newPosition.initFormWidgets();
            //         that.state('changing');
            //         position.setValues(values);
            //         that.state('normal');
            //         position.focus(focusField, eventData);
            //         if (typeof that.importQueue === 'number') {
            //             if (that.importQueue > 1) {
            //                 that.importQueue--;
            //             } else {
            //                 delete that.importQueue;
            //                 that.calc();
            //             }
            //         }
            //     });
            // },
            // _removeService:function(e, data){
            //     var
            //         that=this,
            //         $service=data.service.element;
            //     $service.slideToggle('fast', function () {
            //         that._services.splice(that._services.indexOf(data.service), 1);
            //         that.servicesCount--;
            //         $service.remove();
            //     });
            // },
            // _initPositions: function() {
            //     var that = this,
            //         p,
            //         o = this.options,
            //         _add = function() {
            //             that._addPosition(p, $(this));
            //         };
            //     this.$positions = {};
            //     for (p in o.positionsOptions) {
            //         var $positions = this.element.find(o.fieldSelectorPrefix + B.str.firstLower(p));
            //         $.extend(true, o.positionsOptions[p], $positions.data());
            //         $positions.find('.row-pos').each(_add);
            //         this.$positions[p] = $positions;
            //     }

            //     // this.$services=this.element.find(o.fieldSelectorPrefix+'services');
            //     // $.extend(o.positionsOptions.Services, this.$services.data());
            //     // this.$services.find('.row-pos').each(function(){
            //     //     var $pos=$(this);
            //     //     that._addService($pos);
            //     //     $pos.initFormWidgets();
            //     // });
            //     this.calc();
            // },
            // _blockPositions: function(block) {
            //     for (var p in this._positions) {
            //         var positions = this._positions[p].tab;
            //         for (var i in positions) {
            //             positions[i].block(block);
            //         }
            //     }
            // },










            // validate:function(){
            //     var i,
            //         that=this,
            //         valid=this.valid,
            //         initValid=function(){
            //             if (!valid.msg)
            //                 valid.init('u', new MSG({label: 'Przyjęcie serwisowe', message: ''}));
            //         };
            //     if (!this.inState('valid') && this.allowedOperation('validate')){
            //         valid.init();
            //         for (i in this._fields){
            //             var fvalid=this._fields[i].validate();
            //             if (fvalid.msg){
            //                 initValid();
            //                 valid.add(fvalid);
            //             }
            //         }
            //         for (i in this._services){
            //             var fvalid=this._services[i].validate();
            //             if (fvalid.msg){
            //                 initValid();
            //                 valid.add(fvalid);
            //             }
            //         }
            //         if (valid.msg){
            //             var classes={ e: 'alert-danger', w : 'alert-warning', s: 'alert-success', i: 'alert-info' };
            //             this._showMessage(valid.msg, classes[valid.valid] );
            //         }
            //         this.state( valid.valid !== 'e' ? 'valid' : 'notValid');
            //     }
            //     return valid;

            // }

            // _navigate: function(e, data) {
            //     var i,
            //         step = data.step === 3 ? 1 : data.step,
            //         fieldName = data.field.option('name');
            //     stopTrigger(e);
            //     if (data.position) {
            //         var pos_ecn = data.position.option('ecn'),
            //             positions = this._positions[pos_ecn];
            //         i = positions.tab.indexOf(data.position) + step;
            //         if (data.step === 3) {
            //             fieldName = this.options.positionsOptions.focusField || 0;
            //         }
            //         while (i >= 0 && i <= positions.index && positions.tab[i] === undefined) {
            //             i += step;
            //         }
            //         if (positions.tab[i]) {
            //             positions.tab[i].focus(fieldName, data);
            //         } else if (i > 0) {
            //             this._newPosition(pos_ecn, fieldName, {}, data);
            //         }

            //         // var services=this._services,
            //         //     pc = services.length;
            //         // i = services.indexOf(data.service) +  step;
            //         // if(data.step === 3) fieldName= 'performed' ;
            //         // while ( i >= 0 && i <= this.serviceIndex && ( services[i] === undefined )){
            //         //     i+=step;
            //         // }
            //         // if ( services[i] ){
            //         //     services[i].focus(fieldName);
            //         // }else if( i > 0 ){
            //         //     this._newService(fieldName);
            //         // }
            //     } else {
            //         var fields = this._fields,
            //             fc = fields.length;
            //         i = fields.indexOf(data.field) + step;
            //         while (i >= 0 && i < fc && !fields[i].option('navi')) {
            //             i += step;
            //         }
            //         if (fields[i]) {
            //             fields[i].focus(data);
            //         }
            //     }
            // },
            // _navigateCtrl: function(e, data) {
            //     if (data.position) {
            //         stopTrigger(e);
            //         var pTarget = data.position.option('nr') - 1 + data.step,
            //             positions = this._positions[data.position.option('ecn')];
            //         if (0 <= pTarget && pTarget < positions.count) {
            //             data.target = data.index;
            //             positions.element.find('.row-data').naviElement(null, data);
            //         }
            //     }
            // },


















// $.widget( 'bajt.servicePosition', {
// options: {
//     index : 0,
//     ecn: 'Services',
//     formFields: [
//         {
//             name: 'performed',
//             options:{
//                 navi: 1,
//                 type: 'date',
//                 widget: {
//                     type: 'datepicker',
//                     options: {
//                         timePicker:  true,
//                         timePicker24Hour: true,
//                     }
//                 }

//             }
//         },
//         { name: 'title', options:{ navi: 2} },
//         {
//             name: 'value',
//             options:{
//                 check_key: 1,
//                 calc: 1,
//                 navi: 3
//             }
//         },
//         {
//             name: 'discount',
//             options:{
//                 check_key: 1,
//                 calc: 1,
//                 navi: 4
//             }
//         },
//         {
//             name: 'summary',
//             options: {
//                 type: 'float',
//                 disp: {
//                     type: 1,
//                     def: '-'
//                 }
//             }
//         },
//         'options',
//         'description'
//     ]
// },
// _create: function() {
//     var
//         o=this.options;
//     o.posId=this.element.attr('id');
//     o.fieldSelectorPrefix='#'+o.posId+'_';
//     o.entitySettings=B.getEntitySettings(o.ecn);
//     this._createData();
//     this.$actions=this.element.find('.c-actions');
//     this.actionButtons={
//         details: $(o.templates.details),
//         remove: $(o.templates.remove)
//     };
//     for(var k in this.actionButtons){
//         this.$actions.append(this.actionButtons[k]);
//     }
//     this.$details=this.element.find('.row-info');
//     this._createFields();
//     this.calc();
//     this._bind();
// },
// _addField: B.basicForm._addField,
// _callFunction: B.basicForm._callFunction,
// _createData: B.basicForm._createData,
// _createFields: B.basicForm._createFields,
// _customFieldOptions: B.basicForm._customFieldOptions,
// field: B.field,
// _findFieldElement: B.basicForm._findFieldElement,
// _getFieldEntityClass: B.basicForm._getFieldEntityClass,
// block: B.basicForm.block,
// field: B.basicForm.field,
// getDictionary: B.basicForm.getDictionary,
// getLimits: B.basicForm.getLimits,
// _navigate: function(e, data){
//     if (data.step === -1 || data.step === 1 || data.step === 3){
//         var
//             fields=this._fields,
//             fc = fields.length,
//             step = data.step === 3 ? 1 : data.step,
//             i = fields.indexOf(data.field) + step;
//         while( i >= 0 && i < fc && !fields[i].option('navi')){
//             i+=step;
//         }
//         if (fields[i]){
//             stopTrigger(e);
//             fields[i].element.focus();
//         }else if (data.step === 3){// (pressed Enter) - not found next field -> next position
//             data.service=this;
//         }else
//             stopTrigger(e);
//     }else{
//         data.service=this;
//         data.step = data.step > 0 ? 1 : -1;
//     }
// },
// _navigateCtrl: function(e, data){
//     if (data.step === -1 || data.step === 1 ){
//         data.container='.row-data';
//     }else{
//         data.service=this;
//         data.index=$('.row-data [data-navi]', this.element).index(e.target);
//         data.step = data.step > 0 ? 1 : -1;
//     }
// },
// _bind: function(){
//     var that=this,
//         o=this.options;
//     this._on(this.element, { navigate: function(e, data){
//             if (B.obj.is(data) && data.field)
//                 that._navigate(e, data);
//             else
//                 that._navigateCtrl(e, data);
//         }
//     });
//     this._on(this.element, { changed: this._change } );
//     for (var k in this.actionButtons){
//         if(B.obj.is$(this.actionButtons[k]) && typeof this['_'+k] === 'function' )
//             this._on(this.actionButtons[k], {
//                 click : this['_'+k]
//             });
//     }
// },
// _change: function(e, data){
//     // console.log('\t*** field '+data.field.element.attr('id'));
//     if (data.field.option('calc')){
//         stopTrigger(e);
//         this.calc();
//     }else{
//         data.summary = data.field.option('name') === 'summary';
//         data.service = this;
//     }
// },
// _details: function(e){
//     stopTrigger(e);
//     if(B.obj.is$(this.$details))
//         this.$details.slideToggle();
// },
// _remove: function(e){
//     stopTrigger(e);
//     this.element.trigger('serviceRemove', { service : this});
// },
// allowAction: function( name, allow){
//     var $btn=this.actionButtons[name];
//     if (!B.obj.is$($btn)) return;
//     if ( allow === undefined || allow )
//         $btn.show();
//     else
//         $btn.hide();
// },
// setNr:function(nr){
//     if ( nr !== undefined)
//         this.options.nr=nr;
// },
// calc:function(){
//     var value=this.field('value').value(),
//         discount=this.field('discount').value(),
//         summary=value || 0;
//     if(discount > 0 ){
//         summary=value*(100-discount)/100;
//     }
//     this.field('summary').value(summary);
//     return summary;
// },
// getSummary:function(){
//     return this.field('summary').value() || 0;
// },
// validate:function(){
//     var i,
//         valid=this.valid,
//         initValid=function(){
//             if (!valid.msg)
//                 valid.init('u', new MSG({label: 'Usługi serwisowe', message: ''}));
//         };
//     valid.init();
//     for (i in this._fields){
//         var fvalid=this._fields[i].validate();
//         if (fvalid.msg){
//             initValid();
//             valid.add(fvalid);
//         }
//     }
//     return valid;
// },
// focus: function(index){
//     var field=this.field(index ? index : 0 );
//     if (field) field.element.focus();
// },
// update:function(data){
//     var that=this;
//     $.each(data, function(name, value){
//         that.field(name).update(value);
//     });
// },
// setValues:function(values){
//     for( var name in values){
//         if(this._fieldsByName.hasOwnProperty(name))
//             this._fieldsByName[name].value(values[name]);
//     }
// }
// });



            // _create: function() {
            //     var o = this.options;
            //     this.state('init');
            //     this._createBasicControls();
            //     this._createBasicOptions();
            //     this._createData();
            //     this._createFields();
            //     this._initPositions();
            //     this.element.initExpBtns({
            //         entitySettings: o.entitySettings
            //     });
            //     this.calc();
            //     this._bind();
            //     this.state('start');
            // },

                        // _newServices: function(focusField, values){
            //     if (!this.allowedOperation('newService'))
            //         return;
            //     var
            //         that=this,
            //         o=this.options,
            //         $newService=$(o.positionsOptions.Services.prototype.replace(/__pn__/g, this.serviceIndex)),
            //         service= this._addService($newService);
            //     $newService.appendTo(this.$services).slideDown('fast', function(){
            //         $newService.initFormWidgets();
            //         that.state('changing');
            //         service.setValues(values);
            //         that.state('normal');
            //         service.focus(focusField);
            //         if (typeof that.importQueue === 'number' ){
            //             if (that.importQueue > 1)
            //                 that.importQueue--;
            //             else{
            //                 delete that.importQueue;
            //                 that.calc();
            //             }
            //         }
            //     });
            // },

            // _addService: function($service){
            //     var
            //         o=this.options,
            //         service=$service.servicePosition($.extend( {
            //             index : this.serviceIndex,
            //             formName: o.formName,
            //         }, o.positionsOptions.Services )).data('bajtServicePosition');
            //     this._services.push(service);
            //     this.serviceIndex++;
            //     this.servicesCount++;
            //     if(this._fieldsByName['status'].value() < 2 && this.servicesCount)
            //         this._fieldsByName['status'].value(2);
            //     return service;
            // },
            
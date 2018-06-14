(function($) {
    "use strict";
    var priceListPositionForm={
        options: {
            index : 0
        },

        _create: function() {
            var 
                o=this.options;
            o.posId=this.element.attr('id');
            o.fieldSelectorPrefix='#'+o.posId+'_';
            o.entitySettings=Bajt.getEntitySettings(o.ecn);
            this._createData();
            this.$actions=this.element.find('.c-actions');
            this.actionButtons={
                details: $(o.templates.details),
                remove: $(o.templates.remove)
            };
            for(var k in this.actionButtons){
                this.$actions.append(this.actionButtons[k]);
            }
            this.$details=this.element.find('.row-info');
            this._createFields();
            this.calc();
            this._bind();
        },
        _bind: function(){
            var that=this,
                o=this.options;
            this._on(this.element, { navigate: function(e, data){
                    if (Bajt.obj.is(data) && data.field)
                        that._navigate(e, data);
                    else
                        that._navigateCtrl(e, data);
                }
            });
            this._on(this.element, { changed: this._change } );
            for (var k in this.actionButtons){
                if(Bajt.obj.is$(this.actionButtons[k]) && typeof this['_'+k] === 'function' )
                    this._on(this.actionButtons[k], {
                        click : this['_'+k]
                    });
            }
        },
        _addField: Bajt.basicForm._addField,
        _callFunction: Bajt.basicForm._callFunction,
        _change: function(e, data){
            if (data.field.option('calc')){
                stopTrigger(e);
            }else{
                data.position = this;
            }
        },
        _createData: Bajt.basicForm._createData,
        _createFields: Bajt.basicForm._createFields,
        _customFieldOptions: Bajt.basicForm._customFieldOptions,
        _details: function(e){
            stopTrigger(e);
            if(Bajt.obj.is$(this.$details))
                this.$details.slideToggle(); 
        },
        _findFieldElement: Bajt.basicForm._findFieldElement,
        _getFieldEntityClass: Bajt.basicForm._getFieldEntityClass,
        _navigate: function(e, data){
            if (data.step === -1 || data.step === 1 || data.step === 3){
                var 
                    fields=this._fields,
                    fc = fields.length,
                    step = data.step === 3 ? 1 : data.step,
                    i = fields.indexOf(data.field) + step;
                while( i >= 0 && i < fc && !fields[i].option('navi')){
                    i+=step;
                }
                if (fields[i]){
                    stopTrigger(e);
                    fields[i].focus(data);
                }else if (data.step === 3){// (pressed Enter) - not found next field -> next position
                    data.position=this;
                }else
                    stopTrigger(e);
            }else{
                data.position=this;
                data.step = data.step > 0 ? 1 : -1;
            }
        },
        _navigateCtrl: function(e, data){
            if (data.step === -1 || data.step === 1 ){
                data.container='.row-data';
            }else{
                data.position=this;
                data.index=$('.row-data [data-navi]', this.element).index(e.target);
                data.step = data.step > 0 ? 1 : -1;
            }
        },
        _remove: function(e){
            stopTrigger(e);
            this.element.trigger('positionRemove', { position : this});
        },
        allowAction: function( name, allow){         
            var $btn=this.actionButtons[name];
            if (!Bajt.obj.is$($btn)) return;
            if ( allow === undefined || allow )
                $btn.show();
            else
                $btn.hide();
        },
        block: Bajt.basicForm.block,
        field: Bajt.basicForm.field,
        focus: function(index, eventData){
            var field=this.field(index ? index : 0 );
            if (field) field.focus(eventData);
        },
        getDictionary: Bajt.basicForm.getDictionary,
        getLimits: Bajt.basicForm.getLimits,
        getSummary:function(){
            return this.field('summary').value() || 0;
        },
        setNr:function(nr){
            if ( nr !== undefined)
                this.options.nr=nr;
        },
        setValues:function(values){
            for( var name in values){
                if(this._fieldsByName.hasOwnProperty(name))
                    this._fieldsByName[name].value(values[name]);
            }
        },
        update:function(data){
            var that=this;
            $.each(data, function(name, value){
                that.field(name).update(value);
            });
        }
    };
    
    $.widget( "bajt.priceList", $.extend( true, {}, Bajt.basicForm, {
        options: {
            formFields: [
                'title', 
                { 
                    name: 'start',
                    options: {
                        type: 'date',
                        format: 'YYYY-MM-DD',
                        widget: {
                            type: 'datepicker',
                            options: {
                                timePicker: false,
                                startDate: true                                
                            }
                        }
                    }
                },
                { 
                    name: 'end',
                    options: {
                        type: 'date',
                        format: 'YYYY-MM-DD',
                        widget: {
                            type: 'datepicker',
                            options: {
                            }
                        }
                    }
                },
                'clients',
                'clientsGroups',
                'description'
            ],
            positionsOptions:{
                'ServiceCatalog': {
                    focusField: 'consigned'
                },
                'ServiceOptions': {
                    focusField: 'used'
                }
            }
        },
        _create: function(){
            var that=this,
                o=this.options;
            this.state('init');
            this._createBasicControls();
            this._createBasicOptions();
            this._createData();
            this._createFields();
            this._initPositions();
            this._initServiceCatalog()
            this.element.initExpBtns({ 
                entitySettings : o.entitySettings
            });
            this._bind();
            this.state('normal');
        },
        _bind: function(){
            var that=this;
            // this._on(this.element, {
            //     navigate: function(e, data){
            //         if (Bajt.obj.is(data) && data.field)
            //             that._navigate(e, data);
            //         else
            //             that._navigateCtrl(e, data);
            //     },
            //     positionRemove:  this._removePosition,
            //     changed: this._change,
            //     submit: this._submit
            // });
            // this.$addPositionBtns.each(function(){
            //     var $this=$(this);
            //     that._on($this, {
            //         click: function(e){
            //             that._newPosition($this.data('add-position'));
            //         }
            //     });
            // });
            // this._on(this.serviceCatalog.$showBtn, {
            //     click: function(){
            //         that.serviceCatalog.$modal.modal('show');
            //     }
            // });
            // this._on(this.serviceCatalog.$addBtn, {
            //     click: this._fromServiceCatalog
            // });
            if(Bajt.obj.is$(this.$close))
                this._on(this.$close, {
                    click: function(){
                        if (window.opener)
                            if (Bajt.obj.is(window.opener.dataTables) && window.opener.dataTables.hasOwnProperty(that.options.entitySettings.en))
                                window.opener.dataTables[that.options.entitySettings.en].ajax.reload();
                            else
                                window.opener.location.reload();
                    }
                });
        },
        _addPosition: function(postionsECN, $position){
            var 
                o=this.options,
                positions=this._positions[postionsECN],
                position=$position['position'+postionsECN]($.extend( {
                    index : positions.index,
                    formName: o.formName,
                }, o.positionsOptions[postionsECN] )).data('bajtPosition'+postionsECN);
            positions.tab.push(position);
            positions.index++;
            positions.count++;
            return position;
        },
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
        _blockPartial:function(){
            // var status=this.field('status').value();
            // if(status > 2){
            //     var noBlock={
            //         3 : [ 'status', 'closed', 'receipt'],
            //         4 : [ 'status', 'receipt', 'paid'],
            //         5 : [ 'status', 'receipt', 'paid']
            //     };
            //     for (var f in this._fieldsByName) {
            //         if( noBlock[status].indexOf(f) < 0)
            //             this._fieldsByName[f].block(true);
            //         else
            //             this._fieldsByName[f].block(false);
            //     }
            //     this.$addPositionBtns.prop('disabled', true);
            //     this._blockPositions(true);
            //     this.serviceCatalog.$showBtn.prop('disabled', true);
            //     $(Bajt.html.validateSelector(this.options.formName + "_client")).prop('disabled', true);
            // }else if(status == 2){
            //     var block=['title', 'description', 'accessory', 'type'];
            //     for (var f in block) {
            //         this._fieldsByName[block[f]].block(true);
            //     }
            // }
        },
        _blockPositions: function(block){
            // for( var p in this._positions){
            //     var positions=this._positions[p].tab;
            //     for( var i in positions)
            //        positions[i].block(block);
            // }
        },
        _customAllowedOperation:function(operation, data){
            var allow=true;
            // switch(operation){
            //     case 'prevStatus':
            //         allow = !this.field('closed').isEmpty();
            //     break;
            //     case 'nextStatus':
            //         var status=this.field('status').value();
            //         allow = !this.field('created').isEmpty() && status > 1 && status < 5;
            //     break;
            // }
            return allow;
        },
        _customBlock: function (block) {
            // // $.each(this._services, function () {
            // //     this.block(block);
            // // });
            // this.$addPositionBtns.prop('disabled', block);
            // this._blockPositions(block);
            // this.serviceCatalog.$showBtn.prop('disabled', block);
            // this.$statusBtns.prev.prop('disabled', block);
            // this.$statusBtns.next.prop('disabled', block);
            // $(Bajt.html.validateSelector(this.options.formName + "_client")).prop('disabled', block);
        },
        _customChange:function(data){
            // if(data.summary){
            //     this.summary();
            // }
        },
        _customCreateBasicControls: function () {
            // this.serviceCatalog= {
            //     $showBtn: this.element.find('#services_catalog')
            // };
            // this.$addPositionBtns=this.element.find('[data-add-position]');
            // this.$statusBtns={
            //     prev: this.element.find('#btn_status_prev'),
            //     next: this.element.find('#btn_status_next')
            // }
        },
        _customCreateData:function(){
            this._positions={};
            for(var k in this.options.positionsOptions){
                this._positions[k]={
                    tab:[],
                    count: 0,
                    index: 0
                };
            }
            // this.closed=false;
        },
        _customState: function(state, data){
            var b=1;
            switch(state){
                case 'normal':
                case 'submitSuccess':
                    // this._blockPartial();
                break;                    
            }
            return this._state;
        },
        _customValidate:function(){
            // for(var p in this._positions){
            //     var positions=this._positions[p].tab;
            //     for (var i in positions) {
            //         var pvalid = positions[i].validate();
            //         if (pvalid.msg) {
            //             this._initValid();
            //             this.valid.add(pvalid);
            //         }
            //     }
            // }
            return this.valid;
        },
        _fromServiceCatalog:function(e){
            // stopTrigger(e);
            // var sc=this.serviceCatalog,
            //     selected=sc.table.rows( { selected: true } ),
            //     services=[];
            // selected.every( function ( rowIdx, tableLoop, rowLoop ) {
            //     var data=Bajt.entity.fill(this.data(), 'ServiceCatalog'),
            //         values={},
            //         fields=['title', 'value', 'options' ];
            //     for( var i in fields ){
            //         if(data[fields[i]]){
            //             values[fields[i]]=data[fields[i]];
            //         }
            //     }
            //     console.log(values);
            //     services.push(values);
            // } );
            // selected.deselect();
            // this.importServices(services);
            // //    sc.$modal.modal('hide');
        },
        _initServiceCatalog:function(){
            // var sc=this.serviceCatalog;
            // sc.$modal = $('#servicecatalog_modal');
            // sc.$addBtn= sc.$modal.find('.btn-save');
            // sc.$table= sc.$modal.find('.dataTable');
            // sc.table= sc.$table.DataTable();
        },
        _initPositions:function(){
            // var that=this,
            //     o=this.options;
            // this.$positions={};
            // for(var p in o.positionsOptions){
            //     var ll=o.fieldSelectorPrefix+B.str.firstLower(p);
            //     var $positions=this.element.find(o.fieldSelectorPrefix + B.str.firstLower(p));
            //     $.extend(true, o.positionsOptions[p], $positions.data());
            //     $positions.find('.row-pos').each(function(){
            //         var $pos=$(this);
            //         that._addPosition(p, $pos);
            //     });
            //     this.$positions[p]=$positions;
            // }

            // // this.$services=this.element.find(o.fieldSelectorPrefix+'services');
            // // $.extend(o.positionsOptions.Services, this.$services.data());
            // // this.$services.find('.row-pos').each(function(){
            // //     var $pos=$(this);
            // //     that._addService($pos);
            // //     $pos.initFormWidgets();
            // // });
            // this.calc();
        },
        _navigate: function(e, data){
            var i,
                step = data.step === 3 ? 1 : data.step,
                fieldName= data.field.option("name");
            stopTrigger(e);
            if (data.position){
                var 
                    pos_ecn=data.position.option('ecn'),
                    positions=this._positions[pos_ecn],
                    i = positions.tab.indexOf(data.position) +  step;
                if(data.step === 3) fieldName= this.options.positionsOptions.focusField || 0 ;
                    while ( i >= 0 && i <= positions.index && ( positions.tab[i] === undefined )){
                        i+=step;
                }
                if ( positions.tab[i] ){
                    positions.tab[i].focus(fieldName, data);
                }else if( i > 0 ){
                    this._newPosition(pos_ecn, fieldName, {}, data);
                }

                // var services=this._services,
                //     pc = services.length;   
                // i = services.indexOf(data.service) +  step;
                // if(data.step === 3) fieldName= "performed" ;
                // while ( i >= 0 && i <= this.serviceIndex && ( services[i] === undefined )){
                //     i+=step;
                // }
                // if ( services[i] ){
                //     services[i].focus(fieldName);
                // }else if( i > 0 ){
                //     this._newService(fieldName);
                // }
            }else{
                var 
                    fields=this._fields,
                    fc = fields.length;
                i = fields.indexOf(data.field) + step;
                while( i >= 0 && i < fc && !fields[i].option('navi')){
                    i+=step;
                }
                if (fields[i])
                    fields[i].focus(data);
            }
        },
        _navigateCtrl: function(e, data){
            if (data.position){
                stopTrigger(e);
                var 
                    pTarget=data.position.option('nr') -1 + data.step;
                    positions=this._positions[data.position.option('ecn')];
                if( 0 <= pTarget && pTarget < positions.count ){
                    data.target=data.index;
                    positions.element.find('.row-data').naviElement(null, data);
                }
            }
        },
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
        _newPosition: function(positionsECN, focusField, values, eventData){
            // if (!this.allowedOperation('new'+positionsECN))
            //     return;
            // var 
            //     that=this,
            //     o=this.options,
            //     $positions=this.$positions[positionsECN],
            //     $newPosition=$(o.positionsOptions[positionsECN].prototype.replace(/__pn__/g, this._positions[positionsECN].index)),
            //     position= this._addPosition(positionsECN, $newPosition);
            // $newPosition.appendTo($positions).slideDown("fast", function(){
            //     $newPosition.initFormWidgets();
            //     that.state('changing');
            //     position.setValues(values);
            //     that.state('normal');
            //     position.focus(focusField, eventData);
            //     if (typeof that.importQueue === 'number' ){
            //         if (that.importQueue > 1)
            //             that.importQueue--;
            //         else{
            //             delete that.importQueue;
            //             that.calc();
            //         }
            //     }
            // });
        },
        _removePosition:function(e, data){
            var
                that=this,
                $position=data.position.element,
                positions=this._positions[data.position.option('ecn')];
                $position.slideToggle("fast", function () {
                    positions.tab.splice(positions.tab.indexOf(data.position), 1);
                    positions.count--;
                    $position.remove();
                });
        },
        // _removeService:function(e, data){
        //     var
        //         that=this,
        //         $service=data.service.element;
        //     $service.slideToggle("fast", function () {
        //         that._services.splice(that._services.indexOf(data.service), 1);
        //         that.servicesCount--;
        //         $service.remove();
        //     });
        // },
        _showStatus:function(){
            // if(this.allowedOperation('showStatus')){
            //     var status=this.field('status').value(),
            //         o=this.options,
            //         opt=o.statusButtons[status];
            //     var rm_class=[];
            //     for(var i in o.statusButtons){
            //         if(i != status && o.statusButtons[i].class)
            //             rm_class.push(o.statusButtons[i].class);
            //     }
            //     this.$nextStatusBtn
            //         .removeClass(rm_class.join(' '))
            //         .addClass(opt.class)
            //         .changeIcon(opt.icon)
            //         .attr('title', opt.title)
            //         .text(opt.label)
            //         .show();
            // }else
            //     this.$nextStatusBtn.hide();
        },
        _toggleServiceOrder:function(){
            // var co=this.$statusBtns.prev.data(),
            //     fc=this.field('closed');
            // if(fc.isEmpty()){
            //     fc.value(new Date());
            // }else{
            //     fc.value(null);
            // }
        },
        calc:function(){
            return this.summary('calc');
        },
        importPositions:function(positionsECN, positions){
            // if (Bajt.obj.isIterate(positions) && this.allowedOperation('import'+positionsECN)){
            //     var that=this;
            //     if (positions.length > 0 ){
            //         this.importQueue=positions.length;
            //         $.each(positions, function(idx, position){
            //          //   service.shift();
            //             that._newPosition(positionsECN, this.options.positionsOptions[positionsECN].focusField, position);
            //         });
            //     }
            // }
        }
    }));

    $.fn.initFormPriceList=function(){
        var $form=$(this).find('form[data-form=pricelists]');
        if (Bajt.obj.is$($form)){
           $form.priceList();
           $(".modal-field").modalField();
        }
    };    
})(jQuery);



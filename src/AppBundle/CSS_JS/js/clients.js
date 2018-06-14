$.widget('bajt.clientService', $.extend(true, {}, Bajt.basicWidget, {
    options: {
        panels: {
        },
        info: {

        }
        // ,
        // details: {

        // }
    },
    _create: function () {
        this._createBasicControls()
            ._createBasicOptions()
            ._initPanels()
            ._createData()
            ._showInfo()
            ._actualizeUrls()
            ._bind();
    },
    _bind: function () {
        this._on(this.element, {
            'client-change': this._clientChange
        });
        //            this.$tabs.on('shown.bs.tab', function(e, data){
        //                that.$activeTab=$(e.target);
        //                that.$activeContent=that.$contents.find(that.$activeTab.attr('href'));
        //     
        //            });
        return this;
    },
    _actualizeUrls: function () {
        var
            client = this.cdata.client,
            _actualize = function () {
                var $this = $(this),
                    url = $this.data('url-tmpl');
                if (Bajt.obj.is(client)) {
                    if (url) {
                        var params = B.url.getParametersObj(url);
                        if (url.indexOf('__cid__') > 0) {
                            url = url.replace('__cid__', client.id);
                        } else {
                            params.cid = client.id;
                        }
                        url = Bajt.url.replaceParameters(url, params);
                        $this.attr('href', url).data('url', url);
                    }
                    $this.removeClass('disabled');
                } else {
                    if (url) {
                        $this.attr('href', '#').data('url', '#');
                    }
                    $this.addClass('disabled');
                }
            };
        //     params = [],
        //     param = '';
        // if (Bajt.obj.is(client))
        //     params.push('cid=' + client.id)
        // if (params.length > 0)
        //     param = '?' + params.join('&');
        for (var p in this.panels) {
            if (Bajt.obj.is$(this.panels[p].$toolbar)) {
                this.panels[p].$toolbar.find('a').each(_actualize);
            }
        }
        return this;
    },
    
    _createBasicControls: function () {
        this.$info = this.element.find('#client-info');
        this.$infoPreview = this.$info.find('.info-box-header');
        this.$infoContent = this.$info.find('.info-box-content');
        return this;
    },
    _clientChange: function (e, data) {
        var
            op = this.options.panels,
            client = this.cdata.client,
            panel,
            _init=function(){
                panel.$panel.initContent();
            };
        for (var p in this.panels) {
            panel = this.panels[p];
            if (op[p].ajax) {
                if (Bajt.obj.is(client)) {
                    panel.$panel.showLoader();
                    panel.$panel.load(op[p].url.start.replace('__cid__', client.id), _init);
                } else {
                    panel.$panel.empty();
                }
            } else if (panel.table) {
                DT.setFilter(panel.table, 'client', Bajt.obj.is(client) ? [client.id] : []);
            }
        }
        this._showInfo();
        this._actualizeUrls();
        // this._showDetails();
        return this;
    },
    _createData: function () {
        this.cdata = {
            client: null
        };
        return this;
    },
    _customCreateBasicOptions: function () {
        var o = this.options;
        $.extend(true, o.info, this.$info.data());
        for (var p in o.panels) {
            var $panel = this.element.find('#' + p + '_panel');
            if (Bajt.obj.is$($panel)) {
                $.extend(true, o.panels[p], $panel.data());
            }
        }
        // $.extend(true, o.details, this.$details.data());
        return this;
    },
    _initPanels: function () {
        var o = this.options;
        this.panels = {};
        for (var p in o.panels) {
            this.panels[p] = {
                $panel: this.element.find('#' + p + '_panel')
            };
            if (!o.panels[p].ajax) {
                this.panels[p].$toolbar = this.panels[p].$panel.find('#' + p + '_toolbar');
                this.panels[p].table = dataTables[p];
                this.panels[p].filter = filterBars[p];
            }
        }
        return this;
    },
    _showDetails: function () {
        var
            client = this.cdata.client,
            o = this.options,
            $details = this.$details;
        if (Bajt.obj.is(client)) {
            $details.showLoader();
            $details.load(o.details.url.start.replace('__cid__', client.id), function () {
                $details.initContent();
            });
        }
        return this;
    },
    _showInfo: function () {
        var
            client = this.cdata.client,
            oinfo = this.options.info;
        this.$infoContent.empty();
        if (Bajt.obj.is(client)) {
            this.$infoPreview.empty().append($(oinfo.templates.preview).fill(client, 'Clients'));
            this.$infoContent.append($(oinfo.templates.info).fill(client, 'Clients'));
        } else {
            this.$infoPreview.html(oinfo.templates.empty);
        }
        return this;
    },
    client: function (clientData) {
        var d = this.cdata;
        if (clientData !== undefined) {
            d.client = clientData;
            this.element.trigger('client-change', {
                row: this
            });
        }
        return d.client;
    }
}));

$.widget('bajt.clientsService', $.extend(true, {}, Bajt.basicWidget, {
    options: {
        leftPanel: '#clients_panel',
        rightPanel: '#service_panel'
    },
    _create: function () {
        this._createBasicControls()
            ._createBasicOptions();
        this.$rightPanel.clientService();
        this._createData()
            ._bind();
    },
    _bind: function () {
        var that = this;
        this.clientsTable.on('select', function (e, dt, type, indexes) {
            var row = dt.row(indexes).data();
            that.clientId = row.id;
            that.service.client(row);
            console.log('select -' + type + ' - ' + indexes + ' : ' + row);

        });
        this.clientsTable.on('deselect', function (e, dt, type, indexes) {
            console.log('select -' + type + ' - ' + indexes);
        });
        this.clientsTable.on('selectItems', function (e, dt, items) {
            console.log('selectItems');
        });
        this.clientsTable.on('selectStyle', function (e, dt, style) {
            console.log('selectStyle');

        });

        this.clientsTable.on('user-select', function (e, dt, type, cell, originalEvent) {
            console.log('user-select');
        });

        //            this.$panelLeft.on('select.dt', function(e, row, element){
        //                that.clientId=row.id;
        //                that.service.client(row);
        //            });


        //            this.$search.on('keypress', function(e){
        //                var charCode = (typeof e.which === 'number') ? e.which : e.keyCode;
        //                switch (charCode) {
        //                    case 0: // Arrow keys, delete, etc
        //                    case 38:
        //                    case 40:
        //                        if (e.keyCode >=37 || e.keyCode <= 40){
        //                            switch (e.keyCode)
        //                            {
        //                                case 38:
        //                                    step=-1;
        //                                break;
        //                                case 40:
        //                                    step=1;
        //                                break;
        //                            }           
        //                            if (step!==0){
        //                                e.preventDefault();
        //                                e.stopPropagation();
        //                                $(this).trigger('scroll', {step: step });
        //                                return false;
        //                            }
        //                        }
        //                        return true;
        //                    case 13:
        //                        e.preventDefault();
        //                        e.stopPropagation();   
        //                        $(this).trigger('choice');
        //                        return false;
        //                }
        //                return true;
        //            });
        //            this._on(this.$panelLeft, { 
        //                scroll: this._scrollClient, 
        //                choice: this._choiceClient  
        //            });
        return this;
    },
    _createBasicControls: function () {
        this.$leftPanel = $('#clients_panel');
        this.$rightPanel = $('#service_panel');
        return this;
    },
    _createData: function () {
        this.clientId = 0;
        this.rowIndex = 0;
        this.clientsTable = dataTables['clients'];
        this.service = this.$rightPanel.data('bajtClientService');
        return this;
    },
    _scrollClient: function (e, data) {
        // var $t = this.clientsTable;
        if (this.rowIndex + data.step >= 0) {
            this.rowIndex += data.step;
        }
        if (this.rowIndex >= 0) {

        }
        return this;
    },
    _choiceClient: function (e, data) {
        // var $t = this.$clientTable;

    }

}));
(function ($) {
    $.fn.initClientService = function (options) {
        var $service = $('#service');
        if (Bajt.obj.is$($service)) {
            $service.clientsService();
        }

    };
})(jQuery);
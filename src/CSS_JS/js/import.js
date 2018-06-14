var statusText={
        error : 'Błąd',
        warning : 'Ostrzeżenie',
        ok : 'Ok'
    },
    statusClass={
        error : 'danger',
        warning : 'warning',
        ok : 'success'
    },
    _msg=function(msg){
        var $ul=$('<ul/>');
        if(typeof msg === 'string'){
            msg=[ msg];
        }
        for(var i in msg){
            $ul.append($('<li/>').html(msg[i]));
        }
        return $('<p/>').append($ul);
    },
    _txt=function(label, text, classes){
        var $s=$('<span/>');
        if (classes){
            $s.addClass(classes);
        }
        $s.html('<strong>'+label+':&nbsp</strong>'+text); 
        return $s; 
    },
    _p=function(label, text, classes){
        return $('<p/>').append(_txt(label, text, classes)); 
    },
    _impPosMsg=function(nr, pos){
        var $imp=$('<li class="list-group-item"></li>');
//            $imp.addClass('list-group-item-'+statusClass[pos.status]);
        $imp.append($('<p/>').append(_txt('Nr', nr), _txt('Status', statusText[pos.status], 'ml-2 text-'+statusClass[pos.status])));
        $imp.append(_msg(pos.messages));
        return $imp;
    },
    _genAccordionContainer= function(id){
        return $('<div class="panel-group" id="'+id+'" role="tablist" aria-multiselectable="true"></div>');
    },
    _genAccordionPanel= function(parentId, id){
        var collapseId='collapse_'+id,
            headingId='heading_'+id,
            $panel=$('<div class="panel panel-default">'+
                '<div class="panel-heading" role="tab" id="'+headingId+'">'+
                    '<h4 class="panel-title">'+
                        '<a role="button" data-toggle="collapse" data-parent="#'+parentId+'" href="#'+collapseId+'" aria-expanded="false" aria-controls="'+collapseId+'">'+
                '</a></h4></div>'+
                '<div id="'+collapseId+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="'+headingId+'">'+
                    '<div class="panel-body"></div>'+
                '</div>'+
            '</div>');    
        return $panel;
    },        
    _genImpStatus=function(status){
        var s={
                ok:{
                    label: 'OK',
                    addClass: 'btn-success',
                    icon: 'ok'
                },
                warning:{
                    label: 'OSTRZERZENIA',
                    addClass: 'btn-warning',
                    icon: 'ok'
                },
                error:{
                    label: 'BŁĄD',
                    addClass: 'btn-danger',
                    icon: 'ok'
                }
            },
            $status=$('<span style="margin-left:15px;" class="btn btn-xs">'+s[status].label+'</span>').addClass(s[status].addClass);
            return $status;
    },
    
    _impOrderMsg=function(order){
        var $imp=$('<div class="well"/>');
//            $imp.addClass('alert-'+statusClass[order.status])
        if(Bajt.json.is(order)){
            order=JSON.parse(order);
        }
        $imp.append(_p('Status', statusText[order.status], 'text-'+statusClass[order.status] ));
        $imp.append(_p('ID import', order.oid ));
        $imp.append(_p('Utworzone', order.generated ));
        if(order.hasOwnProperty('number')){
            $imp.append(_p('Numer w Drako', order.number ));
        }
        $imp.append(_msg(order.messages));
        if(order.hasOwnProperty('positions')){
            var $ul=$('<ul class="list-group"></ul>');
            for ( var i in order.positions){
                $ul.append(_impPosMsg(parseInt(i, 10)+1, order.positions[i]));
            }
            $imp.append($('<p><strong>Pozycje:</strong></p>'));
            $imp.append($ul);
        }
        return $imp;
    },
    // _impOrderMsg=function(order){
     
    // },
    
    _impDeliveryMsg= function(delivery){
        var $content=$('<div/>');
        $content.append(_msg(delivery.messages));
        if(Bajt.obj.is(delivery.orders)){
            var id='accordion_delivery_'+delivery.id,
                $accordion=_genAccordionContainer(id).appendTo($content);
            for(var i in delivery.orders){
                var orderData=delivery.orders[i],
                    orderId='p_delivery_'+orderData.oid,
                    $panel=_genAccordionPanel(id, orderId).appendTo($accordion);
                    $panel.find('.panel-title a')
                        .append($('<span>Zamówienie ID w Medos '+orderData.oid+' </span>'))
                        .append($(_genImpStatus(orderData.status)));
                $panel.find('.panel-body').append(_impOrderMsg(orderData));
            }
        }
        return $content.html();
    };

$('body').on('click', '[data-show-import]', function (e) {
    var $btn=$(this),
        $myModal=$('#importModal'),
        $content=$myModal.find('.modal-body');
        $content.empty();
        $content.append('<h3>Informacje o imporcie</h3>');
        $content.append(_impOrderMsg($btn.data('show-import')));
        $myModal.modal('show');
        // if($.isArray(delivery.orders)){
        //     var $ul=$('<ul class="list-group"></ul>');
        //     for ( var i in delivery.positions){
        //         $ul.append(_impPosMsg(parseInt(i, 10)+1, delivery.positions[i]));
        //     }
        //     $imp.append($('<p><strong>Pozycje:</strong></p>'));
        //     $imp.append($ul);
        // }

});

$('body').on('click', '[data-import]', function (e) {
    var $btn=$(this),
        label=$btn.html(),
        $myModal=$('#importModal'),
        $content=$myModal.find('.modal-body'),
        bData=$btn.data(),
        $table=$(bData.table),
        _impMsg=function(data){
            $content.empty();
            $content.append('<h4>'+data.message+'</h4>');
            if(Bajt.obj.is(data.importData.deliveries)){
                var id='accordion_import',
                    $accordion=_genAccordionContainer(id).appendTo($content);
                for(var i in data.importData.deliveries){
                    var deliveryData=data.importData.deliveries[i],
                        deliveryId='p_delivery_'+deliveryData.id,
                        $panel=_genAccordionPanel(id, deliveryId).appendTo($accordion);
                        $panel.find('.panel-title a')
                            .append($('<span>Dostawa nr '+deliveryData._purchaseMedosNumber+' </span>'))
                            .append($(_genImpStatus(deliveryData.status)));
                    $panel.find('.panel-body').append(_impDeliveryMsg(deliveryData));//.find('[aria-expanded]').attr('aria-expanded', false);
                }
            // if(Bajt.obj.is(data.import.orders)){
            //     for ( var o in data.import.orders ){
            //         $content.append(_impOrderMsg(data.import.orders[o]));
            //     }
            // }
            }
        };
        $btn.html('Trwa import - czekaj').prop('disabled', true);
        $.ajax({
            type: 'GET',
            url: bData.url,
            success: function(data, status, xhr) {
                $btn.html(label).prop('disabled', false);
                console.log();
                _impMsg(data);
                $myModal.modal('show');
                if(data.importData.count > 0){
                    $table.bootstrapTable('refresh'); 
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $btn.html(label).prop('disabled', false);
                alert('Error Message: '+textStatus);
            }
        });    
});


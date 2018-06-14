function getAppSettings(selector) {
    $.extend(true, Bajt.settings, $(selector || '#content_body').data());
}

function selectorControl(selector, prefixControl) {
    prefixControl = typeof prefixControl !== 'undefined' ? prefixControl : 'btn';
    var selectorOK = Bajt.html.validateSelector(selector),
        objPrefix = '#' + prefixControl + '_',
        selectors = {
            field: '',
            control: ''
        };
    if (selectorOK.indexOf(objPrefix) < 0) {
        selectors.field = selectorOK;
        selectors.control = selectorOK.replace(prefixId, objPrefix);
    } else {
        selectors.control = selectorOK;
        selectors.field = selectorOK.replace(objPrefix, prefixId);
    }
    return selectors;
}

$('#btnDel').click(function() {
    // confirmation
    if (confirm('Are you sure you wish to remove this section? This cannot be undone.')) {
        var num = $('.clonedInput').length;
        // how many 'duplicatable' input fields we currently have
        $('#entry' + num).slideUp('slow', function() {
            $(this).remove();
            // if only one element remains, disable the 'remove' button
            if (num - 1 === 1) {
                $('#btnDel').attr('disabled', true);
            }
            // enable the 'add' button
            $('#btnAdd')
                .attr('disabled', false)
                .prop('value', 'add section');
        });
    }
    return false;
    // remove the last element

    // enable the 'add' button
    //        $('#btnAdd').attr('disabled', false);
});

function ajaxLoad() {
    var $link = $(this),
        url = $link.attr('href'),
        $mainWrapper = $('#main-wrapper');
    if (typeof url === 'string' && url !== '#') {
        var $loader = $mainWrapper.showLoader();
        console.log('menu-ajax');
        $mainWrapper.load(
            url,
            {
                view: 'ajax'
            },
            function(responseText, textStatus, jqXHR) {
                if (textStatus === 'error') {
                    var $modal = $('#my_modal');
                    $modal.find('.modal-content').html(responseText);
                    $loader.remove();
                    $modal.modal('show');
                } else {
                    window.history.replaceState('', '', url);
                    getAppSettings();
                    $mainWrapper.initContent();
                    $mainWrapper.initModals();
                }
            }
        );
    }
}

(function($) {
    if ($.fn.bootstrapSwitch) {
        $.fn.bootstrapSwitch.Constructor.prototype._width = function() {
            var $handles, handleWidth, labelWidth, wrapperWidth;
            this.$wrapper.outerWidth(
                this.options.wigetWidth ? this.options.wigetWidth : this.$wrapper.closest('.form-group').innerWidth()
            ); //zablokowanie szerokości
            (wrapperWidth = this.$wrapper.innerWidth()), ($handles = this.$on.add(this.$off));
            $handles.add(this.$label).css('width', '');
            if (this.options.handleWidth === 'auto') {
                handleWidth = Math.max(this.$on.width(), this.$off.width());
            } else if (this.options.handleWidth.indexOf('%') > 0) {
                var precent = Math.min(90, parseInt(this.options.handleWidth, 10));
                handleWidth = Math.round(wrapperWidth * precent / 100);
            } else {
                handleWidth = this.options.handleWidth;
            }
            //        console.log('switch'+handleWidth);
            //        else
            //            handleWidth = Math.max(this.$on.width(), this.$off.width()) ;

            labelWidth = wrapperWidth - handleWidth;
            $handles.outerWidth(handleWidth);
            this.$label.outerWidth(labelWidth);
            this._handleWidth = this.$on.outerWidth();
            this._labelWidth = this.$label.outerWidth();
            this.$container.width(this._handleWidth * 2 + this._labelWidth + 2);
            return this.$wrapper;
        };
    }
    $.fn.getFormWidget = function(type) {
        var $this = $(this),
            widgetInstance = null;
        switch (type) {
            case 'field':
                widgetInstance = $this.data('bajtField');
                break;
            case 'multiselect':
                widgetInstance = $this.data('multiselect');
                break;
            case 'datepicker':
                widgetInstance = $this.daterangepicker('instance');
                break;
            case 'switch':
                widgetInstance = $this.bootstrapSwitch('instance');
                break;
            case 'upload':
                widgetInstance = $this.uploads('instance');
                break;
            case 'uploads':
                widgetInstance = $this.uploads('instance');
                break;
            case 'combobox':
                widgetInstance = $this.data('bajtCombobox');
                break;
            case 'copytextarea':
                widgetInstance = $this.data('bajtCopyTextarea');
                break;
            case 'jsonedit':
                break;
        }
        return widgetInstance;
    };

    $.fn.initFormWidget = function(options) {
        var $this = $(this),
            widgetInstance = null,
            type,
            dtpOptions;
        if (!Bajt.obj.is(options)) {
            options = $this.data('options') || {};
        }
        type = options.type || options.widget || $this.data('widget');
        switch (type) {
            case 'multiselect':
                if($this.find('option').length === 0){
                    var dic= options.dic || $this.data('dic');
                    if(B.obj.is(dic)){
                        for(var i in dic){
                            var l='<option value="'+ (dic[i].v || dic[i].id) +'" title="'+ (dic[i].d || '') +'">'+(dic[i].n || dic[i].name)+'</option>';
                            $this.append( '<option value="'+ (dic[i].v || dic[i].id) +'" title="'+ (dic[i].d || '') +'">'+(dic[i].n || dic[i].name)+'</option>');
                        }
                    }
                }
                var defValues = $this.data('def-value');
                if (defValues) {
                    $this.writeField($this.data('def-value'));
                }
                $this.multiselect(
                    $.extend(
                        true,
                        {
                            buttonWidth: 'auto',
                            allSelectedText: 'Wybrano wszystkie',
                            nonSelectedText: 'Nie wybrano',
                            includeSelectAllOption: true,
                            selectAllText: 'wszystkie',
                            selectAllValue: '',
                            selectAllJustVisible: false,
                            numberDisplayed: 20,
                            enableFiltering: true,
                            filterPlaceholder: 'Szukaj ...',
                            enableCaseInsensitiveFiltering: true,
                            buttonTitle: function(options, select) {
                                var labels = [];
                                options.each(function() {
                                    labels.push($(this).text());
                                });
                                return labels.join(' - ');
                            },
                            templates: {}
                        },
                        options
                    )
                );
                break;
            case 'datepicker':
                var startDate = moment($this.val());
                dtpOptions = $.extend(
                    true,
                    {
                        singleDatePicker: true,
                        timePicker: true,
                        timePicker24Hour: true,
                        showDropdowns: true,
                        linkedCalendars: false,
                        alwaysShowCalendars: true,
                        buttonClasses: 'btn btn-sm btn-info',
                        autoApply: true,
                        autoUpdateInput: true,
                        locale: $.extend({}, B.settings.daterange.locale)
                    },
                    options
                );
                if (startDate.isValid()) {
                    dtpOptions.startDate = startDate;
                } else if (dtpOptions.startDate === true) {
                    dtpOptions.startDate = moment();
                } //startDate.format(dtpOptions.locale.format) : moment().format(dtpOptions.locale.format);
                $this.daterangepicker(dtpOptions);
                if (dtpOptions.autoUpdateInput === false) {
                    $this
                        .on('apply.daterangepicker', function(ev, picker) {
                            $(this).val(
                                picker.startDate.format(dtpOptions.locale.format) +
                                    ' - ' +
                                    picker.endDate.format(dtpOptions.locale.format)
                            );
                        })
                        .on('cancel.daterangepicker', function(ev, picker) {
                            $(this).val('');
                        });
                }
                widgetInstance = $this.data('daterangepicker');
                $this.on('navigate-success', function(){
                    widgetInstance.hide();
                });
                break;
            case 'daterange':
                var ranges = B.settings.daterange.periods,
                    dic = $this.data('dic'),
                    defRange = $this.data('def-value');
                dtpOptions = $.extend(
                    true,
                    {
                        showDropdowns: true,
                        linkedCalendars: false,
                        alwaysShowCalendars: true,
                        buttonClasses: 'btn btn-sm btn-info',
                        autoApply: true,
                        autoUpdateInput: false,
                        locale: $.extend({}, B.settings.daterange.locale)
                    },
                    options
                );
                if ($.isArray(dic)) {
                    ranges = {};
                    for (var i = 0; i < dic.length; i++) {
                        ranges[dic[i].name] = B.momentRange(dic[i].value, dic[i].unit);
                    }
                }
                if (ranges.hasOwnProperty(defRange)) {
                    defRange = ranges[defRange];
                } else {
                    defRange = [moment().subtract(1, 'months'), moment()];
                }

                dtpOptions.startDate = defRange[0].format(dtpOptions.locale.format);
                dtpOptions.endDate = defRange[1].format(dtpOptions.locale.format);
                dtpOptions.ranges = ranges;
                $this
                    .daterangepicker(dtpOptions)
                    .on('apply.daterangepicker', function(ev, picker) {
                        $(this).val(
                            picker.startDate.format(dtpOptions.locale.format) +
                                ' - ' +
                                picker.endDate.format(dtpOptions.locale.format)
                        );
                    })
                    .on('cancel.daterangepicker', function(ev, picker) {
                        $(this).val('');
                    });
                widgetInstance = $this.data('daterangepicker');
                $this.on('navigate-success', function(){
                    widgetInstance.hide();
                });
                break;
            case 'switch':
                $this.bootstrapSwitch(
                    $.extend(
                        true,
                        {
                            onColor: 'success',
                            offColor: 'default',
                            handleWidth: '85%',
                            wigetWidth: 100,
                            onText: 'tak',
                            offText: 'nie'
                        },
                        options
                    )
                );
                break;
            case 'nettoinput':
                widgetInstance = $this
                    .nettoInput(
                        $.extend(
                            true,
                            {
                                vat: 23
                            },
                            options
                        )
                    )
                    .data('bajtNettoInput');
                break;
            case 'dtImport':
                widgetInstance = $this.dtImport($.extend(true, {}, options)).data('bajtDtImport');
                break;
            case 'upload':
                $this.uploads(
                    $.extend(
                        true,
                        {
                            maxUploads: 1
                        },
                        options
                    )
                );
                break;
            case 'uploads':
                $this.uploads(
                    $.extend(
                        true,
                        {
                            maxUploads: 3,
                            multiple: true
                        },
                        options
                    )
                );
                break;
            case 'combobox':
                widgetInstance = $this.combobox($.extend(true, {}, options)).data('bajtCombobox');
                break;
            //            case 'copytextarea':
            //                $this.copyTextarea(
            //                    $.extend({
            //                        entitySettings: $this.data('entity-settings')
            //                    },
            //                    options
            //                ));
            //            break;
            case 'jsonedit':
                var $container = $('<div/>').height(250); //.addClass('form-control');
                $this
                    .hide()
                    .parent()
                    .append($container);
                var strValue = $this.val();
                var editor = new JSONEditor(
                    $container[0],
                    {
                        mode: 'tree',
                        modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
                        onError: function(err) {
                            alert(err.toString());
                        },
                        onModeChange: function(newMode, oldMode) {
                            //                          console.log('Mode switched from', oldMode, 'to', newMode);
                        },
                        onChange: function() {
                            var json = editor.get();
                            $this.val(JSON.stringify(json));
                        }
                    },
                    strValue !== '' ? JSON.parse(strValue) : null
                );
                break;
        }
        // console.log('*****widget - ');
        // console.log( type);
        // console.log($this.data());
        return widgetInstance;
    };

    $.fn.initFormWidgets = function() {
        this.find('[data-widget]').each(function() {
            var $this = $(this),
                widget = $this.data('widget'),
                options = $this.data('options') || {};
            $this.initFormWidget(
                $.extend(
                    true,
                    options,
                    Bajt.obj.is(widget)
                        ? widget
                        : {
                              type: widget
                          }
                )
            );
        });
        //        this.find('[data-exp]').expBtnAction();
    };

    $.fn.initFieldBtn = function() {
        $('[data-btn]', this).each(function() {
            var $button = B.html.get$('btn', {
                    icon: 'library_books'
                }),
                $el = $(this),
                $parent = $el.parent(),
                $buttons,
                o = $el.data('btn');
            if (o.btnClass) {
                $button.addClass(o.btnClass);
            }
            if ($parent.hasClass('input-group')) {
                $buttons = $parent.find('.input-group-append');
            } else {
                $el.wrap('<div class="input-group" />');
                $parent = $el.parent();
                $buttons = $('<div class="input-group-append" />');
                $parent.append($buttons);
            }
            $buttons.append($button);
        });
    };

    $.fn.initModals = function() {
        this.initModalConfirm();
    };

    $.fn.initContent = function() {
        for (var i in contentInits) {
            if (typeof this[contentInits[i]] === 'function') {
                this[contentInits[i]]();
            }
        }
    };

    $.fn.showLoader = function() {
        var $this = $(this);
        var $overlay = $(
            '<div class="overlay"><div class="loader"><div class="animate"></div><div class="msg"><h3>Poczekaj, wczytuję ...</h3></div></div></div>'
        )
            .css('display', 'flex')
            .hide()
            .appendTo($this)
            .fadeIn();
        //        var $loader=$('<div class="loader"></div>');
        // $overlay.append();
        // $this.append($overlay);
        // $overlay.fadeIn();
        return $overlay;
    };

    $.fn.naviElement = function($element, data) {
        var $elements = this.find(data.hasOwnProperty('selector') ? data.selector : '[data-navi]'),
            targetIndex = data.hasOwnProperty('target') ? data.target : $elements.index($element) + data.step;
        if (0 <= targetIndex && targetIndex < $elements.length) {
            $elements[targetIndex].focus();
        }
    };
})(jQuery);

$(document).ready(function() {
    //    $('.filterbar').filterbar();
    //        console.log('ready-document');
    var $body = $('body');
    $body.find('.scroll-x, .scroll').each(function() {
        var scrollWidth = this.scrollWidth,
            clientWidth = this.clientWidth;
        if (scrollWidth > clientWidth) {
            $(this)
                .children()
                .each(function() {
                    var calcWidth = this.clientWidth + scrollWidth - clientWidth;
                    $(this).css({
                        width: calcWidth,
                        'max-width': calcWidth
                    });
                });
        }
    });

    $body
        .on('click', '[data-showinfo]', function() {
            var $this = $(this),
                show = String($this.data('showinfo')),
                containerSelector = $this.data('containerSelector') || '.row-pos',
                elementSelector = $this.data('elementSelector') || '.row-info';
            if (show) {
                switch(show){
                    case '1': 
                        $this
                            .closest(containerSelector)
                            .children(elementSelector)
                            .slideToggle();
                        break;
                    case 'all':
                        $(elementSelector).slideToggle();
                        break;
                    case 'childs':
                        $this
                            .find(elementSelector)
                            .slideToggle();
                    break;
                    default:
                        $this
                            .closest('.' + show)
                            .find(elementSelector)
                            .slideToggle();
                    
                }

            //     if (show === '1') {
            //         $(this)
            //             .closest('.row-pos')
            //             .children('.row-info')
            //             .slideToggle();
            //     } else if (show === 'all') {
            //         $('.row-info').slideToggle();
            //     } else {
            //         $(this)
            //             .closest('.' + show)
            //             .find('.row-info')
            //             .slideToggle();
            //     }
            }
        })
        .on('click', '[data-show-child]', function() {
            var $this = $(this),
                $rowpos = $this.closest('.row-pos'),
                show = $this.data('show-child');
            if (show) {
                if (show === '1') {
                    $rowpos.children('.row-child').slideToggle();
                } else if (show === 'all') {
                    $('.row-child').slideToggle();
                } else {
                    $rowpos
                        .closest('.' + show)
                        .find('.row-child.' + show)
                        .slideToggle();
                }
            }
        })
        .on('click', '.btn-upload', function() {
            var maxupload = 4,
                uploadSelector = $(this).data('field') ? $(this).data('field') : selectorControl($(this).attr('id')),
                $uploadField = $(uploadSelector),
                count = $uploadField.find('.form-control').length;
            if (count < maxupload) {
                var $fileUpload = $('#fileupload'),
                    fileUpload = $fileUpload.data('blueimp-fileupload') || $fileUpload.data('fileupload');
                fileUpload.options.uploadContainer = $uploadField;
                $fileUpload.click();
            }
        })
        .on('click', '.upload .btn-remove', function() {
            var $upload = $(this).closest('.upload');
            //            $position=$upload.closest('.position');
            $upload.slideUp('fast', function() {
                var data = $upload.data();
                if (data.hideStatus) {
                    data.hideStatus();
                }
                $upload.remove();
                //            Order.attachDel($position);
            });
        })
        // .on('click', '#test', function () {
        //     var $messages = $('.form-messages'),
        //         $messagesContent = $messages.find('.content');
        //     $messages.slideDown();
        // })
        .on('click', '.btn[data-value]', function(e) {
            var $this = $(this),
                btnData = $this.data();
            //            value=$this.attr('data-value');
            if (btnData.value && !btnData.hasOwnProperty('bs.popover')) {
                stopTrigger(e);
                var tmpl = btnData['tmpl'],
                    value = btnData.value,
                    options = {
                        trigger: 'click'
                    };
                if (tmpl) {
                    var $container = $this.closest('.show-container'),
                        templates = $container.data('templates'),
                        esettings = $container.data('entity-settings');
                    console.log(esettings);
                    tmpl = Bajt.obj.getValue(tmpl, templates);
                    if (tmpl) {
                        var $view;
                        if ($.isArray(value)) {
                            $view = $('<div class="table"></div>');
                            for (var i in value) {
                                $view.append($(tmpl).fill(value[i], 'PositionsLackers'));
                            }
                        } else {
                            $view = $(tmpl);
                            $view.fill(value, 'Lackers');
                        }
                        options['html'] = true;
                        value = $view.html();
                    }
                }
                if (Bajt.str.is(value)) {
                    options['content'] = value;
                    $this.popover(options);
                    $this.click();
                }
            }
        })
        .on('click', '.btn[data-toggle=ajax]', function(e) {
            stopTrigger(e);
            ajaxLoad.call(this);
        })
        .on('click', '#btn_close', function() {
            console.log('window close');
            window.close();
        })
        .on('keydown', '[data-navi]', keyPress.navi)
        .on('navigate', '[data-navi]', function(e, data) {
            var $this = $(this),
                $container = $this.closest(Bajt.obj.is(data) && data.container ? data.container : $this.data('navi'));
            if (Bajt.obj.is$($container)) {
                $container.naviElement($this, data);
            }
            console.log('navigate');
        });

    var $mainWrapper = $('#main-wrapper');

    $('body').on('click', '[data-function]', function(e) {
        e.preventDefault();
        var $btn = $(this);
        $btn[$btn.data('function')]();
    });

    $('[data-menu=ajax]').on('click', '.nav-link', function(e) {
        var $link = $(this),
            url = $link.attr('href'),
            target = $link.attr('target');
        if (['_blank', '_self'].indexOf(target) >= 0) {
            return;
        }
        if (typeof url === 'string' && url !== '#') {
            stopTrigger(e);
            var $loader = $mainWrapper.showLoader(),
                $item = $link.parent(),
                $dropdownMenu = $item.closest('.dropdown-menu'),
                $dropdown = $dropdownMenu.closest('.dropdown'),
                $menu = $item.closest('[data-menu=ajax]');
            //                $item.dropdown('toggle');
            // console.log('menu-ajax');
            $mainWrapper.load(
                url,
                {
                    view: 'ajax'
                },
                function(responseText, textStatus, jqXHR) {
                    if (textStatus === 'error') {
                        var $modal = $('#my_modal');
                        $modal.find('.modal-content').html(responseText);
                        $loader.remove();
                        $modal.modal('show');
                    } else {
                        $menu.find('.active').removeClass('active');
                        $item.addClass('active');
                        if (Bajt.obj.is$($dropdown)) {
                            $dropdownMenu.removeClass('show');
                            $dropdown.removeClass('show');
                            $dropdown.find('[aria-expanded=true]').attr('aria-expanded', false);
                        }
                        window.history.replaceState('', '', url);
                        document.title = $mainWrapper.find('#page_title').data('title');
                        getAppSettings();
                        $mainWrapper.initContent();
                        $mainWrapper.initModals();
                    }
                }
            );
        }
    });
    getAppSettings();
    // console.log(Bajt.settings);
    // console.log('!!!!!');
    $('body').initContent();
    $('body').initModals();
});

// nieużywane
// function setValueControl(selector, prefixControl) {
//     var selector = selectorControl(selector, prefixControl),
//         $field = $(selector.field),
//         $control = $(selector.control),
//         value = $field.val(),
//         html = $field.data('default');
//     if ($field.data('txt') !== '') {
//         html = $field.data('txt');
//     } else if (value !== '') {
//         if ($field.is('select')) {
//             var $fieldOption = $field.find('option[value=' + value + ']');
//             html = $fieldOption.size() !== 0 ? $fieldOption.html() : '';
//         } else html = value;
//     }
//     $control.html(html);
// }

// function checkState(selector, chkValue, prefixControl) {
//     chkValue = isSet(chkValue) ? chkValue : '';
//     var selector = selectorControl(selector, prefixControl),
//         $field = $(selector.field),
//         $control = $(selector.control);
//     if ($field.val() !== chkValue) {
//         $control.addClass('btn-primary');
//     } else {
//         $control.removeClass('btn-primary');
//     }
// }

// function setDateTime(id, dateTime) {
//     dateTime = dateTime ? dateTime : new Date();
//     $(id + '_date_year').val(dateTime.getFullYear());
//     $(id + '_date_month').val(dateTime.getMonth());
//     $(id + '_date_day').val(dateTime.getDay());
//     $(id + '_time_hour').val(dateTime.getHours());
//     $(id + '_time_minute').val(dateTime.getMinutes());
//     $(id + '_time_second').val(dateTime.getSeconds());
// }

// function transFieldNames(obj, fields) {
//     var newobj = {};
//     for (var key in obj) {
//         var k = Bajt.getFullFieldName(key, fields), //get field name
//             o = obj[key];
//         if ($.isArray(o)) {
//             newobj[k] = [];
//             for (var i = 0; i < o.length; i++)
//                 newobj[k].push(
//                     Bajt.obj.is(o[i]) ? transFieldNames(o[i], fields.children[k]) : o[i]
//                 );
//         } else if (Bajt.obj.is(o)) newobj[k] = transFieldNames(o, fields.children[k]);
//         else newobj[k] = o;
//     }
//     return newobj;
// }

// function getValueOfVariable(variableName) {
//     var i,
//         value = '';
//     if (isSet(variableName)) {
//         var variable = variableName.split('.');
//         if (variable.length > 0) {
//             value = window[variable[0]];
//             for (i = 1; i < variable.length; i++) {
//                 value = value[variable[i]];
//             }
//         }
//     }
//     return value;
// }

// function Message(message, type, data) {
//     this.message = message;
//     this.type = type || 'i';
//     this.types = {
//         w: 'msg-warning',
//         e: 'msg-error',
//         s: 'msg-succes',
//         i: 'msq-info'
//     };
//     this.html = function (tags) {
//         var html;
//         html = '<li class="' + this.types[this.type] + '">';
//         if (Array.isArray(tags)) {
//             html += tags[0] + this.message + tags[1];
//         } else {
//             html += this.message;
//         }
//         html += '</li>';
//         return html;
//     };
// }

// function genMsg(msg) {
//     var $msg = $('<ul/>');
//     if (typeof msg !== 'undefined') {
//         if (typeof msg === 'string') $msg.append($('<li/>').html(msg));
//         else
//             for (var k in msg) {
//                 var $li = $('<li/>');
//                 var m = msg[k];
//                 if (Bajt.obj.is(m)) {
//                     if (m.hasOwnProperty('label'))
//                         $li.append($('<strong/>').html(m['label']));
//                     if (m.hasOwnProperty('type')) $li.addClass('msg-' + m['type']);
//                     if (Bajt.obj.is(m['message'])) {
//                         for (var k1 in m['message']) {
//                             if (Bajt.obj.is(m['message'][k1]))
//                                 $li.append(genMsg(m['message'][k1]));
//                             else $li.append($('<ul/>').html(m['message'][k1]));
//                         }
//                     }
//                     $li.append($('<span/>').html(m['message']));
//                 } else $li.html($('<span/>').html(m));
//                 $msg.append($li);
//             }
//     }
//     return $msg;
//     //                    $messagesContent.html(messageHtml);
//     //                    $messages.addClass('alert-success').slideDown();
// }

// end nieużywane

//function Filter(datatable_id, filterbar_id){
//    this['filters']={};
//    this['datatable']='#'+datatable_id;
//    this['filterbar']='#'+filterbar_id;
//    this['apply']=function(){
//        $(this.datatable).bootstrapTable('refresh');
//    };
//    this['read']=function(){
//        var $fields=$(this.filterbar).find('select');
//        this['filters']={};
//        $(this.filterbar).find('select').each(function(index, select){
//            var field=getFieldName(select),
//                filter=$(select).val();
//            if (filter !== ''){
//                this[field]=filter;
//            }
//        });
//    };
//}

//
// function orderDetailsFormatter(index, row) {
//     //    var
//     //        btable=this,
//     //    $details=$(this.detailsPrototype),
//     //    $positions=$details.find('.table-view'),
//     //    posPrototype=$positions.data('position-tmpl'),
//     //    lackerPrototype=$positions.data('lacker-tmpl'),
//     //    posFields= btable.entitySettings.positions.fields,
//     //    positions=fieldValue( row, 'positions', btable.entitySettings.fields);
//     //    var klk=fieldValue( row, 'id', btable.entitySettings.fields );
//     //    $positions.data('id', fieldValue( row, 'id', btable.entitySettings.fields ));
//     //    $.each(positions, function(idx, position){
//     //        var $pos=$(posPrototype),
//     //            cells=$pos.find('[data-name]');
//     //            $pos.find('.row-data').data('id', fieldValue( position, 'id', posFields ));
//     //        cells.each(function(){
//     //            var
//     //            $cell=$(this),
//     //            opt=$cell.data(),
//     //            value=fieldValue( position, opt.name, posFields ); //position[opt.name];
//     //            if (opt.collection){
//     //                $.each( value, function(idx, obj){
//     //                    $cell.append(html.showObj(obj, lackerPrototype, btable.entitySettings.lackers.dictionaries, posFields.children.positionLackers ));
//     //                });
//     //            }else if (opt.dictionary){
//     //                var row=Bajt.dic.from(btable.entitySettings.dictionaries[opt.dictionary], value);
//     //                $cell.html(row ? row['n'] : value);
//     //            }else if(opt.checked){
//     //                $cell.find('input').prop('checked', value);
//     //            }else
//     //                $cell.html(value);
//     //        });
//     //        $positions.append($pos);
//     //    });
//     //    return $details.html();
//     return this.detailsPrototype;
// }

// $.fn.initDateRange = function () {
//     $(this).find('[data-daterange]').daterangepicker({
//             showDropdowns: true,
//             linkedCalendars: false,
//             alwaysShowCalendars: true,
//             buttonClasses: 'btn',
//             autoApply: true,
//             autoUpdateInput: true,
//             startDate: moment().subtract(30, 'days'),
//             endDate: moment(),
//             locale: {
//                 format: 'YYYY-MM-DD',
//                 separator: ' - ',
//                 applyLabel: 'Ok',
//                 cancelLabel: 'Wyczyść',
//                 fromLabel: 'Od',
//                 toLabel: 'Do',
//                 customRangeLabel: 'Zakres',
//                 daysOfWeek: [
//                     'N',
//                     'Pn',
//                     'Wt',
//                     'Śr',
//                     'Cz',
//                     'Pi',
//                     'So'
//                 ],
//                 monthNames: [
//                     'Styczeń',
//                     'Luty',
//                     'Marzec',
//                     'Kwiecień',
//                     'Maj',
//                     'Czerwiec',
//                     'Lipiec',
//                     'Sierpień',
//                     'Wrzesień',
//                     'Październik',
//                     'Listopad',
//                     'Grudzień'
//                 ],
//                 firstDay: 1
//             },
//             ranges: {
//                 'Dzisiaj': [moment(), moment()],
//                 'Ostatni tydzień': [moment().subtract(6, 'days'), moment()],
//                 'Ostatnie 30 dni': [moment().subtract(29, 'days'), moment()],
//                 'Aktualny miesiąc': [moment().startOf('month'), moment().endOf('month')],
//                 'Poprzedni miesiąc': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
//                 'Ostatni kwartał': [moment().subtract(2, 'month').startOf('month'), , moment().endOf('month')],
//                 'Aktualny rok': [moment().startOf('year'), moment()]
//             }
//         })
//         .on('apply.daterangepicker', function (ev, picker) {
//             $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
//         })
//         .on('cancel.daterangepicker', function (ev, picker) {
//             $(this).val('');
//         });
// };

/*
$('body').on('click', '.modal button.btn-confirm', function (e) {
    e.preventDefault();
    var $modal=findParentByClass(this, 'modal');
    if ($modal.length){
        var data=JSON.stringify($modal.find('.exp-table').bootstrapTable('getData'));
        var mm=$modal.data('method');
        var url=$modal.data('action');
        var datatable=$modal.data('datatable');
        $.ajax({
            type: $modal.data('method'),
            url: $modal.data('action'),
            data: data//JSON.stringify($modal.find('.exp-table').bootstrapTable('getData'))
        })
        .done(function (data) {
            if (typeof data.message !== 'undefined') {
               var $footer=$modal.find('.modal-footer');
               $footer.find('.btn-save').fadeOut();
               $footer.find('.btn-cancel').fadeOut();
               var ii=$modal.find('.form-messages');
               $modal.find('.form-messages').html(data.message).addClass('alert-success').slideDown();
               $footer.find('.btn-ok').fadeIn();
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (typeof jqXHR.responseJSON !== 'undefined') {
                if (jqXHR.responseJSON.hasOwnProperty('form_body')) {
                    $modal.find('form_body').html(jqXHR.responseJSON.form_body);
                }
 
                $modal.find('.form-errors').html(jqXHR.responseJSON.message).slideDown();
            } else {
                alert(errorThrown);
            }
 
        });
    }
});
*/

// $.fn.initAjaxCarlack = function () {
//     //        $(this).on('submit', '.ajaxCarlack', function (e) {
//     //            stopTrigger(e);
//     //            var
//     //                fdata,
//     //                tableName,
//     //                $modal=$(this).closest('.modal'),
//     //                $panel=$(this).closest('.panel'),
//     //                $form=$(this),
//     //                formName=$form.attr('name'),
//     //    //            $modal.find('.form-errors').slideUp().empty();
//     //    //            $modal.find('.form-messages').slideUp().empty();
//     //    //            $modal.find('.has-error').removeClass('has-error');
//     //    //            $modal.find('.has-warning').removeClass('has-warning');
//     //                $errors=$form.find('.form-errors'),
//     //                $errorsContent= $errors.find('.content'),
//     //                $messages=$form.find('.form-messages'),
//     //                $messagesContent= $messages.find('.content'),
//     //                _showMessage=function(messages, classes){
//     //                    var $container=$('<div class="alert"></div>');
//     //                    if (classes) $container.addClass(classes);
//     //                        $messages.showMessages(messages, $container);
//     //                },
//     //                _showErrors=function(errors){
//     //                     $errors.showMessages(errors, $('<div class="alert alert-danger"></div>'));
//     //                };
//     //                if (Bajt.obj.is$($modal))
//     //                    tableName=$modal.data('table') || $modal.attr('id').replace('_modal', '');
//     //                else if ( Bajt.obj.is$($panel) )
//     //                    tableName=$panel.data('table')|| $panel.attr('id').replace('_panel', '');
//     //
//     //            _showMessages({ message : 'Trwa zapis do bazy danych test', type: 'i'}, 'alert-info');
//     //            var
//     //                $submit=$form.find(':submit'),
//     //                $id=$form.find('#'+formName+'_id');
//     //            $submit.attr('disabled', true);
//     //            console.log('!!!!ajax submit');
//     //            $.ajax({
//     //                type: $form.attr('method'),
//     //                url: $form.attr('action'),
//     //                data: $form.serialize()
//     //            })
//     //            .done(function (data) {
//     //                var isNew=!isSet($id.val()),
//     //                    showMessage= (typeof data.show  !== 'undefined' && data.show === '1') ||Bajt.obj.is$($panel);
//     //                if (isNew){
//     //                    $id.val(data.id);
//     ////                    $form.attr('method', 'PUT').attr('action', $form.attr('action').replace('create', data.id+'/update'));
//     //                    $form.attr('method', 'PUT').attr('action', Bajt.url.modify($form.attr('action'), '/create', '/'+data.id+'/update'));
//     ////                    var currentURL = window.location.href;
//     ////                    var newURL = currentURL.replace('/new', '/'+data.id+'/update');
//     //                    var newURL = Bajt.url.modify(window.location.href, '/new', '/'+data.id+'/edit');
//     //                    window.history.replaceState('', '', newURL);
//     //                    $submit.attr('title','Aktualizuj').html('Aktualizuj').val('Aktualizuj');
//     //                }
//     //
//     //                if (Bajt.obj.is$($modal) && !(data.show) ){
//     //                    if ( tableName && tableName in dataTables )
//     //                        dataTables[tableName].ajax.reload();
//     //                    $modal.modal('hide');
//     //                }else if (data.show === undefined || data.show){
//     //                    _showMessages(data.messages, 'alert-success');
//     //                }
//     //                if (Bajt.obj.is$($modal))
//     //                    $modal.trigger('submited', data );
//     //                else
//     //                    $form.trigger('submited', data );
//     //                $submit.attr('disabled', false);
//     //                console.log('ajax submited');
//     //                console.log(data);
//     //            })
//     //            .fail(function (jqXHR, textStatus, errorThrown) {
//     //                _showMessages();
//     //                if (typeof jqXHR.responseJSON !== 'undefined') {
//     //                    if (jqXHR.responseJSON.hasOwnProperty('form_body')){
//     //                         $form.find('.form_body').html(jqXHR.responseJSON.form_body);
//     //                        console.log('form_errors');
//     //                         $form.initFormWidgets();
//     //                }
//     //                    _showErrors(jqXHR.responseJSON.errors);
//     //                }else if (jqXHR.responseText)
//     //                    _showErrors(jqXHR.responseText);
//     //                else
//     //                    alert(errorThrown);
//     //                $submit.attr('disabled', false);
//     //
//     ////                        if (typeof jqXHR.responseJSON !== 'undefined') {
//     ////                    if (jqXHR.responseJSON.hasOwnProperty('form_body')) {
//     ////                         $form.find('.form_body').html(jqXHR.responseJSON.form_body);
//     ////                         $form.initFormWidgets();
//     ////                }
//     ////                    $errorsContent.append($(msgPrototype).addClass('alert-danger').append((new MSG(jqXHR.responseJSON.errors)).$html()));
//     ////
//     //////                    $errorsContent.append(genMsg(jqXHR.responseJSON.errors));
//     ////                    $errors.slideDown();
//     ////                } else {
//     ////                    alert(errorThrown);
//     ////                }
//     //            });
//     //        });
// };

//    $.fn.initAjaxCarlack=function(){
//        $(this).on('submit', '.ajaxCarlack', function (e) {
//            e.preventDefault();
//            var
//                msgPrototype='<div class='alert alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>',
//                $modal=$(this).parents('.modal'),
//                $panel=$(this).parents('.panel'),
//                $form=$(this),
//                fdata=$form.serialize(),
//                $submit=$form.find(':submit').attr('disabled', true),
//    //            $modal.find('.form-errors').slideUp().empty();
//    //            $modal.find('.form-messages').slideUp().empty();
//    //            $modal.find('.has-error').removeClass('has-error');
//    //            $modal.find('.has-warning').removeClass('has-warning');
//                $errors=$form.find('.form-errors'),
//                $errorsContent= $errors.find('.content'),
//                $messages=$form.find('.form-messages'),
//                $messagesContent= $messages.find('.content'),
//                tableName=null;
//                if (isSet($modal))
//                    tableName=$modal.data('table') || $modal.attr('id').replace('_modal', '');
//                else if ( isSet($panel) && $panel.length===1 )
//                    tableName=$panel.data('table')|| $panel.attr('id').replace('_panel', '');
//                $form.find('.has-error').removeClass('has-error');
//                $form.find('.has-warning').removeClass('has-warning');
//                var formName=$form.attr('name');
//                var $id=$form.find('#'+formName+'_id');
//                $errors.slideUp(function(){
//                    $errorsContent.empty();
//                });
//                $messages.slideUp(function(){
//                    $messagesContent.empty();
//                });
//            $.ajax({
//                type: $form.attr('method'),
//                url: $form.attr('action'),
//                data: fdata
//            })
//            .done(function (data) {
//                var isNew=!isSet($id.val()),
//                    showMessage= (typeof data.show  !== 'undefined' && data.show === '1') ||isSet($panel);
//                if (isNew){
//                    $id.val(data.id);
////                    $form.attr('method', 'PUT').attr('action', $form.attr('action').replace('create', data.id+'/update'));
//                    $form.attr('method', 'PUT').attr('action', Bajt.url.modify($form.attr('action'), '/create', '/'+data.id+'/update'));
//
////                    var currentURL = window.location.href;
////                    var newURL = currentURL.replace('/new', '/'+data.id+'/update');
//                    var newURL = Bajt.url.modify(window.location.href, '/new', '/'+data.id+'/edit');
//                    window.history.replaceState('', '', newURL);
//                    $submit.attr('title','Aktualizuj').html('Aktualizuj').val('Aktualizuj');
//                }
//                if (isSet($modal) && (!data.hasOwnProperty('show') || !data.show)){
//                    if ( tableName && tableName in dataTables )
//                        dataTables[tableName].ajax.reload();
//                    $modal.modal('hide');
//                }else{
//                    $messagesContent.append($(msgPrototype).addClass('alert-success').append((new MSG(data.messages)).$html()));
//                    $messages.slideDown();
//                }
//                $submit.attr('disabled', false);
//                $form.trigger('submited', data );
//            })
//            .fail(function (jqXHR, textStatus, errorThrown) {
//                if (typeof jqXHR.responseJSON !== 'undefined') {
//                    if (jqXHR.responseJSON.hasOwnProperty('form_body')) {
//                         $form.find('.form_body').html(jqXHR.responseJSON.form_body);
//                         $form.initFormWidgets();
//                }
//                    $errorsContent.append($(msgPrototype).addClass('alert-danger').append((new MSG(jqXHR.responseJSON.errors)).$html()));
//
////                    $errorsContent.append(genMsg(jqXHR.responseJSON.errors));
//                    $errors.slideDown();
//                } else {
//                    alert(errorThrown);
//                }
//                $submit.attr('disabled', false);
//            });
//        });
//    };

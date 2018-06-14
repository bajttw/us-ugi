(function($, B) {
    'use strict';
    $.extend(true, B, {
        html: {
            tmpl: {
                btn: '<button type="button" class="btn"></button>',
                icon: '<i class="material-icons"></i>',
                txtWrapper: '<span></span>',
                inputGroup: '<div class="input-group" />',
                inputGroupBtn: '<div class="input-group-append" />'
            },
            get$: function(type, options) {
                var $e = null,
                    t = B.html,
                    o = $.isPlainObject(options) ? options : {};
                switch (type) {
                    case 'btn':
                        $e = $(t.tmpl.btn);
                        if (isSet(o.icon)) {
                            $e.append(t.get$('icon', B.obj.is(o.icon) ? o.icon : o));
                        }
                        if (isSet(o.text)) {
                            $e.append($(t.tmpl.txtWrapper).html(o.text));
                        }

                        break;
                    case 'icon':
                        $e = $(t.tmpl.icon).text(o.icon);
                        break;
                    default:
                        $e = $(t.tmpl[type]);
                }
                if (B.obj.is$($e)) {
                    if (isSet(o.addClass)) {
                        $e.addClass(o.addClass);
                    }
                    if (B.obj.is(o.attr)) {
                        $.each(o.attr, function(n, v) {
                            $e.attr(n, v);
                        });
                    }
                    if (B.obj.is(o.triggers)) {
                        $.each(o.triggers, function(n, opt) {
                            $e.on(n, function(e) {
                                if (opt.stop) {
                                    stopTrigger(e);
                                }
                                if (typeof opt.eFunction === 'function') {
                                    opt.eFunction(e);
                                }
                                if (opt.trigger) {
                                    $e.trigger(opt.trigger);
                                }
                            });
                        });
                    }
                }
                return $e;
            },
            get: function(type, options) {
                return B.html.get$(type, options)[0].outerHTML;
            },
            getPrototypeTmpl: function(tmpl, prototypeName, index) {
                return B.str.is(prototypeName) ? tmpl.replace(B.str.match(prototypeName, 'contains'), index) : tmpl;
            },
            getNrFromId: function(str) {
                var nrStr = '',
                    match = /_\d+/.exec(str);
                if (match) {
                    nrStr = match[0].slice(1, match[0].length);
                }
                return nrStr !== '' ? parseInt(nrStr, 10) : -1;
            },
            getNameFromId: function(str) {
                var name = '',
                    match = /_[^_.]*$/.exec(str);
                if (match) {
                    name = match[0].slice(1, match[0].length);
                }
                return name;
            },
            validateSelector: function(selector) {
                var selectorOk = '';
                if (typeof selector === 'string') {
                    if (selector[0] !== '#') {
                        selectorOk = '#' + selector;
                    } else {
                        selectorOk = selector;
                    }
                }
                return selectorOk;
            }
        }
    });

    $.fn.calcOverflow = function() {
        $(this)
            .find('.overflow-x:visible')
            .each(function() {
                var sw = this.scrollWidth;
                this.firstElementChild.style.minWidth = sw - 4 + 'px';
                // var d=$container.innerWidth();
                // var s=$container.get(0).scrollWidth;
                // $container.first().css('min-width', $container.scrollWidth);
            });
    };

    $.fn.removeClassSearch = function(search, type) {
        var classMatch = B.str.match(search, type);
        if (classMatch) {
            this.removeClass(function() {
                return (this.className.match(classMatch) || []).join(' ');
            });
        }
        return this;
    };

    // font awesome 5
    // $.fn.changeIcon=function(icon){
    //     if(typeof icon === 'string' && icon!==''){
    //         $fa=this.attr('data-icon') ? this : this.find('[data-icon]');
    //         $fa.attr('data-icon', icon.replace('fa-', ''));
    //     }
    //     return this;
    // }

    // font awesome 4.6
    //    $.fn.changeIcon=function(icon){
    //     if(typeof icon === 'string' && icon!==''){
    //         var faClass= icon.indexOf('fa-')< 0 ? 'fa-'+icon : icon,
    //             $fa=this.hasClass('fa') ? this : this.find('.fa');
    //             $fa.removeClassSearch('fa-').addClass(faClass);
    //     }
    //     return this;
    // }

    // materials
    $.fn.changeIcon = function(icon) {
        if (typeof icon === 'string' && icon !== '') {
            var $fa = this.hasClass('material-icons') ? this : this.find('.material-icons');
            $fa.text(icon);
        }
        return this;
    };

    
})(jQuery, Bajt);

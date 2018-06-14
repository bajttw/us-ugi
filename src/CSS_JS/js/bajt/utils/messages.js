(function($, B) {
    'use strict';
    $.fn.addMessage = function(messages, $element) {
        var m = new Msg(messages),
            $msg = m.$html();
        if (B.obj.is$($element)) {
            $element.append($msg);
        } else {
            $element = $msg;
        }
        $element.hide();
        $element.appendTo($(this)).slideDown('fast');
    };

    $.fn.showMessages = function(messages, $container) {
        var $this = $(this),
            _show = function() {
                if (typeof messages !== 'undefined') {
                    $this.slideDown('fast');
                    $this.addMessage(messages, $container);
                }
            };
        if ($this.html() !== '') {
            $this.slideUp('fast', function() {
                $this.empty();
                _show();
            });
        } else {
            _show();
        }
    };
})(jQuery, Bajt);

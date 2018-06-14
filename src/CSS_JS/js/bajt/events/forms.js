(function($, B) {
    'use strict';
    $('body').on('mouseover', '.form-control', function(e) {
        var p = this.parentElement,
            $errors = $(p).find('.message-field');
        if ($errors.length > 0) {
            $errors.slideDown();
        }
    });

    $('body').on('mouseout', '.form-control', function(e) {
        $(this.parentElement)
            .find('.message-field')
            .slideUp('fast');
    });
})(jQuery, Bajt);

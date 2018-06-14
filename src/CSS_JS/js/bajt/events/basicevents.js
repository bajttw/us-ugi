function stopTrigger(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
}
(function($, B) {
    'use strict';
    $('body').on('close.bs.alert', '.alert', function() {
        $(this).slideUp();
    });

    $('body').on('click', '.alert .close', function() {
        var $alert = $(this).closest('.alert');
        $alert.slideUp(function() {
            $alert.find('.content').empty();
        });
    });
})(jQuery, Bajt);

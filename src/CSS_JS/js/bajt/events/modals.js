(function($, B) {
    'use strict';
    $('body').on('loaded.bs.modal', '.ajax', function() {
        var $this = $(this);
        // console.log('loaded.bs.modal');
        $this.initFormWidgets();
        // $this.find('.btn-save').hide();
        // $this.find('.btn-ok').hide();
    });

    $('body').on('show.bs.modal', '.ajax', function() {
        console.log('show.bs.modal');
        var $modal = $(this),
            $content = $modal.find('.modal-content'),
            modal = $modal.data('bs.modal');
        $content.load(modal._config.url, function(responseTxt, statusTxt, xhr) {
            if (statusTxt === 'success') {
                $content.initContent();
                // $content.find('.btn-save').hide();
                // $content.find('.btn-ok').hide();
            } else {
                $content.html('Error: ' + xhr.status + ': ' + xhr.statusText);
            }
        });
    });

    $('body').on('keypress', '.modal', function(e) {
        if (e.which === 13) {
            console.log('You pressed enter!');
            if (e.ctrlKey) {
                $(this)
                    .find('.btn-save:visible')
                    .click();
            }
        }
    });

    $('body').on('shown.bs.modal', '.modal', function() {
        $(this).redrawDataTables();
    });

    $('body').on('shown.bs.modal', '.modal[data-set-focus!=""]', function() {
        var $modal = $(this),
            $toFocus = $($modal.data('set-focus'), $modal).first();
        if (B.obj.is$($toFocus)) {
            $toFocus.focus();
        }
    });
    $('body').on('shown.bs.modal', '.modal', function() {
        $(this).calcOverflow();
    });

    $('body').on('hide.bs.modal', '.ajax', function() {
        var $modal = $(this);
        $modal
            .removeData('bs.modal')
            .find('.modal-content')
            .empty();
    });
    $('body').on('hide.bs.modal', '.modal-exp', function() {
        var $modal = $(this);
        var $footer = $modal.find('.modal-footer');
        //    $($modal.data('datatable')).bootstrapTable('refresh');
        $modal
            .find('.form-errors')
            .hide()
            .find('content')
            .empty();
        $modal
            .find('.form-messages')
            .hide()
            .find('content')
            .empty();
        $footer.find('.btn-save').show();
        $footer.find('.btn-cancel').show();
        $footer.find('.btn-ok').hide();
    });

    $('body').on('hidden.bs.modal', '.modal', function() {
        var $modal = $(this),
            $caller = $modal.data('callElement');
        console.log('modalHidden');
        if (B.obj.is$($caller)) {
            $caller.focus();
            $modal.removeData('callElement');
            console.log('callElement');
        }
    });

    $('body').on('click', '.btn[data-modal-widget]', function(e) {
        e.preventDefault();
        var $btn = $(this),
            btnData = $btn.data(),
            modal = $(btnData.target).data(btnData.modalWidget);
        modal.show(btnData.options);
    });
})(jQuery, Bajt);

$('#fileupload')
    .fileupload({
        dataType: 'json',
        autoUpload: false,
        //            autoStart: true,
        //            acceptFileTypes: /(\.|\/)(gif|jpe?g|png|pdf|doc?|txt|zip|rar)$/i,
        //            disableValidation: false,
        acceptFileTypes: /(\.|\/)(docx?|jpe?g|ods|odt|pdf|png|rar|rtf|txt|xlsx?|zip)$/i,
        maxFileSize: 1048576,
        // Enable image resizing, except for Android and Opera,
        // which actually support image resizing, but fail to
        // send Blob objects via XHR requests:
        disableImageResize: /Android(?!.*Chrome)|Opera/.test(window.navigator.userAgent),
        previewMaxWidth: 150,
        previewMaxHeight: 150,
        imageMaxWidth: 1920,
        imageMaxHeight: 1440,
        previewCrop: false,
        formData: {},
        uploadField: null,
        //            $container:null,
        //            showPrototype: $(this).data('show-tmpl'),
        //            statusPrototype:$(this).data('status-tmpl'),
        messages: {
            maxNumberOfFiles: 'Maximum number of files exceeded',
            acceptFileTypes: 'Niedozwolony typ pliku',
            maxFileSize: 'Plik jest zbyt duży (max 1MB)',
            minFileSize: 'Plik jest zbyt mały'
        },
        add: function (e, data) {
            console.log('fileuploadadd');
            var
                $this = $(this),
                that = $this.data('blueimp-fileupload') || $this.fileInput.data('fileupload'),
                uw = that.options.uploadWidget;
            uw.addUpload(data);
        },
        progress: function (e, data) {
            console.log('fileuploadprogress');
            data.uploadShow.showProgress(data);
            var progress = parseInt(data.loaded / data.total * 100, 10);
            console.log(progress);
        }

    })
    .on('fileuploadsubmit', function (e, data) {
        console.log('fileuploadsubmit');
        data.uploadShow.submit(data.files[0]);
    })
    .on('fileuploadalways', function (e, data) {
        console.log('fileuploadalways');
        //            var 
        //                file = data.files[data.index],
        //                $btnOk=data.context.find('.btn-ok');
        //            $btnOk.prop('disabled', !!data.files.error);
        // data.context.find('.btn-remove').prop('disabled', false);
    })
    .on('fileuploaddone', function (e, data) {
        console.log('fileuploaddone');
        $.each(data.result.files, function (index, file) {
            data.uploadShow.fileSuccess(file);
        });
    })
    .on('fileuploadfail', function (e, data) {
        console.log('fileuploadfail');
        if (typeof data._response.jqXHR.responseJSON !== 'undefined') {
            $.each(data._response.jqXHR.responseJSON, function (index, file) {
                var upload = JSON.parse(file);
                data.context.find('input').remove();
                data.showError(upload.error);
            });
        } else {
            alert(data._response.jqXHR.responseText);
        }
        data.status('error');
    })
    .prop('disabled', !$.support.fileInput)
    .parent().addClass($.support.fileInput ? undefined : 'disabled');

(function ($) {
    'use strict';
    $.widget('bajt.uploadShow', $.extend(true, {}, Bajt.basicWidget, {
        options: {
            preview: false,
            multiple: false,
            selectors: {
                actions: '.actions',
                deleteBtn: '[data-action=upload_delete]',
                processBtn: '.btn-process',
                descSignal: '[data-name=desc][data-signal]',
                descContainer: '.info',
                desc: '[data-name=desc]:not([data-signal])',
                descBtn: '[data-action=change]',
                process: '.upload-process',
                status: '.upload-status',
                progress: '.progress',
                progressBar: '.progress-bar',
                preview: '[data-name=preview]',
                processName: '[data-name=fname]',
                processSize: '[data-name=fsize]',
                name: '[data-name=original]',
                size: '[data-name=size]',
                message: '[data-name=message]',
                error: '[data-name=error]'

            },
            templates: {
                processBtn: '<button type="button" class="btn" style="display:none;"></button>',
                img: '<img/>'
            },
            messages: {
                upload: 'Wysylam plik'
            }
        },
        _bind: function () {
            this._on(this.$input, {
                change: this._change
            });
            this._on(this.$processBtn, {
                click: this._action
            });
            this._on(this.$deleteBtn, {
                click: this._delete
            });
            this._on(this.$descBtn, {
                click: this._toggleCommentEdit
            });
            this._on(this.$descSignal, {
                click: this._toggleComment
            });
            this._on(this.$desc, {
                change: this._changeComment
            });
            return this;
        },
        _action: function (e) {
            stopTrigger(e);
            switch (this._status) {
                case 'ready':
                    this._fileupload.submit();
                    break;
                case 'upload':
                    this._fileupload.abort();
                    this.state('ready');
                    break;
                // case 'loaded':
                //     if (o.multiple)
                //         this.element.slideUp(function () {
                //             $(this).remove();
                //         });
                //     else {
                //         this.value(null);
                //         delete this.fileUpload;
                //         this.fileUpload = null;
                //         console.log('cleared');
                //     }
                //     break;
            }
        },
        _btnRole: function (type) {
            var btnOptions = {
                ok: {
                    title: 'Wyslij',
                    addClass: 'btn-success',
                    icon: 'check'
                },
                stop: {
                    title: 'Zatrzymaj',
                    addClass: 'btn-primary',
                    icon: 'stop'
                },
                remove: {
                    title: 'Usuń',
                    addClass: 'btn-danger',
                    icon: 'remove'
                }
            };
            this.$processBtn
                .removeClassSearch('btn-')
                .attr('title', btnOptions[type].title)
                .addClass(btnOptions[type].addClass)
                .changeIcon(btnOptions[type].icon);

            // this.$processBtn.removeClass(function () {
            //         var cl = '';
            //         for (var t in btnOptions) {
            //             if (t != type)
            //                 cl += btnOptions[t].class + ' ';
            //         }
            //         return cl;
            //     })
            //     .attr('title', btnOptions[type].title)
            //     .addClass(btnOptions[type].class);

        },
        _build: function () {
            var o = this.options;
            this.$process = this.element.find(o.selectors.process);
            if (!Bajt.obj.is$(this.$process)) {
                this.$process = $(o.templates.process);
                this.element.append(this.$process);
            }
            this.$processBtn = this.element.find(o.selectors.processBtn);
            if (!Bajt.obj.is$(this.$processBtn)) {
                this.$processBtn = $(o.templates.processBtn).appendTo(this.element.find(o.selectors.actions));
            }
            this.$status = this.$process.find(o.selectors.status);
            if (!Bajt.obj.is$(this.$status)) {
                this.$status = $(o.templates.status).appendTo(this.$process);
            }
            return this;
        },
        _createBasicControls: function () {
            var o = this.options;
            this.$input = this.element.find('input');
            this.$preview = this.element.find(o.selectors.preview).hide();
            this.$name = this.element.find(o.selectors.name);
            this.$size = this.element.find(o.selectors.size);
            this.$desc = this.element.find(o.selectors.desc);
            this.$descSignal = this.element.find(o.selectors.descSignal);
            this.$descBtn = this.element.find(o.selectors.descBtn);
            this.$descContainer = this.element.find(o.selectors.descContainer);
            this.$deleteBtn = this.element.find(o.selectors.deleteBtn);
            return this;
        },
        _createData: function () {
            this._status = null;
            this._fileupload = null;
            this._bajtUploads = null;
            this.data = null;
            return this;
        },
        _customCreate: function () {
            this.value();
            this._fill();
            return this;
        },
        _change: function (e) {
            this._fill();
        },
        _changeComment: function (e) {
            // var k=1;
        },
        _decode: function (data) {
            if (Bajt.json.is(data)) {
                data = JSON.parse(data);
            }
            if (Bajt.obj.is(data) && data.fullUrl) {
                this.data = data;
                this.element.data('fileData', data);
                return data;
            }
            this.data = null;
            this.element.data('fileData', null);
            return null;
        },
        _delete: function (e) {
            if (this._status === 'loaded' || this._status === 'ready') {
                if (this.options.multiple) {
                    this.element.slideUp(function () {
                        $(this).remove();
                    });
                } else {
                    this.value(null);
                    delete this.fileUpload;
                    this.fileUpload = null;
                    console.log('cleared');
                }
            }
        },

        _fill: function () {
            var that = this,
                file = this.data || {},
                o = this.options,
                showPreview = function (url) {
                    var name = file.name || '';
                    if (o.preview) {
                        var $img = that.$preview.find('img');
                        if (!Bajt.obj.is$($img)) {
                            $img = $(o.templates.img);
                        }
                        $img
                            .attr('src', url)
                            .attr('title', name)
                            .attr('alt', name);
                        that.$preview.show();
                    }
                };
            // console.log(file);
            this.$size.html(file.size || '');
            this.$desc.html(file.desc || '');
            this.$descSignal.data('value', file.desc || '').attr('title', file.desc || 'brak uwag');
            if (file.fullUrl) {
                var url = file.fullUrl + file.name;
                showPreview(url);
                this.$name.html('<a href="' + url + '" target="_blank" >' + file.original + '</a>');
                this.status('loaded');
            } else {
                this.$size.html('');
                showPreview(this.getParameters('emptyPreview'));
                if (file.error) {
                    this.$desc.html(file.error).parent().slideDown();
                }
                this.status('empty');
            }
        },

        _sizeStr: function (size) {
            if (typeof size === 'number') {
                size = (size >= 1048576) ? (size / 1048576).toFixed(1) + ' MB' : (size / 1024).toFixed(1) + ' KB';
            }
            return size;
        },
        _showProcessInfo: function (type, info) {
            var that = this,
                selector = this.options.selectors[type],
                show = function ($element) {
                    if (!Bajt.obj.is$($element)) {
                        return;
                    }
                    $element.html(info || '');
                    that._toggleElement($element, info);
                };
            show(this.$status.find(selector));
            show(Bajt.obj.is$(this.$uplStatus) ? this.$uplStatus.find(selector) : null);
            return this;
        },
        _toggleComment: function () {
            // console.log(this.$descContainer.css('display')==='none')
            this._toggleElement(this.$descContainer, this.$descContainer.css('display') === 'none');
            return this;
        },
        _toggleCommentEdit: function () {
            var readonly = !this.$desc.attr('readonly'),
                opt = this.$descBtn.data(readonly ? 'off' : 'on');
            this.$desc.attr('readonly', readonly);
            this.$descBtn
                .attr('title', opt.title)
                .changeIcon(opt.icon);
            return this;
        },
        _toggleElement: function ($element, show) {
            if (!Bajt.obj.is$($element)) {
                return;
            }
            if (show) {
                $element.slideDown('fast');
            } else {
                $element.slideUp('fast');
            }
            return this;
            
        },
        _toggleStatusElement: function (type, show) {
            var selector = this.options.selectors[type];
            this._toggleElement(this.$status.find(selector), show)
                ._toggleElement(Bajt.obj.is$(this.$uplStatus) ? this.$uplStatus.find(selector) : null, show);
            return this;
        },
        submit: function () {
            var file = this._fileupload.files[0];
            if (file.error) {
                this.showError(file.error);
                this.status('error');
                return false;
            }
            this.status('upload');
        },
        bajtUploads: function (bajtUploads) {
            if (bajtUploads !== undefined) {
                this._bajtUploads = bajtUploads;
            }
            return this._bajtUploads;
        },
        fileSuccess: function (file) {
            this.value(file);
        },
        fileupload: function (fileupload) {
            if (fileupload !== undefined) {
                fileupload.uploadShow = this;
                this._fileupload = fileupload;
                this.status('ready');
            }
            return this._fileupload;
        },
        showErrors: function (error) {
            this._showProcessInfo('error', error);
        },
        showMessages: function (message) {
            this._showProcessInfo('message', message);
        },
        showProgress: function (data) {
            var selector = this.options.selectors.progressBar,
                progress = parseInt(data.loaded / data.total * 100, 10) || 0,
                progressStr = progress + '%',
                _show = function ($progress) {
                    if (!Bajt.obj.is$($progress)) {
                        return;
                    }
                    $progress.css('width', progressStr).attr('aria-valuenow', progress).html(progressStr);
                };
            _show(this.$status.find(selector));
            _show(Bajt.obj.is$(this.$uplStatus) ? this.$uplStatus.find(selector) : null);

            // this.$status.find(o.selectors.progressStr).css('width', progressStr).html(progressStr);
            // if(Bajt.obj.is$(this.$uplStatus)){
            //     this.$uplStatus.find(o.selectors.progress).val(progress);
            //     this.$uplStatus.find(o.selectors.progressStr).css('width', progressStr).html(progressStr);
            // }

            // var o=this.options,
            //     progress = parseInt(data.loaded / data.total * 100, 10) || 0,
            //     progressStr= progress+'%';
            // this.$status.find(o.selectors.progress).val(progress);
            // this.$status.find(o.selectors.progressStr).css('width', progressStr).html(progressStr);
            // if(Bajt.obj.is$(this.$uplStatus)){
            //     this.$uplStatus.find(o.selectors.progress).val(progress);
            //     this.$uplStatus.find(o.selectors.progressStr).css('width', progressStr).html(progressStr);
            // }
            console.log('showProgress');
        },
        status: function (status) {
            var o = this.options;
            if (status !== undefined) {
                this._status = status;
                switch (status) {
                    case 'error':
                        this.toggleProgress();
                        this._toggleElement(this.$processBtn);
                        this._toggleElement(this.$deleteBtn);
                        break;
                    case 'empty':
                        this.toggleProgress();
                        this._toggleElement(this.$processBtn);
                        break;
                    case 'ready':
                        this.toggleProcess(true);
                        this._btnRole('ok');
                        this._toggleElement(this.$processBtn, true);
                        this._toggleElement(this.$deleteBtn, true);
                        break;
                    case 'upload':
                        this._btnRole('stop');
                        this.toggleStatus(true);
                        this.showMessages(o.messages.upload);
                        this.toggleProgress(true);
                        break;
                    case 'loaded':
                        this._toggleElement(this.$deleteBtn, true);
                        // this._btnRole('remove');
                        this.toggleProcess();
                        break;
                }
            }
            console.log('uploadShow status: ' + this._status);
            return this._status;
        },
        toggleProcess: function (show) {
            if (show) {
                var file = this._fileupload.files[0];
                this.$process.find('[data-name=fname]').html(file.name);
                this.$process.find('[data-name=fsize]').html(this._sizeStr(file.size));
            } else {
                delete this._fileupload;
                this._fileupload = null;
                this.toggleStatus();
            }
            this._toggleElement(this.$process, show);
        },
        toggleProgress: function (show) {
            if (show) {
                this.showProgress(0);
            }
            this._toggleStatusElement('progress', show);
        },
        toggleStatus: function (show) {
            if (show) {
                this.$status.slideDown('fast');
                this.$uplStatus = $(this.options.templates.status);
                this._bajtUploads.addStatus(this.$uplStatus);
            } else {
                var $uplStatus = this.$uplStatus;
                this.toggleProgress();
                this.$status.slideUp('fast');
                if (Bajt.obj.is$($uplStatus)) {
                    $uplStatus.slideUp(function () {
                        $uplStatus.remove();
                    });
                    delete this.$uplStatus;
                }
            }
        },
        value: function (data) {
            if (data === undefined) {
                this._decode(this.$input.val());
            } else {
                this._decode(data);
                if (this.data) {
                    this.$input.val(JSON.stringify(this.data)).change();
                } else {
                    this.$input.val('').change();
                }
            }
            return this.data;
        }
    }));

    $.widget('bajt.uploads', $.extend(true, {}, Bajt.basicWidget, {
        options: {
            autoStart: false,
            multiple: false,
            maxUploads: 4,
            preview: false,
            ecn: 'Uploads',
            selectors: {
                add: '[data-action=add]',
                showContainer: '.form-control',
                show: '.upload-show',
                statusContainer: '.upload-status',
                field: 'input',
                fileupload: '#fileupload'
            },
            templates: {
                btnAdd: '<button type="button" class="btn btn-sm btn-primary ml-2"></button>',
                showContainer: '<div class="form-control">',
                statusContainer: '<div class="status-bar">'
            }
        },
        _bind: function () {
            this._on(this.$btnAdd, {
                click: this._add
            });
        },
        _add: function (e) {
            stopTrigger(e);
            this.fileUpload.option('uploadWidget', this);
            $(this.options.selectors.fileupload).click();
        },
        _buildShow: function (input) {
            var $input = $(input),
                // $btn,
                o = this.options,
                // val = $input.val(),
                // uploadData = val ? JSON.parse(val) : {},
                $show = $input.closest(o.selectors.show);
            if (!Bajt.obj.is$($show)) {
                $show = $(o.templates.show);
                this.$showContainer.append($show);
                $input.appendTo($show);
            }
            var show = $show.uploadShow({
                preview: o.preview,
                multiple: o.multiple,
                templates: {
                    process: o.templates.process,
                    status: o.templates.status
                }
            })
                .data('bajtUploadShow');
            show.bajtUploads(this);
            return $show;
        },
        _build: function () {
            var that = this,
                o = this.options;
            this.$btnAdd = this.element.closest(o.selectors.add);
            if (!Bajt.obj.is$(this.$btnAdd)) {
                this.$btnAdd = $(o.templates.btnAdd);
                this.$btnAdd
                    .changeIcon(o.single ? 'paperclip' : 'plus')
                    .addClass('ml-2')
                    .insertAfter(this.$container.find('label'));
            }
            this.$showContainer = this.element.closest(o.selectors.showContainer);
            if (!Bajt.obj.is$(this.$showContainer)) {
                this.$showContainer = $(o.templates.showContainer);
                this.$container.append(this.$showContainer);
                this.element.appendTo(this.$showContainer);
            }
            this.$statusContainer = this.$container.find(o.selectors.statusContainer);
            if (!Bajt.obj.is$(this.$statusContainer)) {
                this.$statusContainer = $(o.templates.statusContainer);
                this.$container.append(this.$stausContainer);
            }
            this.$container.find(o.selectors.field).each(function () {
                that._buildShow(this);
            });
            return this;
        },
        _createBasicControls: function () {
            this.$container = this.element.closest('.form-group');
            this.$shows = [];
            this.$fileUpload = $(this.options.selectors.fileupload);
            return this;
        },
        _createData: function () {
            this.fileUpload = this.$fileUpload.data('blueimp-fileupload') || this.$fileUpload.data('fileupload');
            this.count = this.$container.find('input').length;
            return this;
        },
        addStatus: function ($status) {
            $status.appendTo(this.$statusContainer).slideDown();
        },
        addUpload: function (data) {
            var o = this.options,
                $show,
                uploadShow;
            if (o.multiple) {
                var prototype = this.element.data('prototype');
                $show = this._buildShow(prototype.replace(/__name__/g, this.count));
                this.count++;
            } else {
                $show = this.$container.find(o.selectors.show);
            }
            uploadShow = $show.data('bajtUploadShow');
            uploadShow.fileupload(data);
            // if (o.multiple) {
            //     $show.appendTo(this.$showContainer).slideDown(function () {
            //         var st = o.autoStart;
            //         //                $btnOk.click();
            //     });
            // } else {
            //     var st = o.autoStart;
            //     //                $btnOk.click();
            // }
            return $show;
        },
        toggleProgress: function (show) { }

    }));

})(jQuery);
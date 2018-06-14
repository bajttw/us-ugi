var Bajt = {};
var B = Bajt;
(function($, B) {
    'use strict';
    $.extend(true, B, {
        getValue: function(obj, names) {
            if (B.obj.is(obj) && !$.isArray(obj)) {
                if (typeof names === 'string') {
                    return obj.hasOwnProperty(names) ? obj[names] : null;
                } else {
                    return obj.hasOwnProperty(names[0])
                        ? obj[names[0]]
                        : obj.hasOwnProperty(names[1])
                            ? obj[names[1]]
                            : null;
                }
            } else {
                return obj;
            }
        },
        checkValue: function(checked, value) {
            var val = B.getValue(checked, ['v', 'value']);
            return String(val) === String(value);
        },
        checkLimits: function(limits, value, constrain) {
            var result = null,
                _convert = function(val) {
                    if (typeof constrain === 'function') {
                        if ($.isArray(val)) {
                            return val.map(function(v) {
                                return constrain(v);
                            });
                        } else {
                            return constrain(val);
                        }
                    } else {
                        return val;
                    }
                };
            if ($.isArray(limits)) {
                for (var i = 0; i < limits.length; i++) {
                    var limit = limits[i],
                        ok;
                    if ($.isArray(limit.condition)) {
                        var ok1 = !limit.hasOwnProperty('logical') || limit.logical === 'and';
                        ok = ok1;
                        for (var j = 0; ok === ok1 && j < limit.condition.length; j++) {
                            ok = this.compareValues(limit.condition[j].c, value, _convert(limit.condition[j].v));
                        }
                    } else {
                        ok = this.compareValues(limit.condition.c, value, _convert(limit.condition.v));
                    }
                    if (ok) {
                        result = limit;
                        break;
                    }
                }
            }
            return result;
        },
        confirmationOptions: {
            rootSelector: '[data-toggle=confirmation]',
            title: 'Czy napewno?',
            btnOkLabel: 'Tak',
            btnCancelLabel: 'Nie',
            btnOkClass: 'btn-info',
            popout: true
        },
        compareValues: function(condition, val, valCheck) {
            var result = false;
            switch (condition) {
                case 'eq': // val == valCheck
                    result = val === valCheck;
                    break;
                case 'neq': // val <> valCheck
                    result = val !== valCheck;
                    break;
                case 'lt': // val < valCheck
                    result = val < valCheck;
                    break;
                case 'lte': // val <= valCheck
                    result = val <= valCheck;
                    break;
                case 'gt': // val > valCheck
                    result = val > valCheck;
                    break;
                case 'gte': // val >= valCheck
                    result = val >= valCheck;
                    break;
                case 'isNull': // val is null
                    result = val === null || val === '' || val === 0;
                    break;
                case 'isNotNull': // val is not null
                    result = val !== null && val !== '' && val !== 0;
                    break;
                case 'in':
                    result = val.indexOf(valCheck) >= 0;
                    break;
            }
            return result;
        },
        moment: function(value) {
            value = B.obj.is(value) && value.hasOwnProperty('date') ? value.date : value;
            var m = moment(value);
            return m.isValid() ? m : null;
        },
        momentRange: function(value, unit) {
            var startDate = value === 'current' ? moment().startOf(unit) : moment().subtract(value, unit + 's');
            return [startDate, moment()];
        },
        ajax: {
            send: function(params, options) {
                var that = this,
                    $form = B.obj.getValue('$form', options),
                    $submit = B.obj.getValue('$form', options, this.$submit),
                    $content = B.obj.getValue('$content', options, $form),
                    $modal = B.obj.getValue('$modal', options),
                    dataTable = B.obj.getValue('dataTable', options, this.dataTable),
                    _block = function(block) {
                        if (typeof that.block === 'function') {
                            that.block(block);
                        } else if (B.obj.is$($submit)) {
                            $submit.prop('disabled', block);
                        }
                    },
                    _hideSubmit = function() {
                        if (B.obj.is$($submit) && B.obj.getValue('hideSubmit', options)) {
                            $submit.hide();
                        }
                    },
                    _showMessages = function(message) {
                        if (typeof that.showMessages === 'function') {
                            that.showMessages(message);
                        } else if (B.obj.is$($content)) {
                            $content.find('.messages').showMessages(message);
                        }
                    },
                    _showErrors = function(errors) {
                        if (typeof that.showErrors === 'function') {
                            that.showErrors(errors);
                        } else if (B.obj.is$($content)) {
                            $content.find('.errors').showMessages(errors);
                        }
                    },
                    _state = function(state) {
                        if (typeof that.state === 'function') {
                            that.state(state);
                        } else {
                            switch (state) {
                                case 'submit':
                                    _block(true);
                                    _showErrors();
                                    _showMessages(
                                        B.obj.getValue('messages-submit', options, 'Wysyłam dane do serwera')
                                    );
                                    break;
                                case 'submitSuccess':
                                    _showMessages();
                                    _block(false);
                                    break;
                                case 'submitError':
                                    _showMessages();
                                    _block(false);
                                    break;
                            }
                        }
                    },
                    _success = function(data, textStatus, jqXHR) {
                        _state('submitSuccess');
                        if (B.obj.is$($form)) {
                            $form.trigger('submited', data);
                        } else if (B.obj.is$($content)) {
                            $content.trigger('submited', data);
                        }
                        if (dataTable) {
                            dataTable.ajax.reload();
                        }
                        if (B.obj.is$($modal) && !(data.show || data.edit)) {
                            $modal.modal('hide');
                        } else {
                            _showMessages(data.messages);
                            _hideSubmit();
                        }
                    },
                    _error = function(jqXHR, textStatus, errorThrown) {
                        _state('submitError');
                        if (typeof jqXHR.responseJSON !== 'undefined') {
                            if (jqXHR.responseJSON.hasOwnProperty('form_body')) {
                                if (B.obj.is$($form)) {
                                    $form.find('.form_body').html(jqXHR.responseJSON.form_body);
                                    $form.initFormWidgets();
                                }
                                // console.log('form_errors');
                            }
                            _showErrors(jqXHR.responseJSON.errors);
                        } else if (jqXHR.responseText) {
                            _showErrors(jqXHR.responseText);
                        } else {
                            alert(errorThrown);
                        }
                    };

                if (!B.obj.is(options)) {
                    options = {};
                }
                if (typeof params.success !== 'function') {
                    params.success = _success;
                }
                if (typeof params.error !== 'function') {
                    params.error = _error;
                }
                if (!params.hasOwnProperty('method')) {
                    params.method = 'POST';
                }
                _state('submit');
                $.ajax(params);
            }
        }
    });
})(jQuery, Bajt);

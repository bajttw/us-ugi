var keyPress = {
    getCharCode: function(e) {
        return typeof e.which === 'number' ? e.which : e.keyCode;
    },
    getSelection: function(element) {
        if (typeof element.selectionStart === 'number') {
            return {
                start: element.selectionStart,
                end: element.selectionEnd
            };
        }
        if (document.selection) {
            var selection = document.selection.createRange(),
                start,
                end;
            end = selection.text.length;
            selection.moveEnd('textedit', 1);
            start = element.value.length - selection.text.length;
            end += start;
            return { start: start, end: end };
        }
        return false;
    },
    float: function(e, data) {
        var charCode = keyPress.getCharCode(e),
            input = e.currentTarget,
            value = B.str.toFloat(input.value),
            selection = keyPress.getSelection(input),
            _end = function() {
                stopTrigger(e);
                return false;
            };
        // Firefox will trigger this even on nonprintabel chars... allow them.
        switch (charCode) {
            case 8: // Backspace
            case 13: // Backspace
            case 0: // Arrow keys, delete, etc
                return true;
            case 43: //+
                input.value = (value + 0.5).toFixed(1).replace('.', ',');
                return _end();
            case 45: //-
                if (value > 0.5) {
                    input.value = (value - 0.5).toFixed(1).replace('.', ',');
                }
                return _end();
        }
        var lastChar = String.fromCharCode(charCode);
        // Reject anything not numbers or a comma
        if (!lastChar.match('[0-9]|,')) {
            return _end();
        }
        // if(Bajt.obj.is(selection)){
        //     if(selection.end > selection.start){
        //         input.value= Bajt.str.cut(input.value, selection.start, selection.end);
        //         input.selectionStart=selection.start;
        //         input.selectionEnd=selection.start;
        //     }else if(input.value[selection.start]===','){
        //         input.selectionStart=selection.start+1;
        //         return false;
        //     }
        // }
        if (lastChar === ',') {
            var newStr = input.value;
            if (Bajt.obj.is(selection)) {
                if (selection.end === selection.start) {
                    if (input.value[selection.start] === ',') {
                        input.selectionStart = selection.start + 1;
                        return _end();
                    }
                } else {
                    newStr = Bajt.str.cut(input.value, selection.start, selection.end);
                }
            }
            if (newStr.length === 0 || newStr.indexOf(',') !== -1) {
                return _end();
            }
        }

        // // Reject comma if 1st character or if we already have one
        // if (lastChar === ',' && input.value.length === 0) {
        //     return false;
        // }
        // if (lastChar === ',' && input.value.indexOf(',') !== -1) {
        //     return false;
        // }
        // Cut off first char if 0 and we have a comma somewhere
        // if (input.value.indexOf(',') !== -1 && input.value[0] === '0') {
        //     input.value = input.value.substr(1);
        // }
        return true;
    },
    number: function(e, data) {
        var charCode = keyPress.getCharCode(e),
            value = parseInt(this.value, 10);
        if (isNaN(value)) {
            value = 0;
        }
        // Firefox will trigger this even on nonprintabel chars... allow them.
        switch (charCode) {
            case 8: // Backspace
            case 0: // Arrow keys, delete, etc
                return true;
            case 43: //+
                $(this)
                    .val(value + 1)
                    .change();
                return false;
            case 45: //-
                if (value > 1) {
                    $(this)
                        .val(value - 1)
                        .change();
                }
                return false;
        }
        var lastChar = String.fromCharCode(charCode);
        if (!lastChar.match('[0-9]')) {
            return false;
        }
        return true;
    },
    number_inc: function(e, data) {
        // var charCode = keyPress.getCharCode(e),
        var value = parseInt(this.value, 10);
        if (isNaN(value)) {
            value = 0;
        }
        switch (e.keyCode) {
            case 33: //PageUp
                $(this)
                    .val(value + 10)
                    .change();
                return false;
            case 34: //PageDown
                if (value > 10) {
                    $(this)
                        .val(value - 10)
                        .change();
                }
                return false;
        }
        return true;
    },
    navi: function(e) {
        var charCode = keyPress.getCharCode(e),
            $this = $(this);
        switch (charCode) {
            case 0: // Arrow keys, delete, etc
            case 37:
            case 38:
            case 39:
            case 40:
                if (e.keyCode >= 37 || e.keyCode <= 40) {
                    var step = 0,
                        selection;
                    if (!$this.is(':button')) {
                        selection = keyPress.getSelection(this);
                    }
                    switch (e.keyCode) {
                        case 37:
                            step = !selection || selection.start === 0 ? -1 : 0;
                            break;
                        case 38:
                            step = -2;
                            break;
                        case 39:
                            step = !selection || selection.start === this.value.length ? 1 : 0;
                            break;
                        case 40:
                            step = 2;
                            break;
                    }
                    if (step !== 0) {
                        e.preventDefault();
                        e.stopPropagation();
                        $this.trigger('navigate', {
                            step: step
                        });
                        return false;
                    }
                }
                return true;
            case 13:
                e.preventDefault();
                e.stopPropagation();
                $(this).trigger('navigate', {
                    step: 3
                });
                return false;
        }
        return true;
    }
};

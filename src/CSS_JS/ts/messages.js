var Msg = (function () {
    function Msg(message, type, data) {
        if (type === void 0) { type = 'i'; }
        this.types = {
            w: 'warning',
            e: 'danger',
            s: 'success',
            i: 'info'
        };
        this.templates = {
            container: '<div class="alert py-1 mb-1"></div>',
            header: '<div class="card-header px-2 py-1"></div>',
            content: '<div class="alert-content p-2"></div>',
            title: '<h6 class="alert-heading mb-0"></h6>',
            label: '<strong></strong>',
            msg: '<li></li>',
            msgContainer: '<ul class="list-unstyled mb-0"></ul>',
            childsContainer: '<div class="msg-childs mt-1"></div>',
            btn: ' <button type="button" class="ml-4 btn btn-sm btn-light" data-toggle="collapse">szczegóły</button>'
        };
        this.message = '';
        this.type = 'i';
        this.label = '';
        this.data = null;
        this.childs = [];
        this.$html = function (parentId, index) {
            var i, id = parentId ? parentId + '_' + (index ? index : 0) : 'msg_0', $html = this.genContainer(this.type), $title = this.genTitle(this.title, this.label).appendTo($html), $content = $(this.templates.content).appendTo($html), $msgContainer = $(this.templates.msgContainer).appendTo($content);
            if ($.isArray(this.message)) {
                for (i in this.message) {
                    $msgContainer.append(this.genMsg(this.message[i]));
                }
            }
            else {
                $msgContainer.append(this.genMsg(this.message));
            }
            if ($.isArray(this.childs) && this.childs.length > 0) {
                var $childs = $(this.templates.childsContainer)
                    .attr('id', id)
                    .appendTo($content);
                if (parentId) {
                    $title.append(this.genBtn(id, false));
                    $childs.addClass('collapse');
                }
                for (i in this.childs) {
                    this.childs[i].$html(id, i).appendTo($childs);
                }
            }
            return $html;
        };
        if (message instanceof Msg) {
            this.type = message.type;
            this.data = message.data;
            this.label = message.label;
            this.message = message.message;
            this.addChild(message.childs);
            return;
        }
        this.type = this.mapType(type);
        this.data = data;
        if ($.isArray(message)) {
            for (var i = 0, ien = message.length; i < ien; i++) {
                this.childs.push(new Msg(message[i], type));
            }
        }
        else if (typeof message === 'object') {
            for (var k in message) {
                switch (k) {
                    case 'type':
                        this.type = this.mapType(message.type);
                        break;
                    case 'childs':
                        this.addChild(message.childs);
                        break;
                    default:
                        if (this.hasOwnProperty(k)) {
                            this[k] = message[k];
                        }
                }
            }
        }
        else {
            this.message = message;
        }
    }
    Msg.prototype.mapType = function (type) {
        if (!type) {
            return 'i';
        }
        else if (this.types.hasOwnProperty(type)) {
            return type;
        }
        var typeSymbol;
        for (typeSymbol in this.types) {
            if (this.types[typeSymbol] === type) {
                return typeSymbol;
            }
        }
    };
    Msg.prototype.genTitle = function (title, label) {
        var $title = $(this.templates.title);
        if (label) {
            $title.append($(this.templates.label).append(label));
        }
        if (title) {
            $title.append(title);
        }
        return $title;
    };
    Msg.prototype.genBtn = function (id, expanded) {
        var $btn = $(this.templates.btn);
        $btn.attr('href', '#' + id).attr('aria-controls', id);
        if (expanded) {
            $btn.attr('aria-expanded', 'true');
        }
        return $btn;
    };
    Msg.prototype.genMsg = function (message, type) {
        var $msg = $(this.templates.msg).html(message);
        if (this.types.hasOwnProperty(type)) {
            $msg.addClass('text-' + this.types[type]);
        }
        return $msg;
    };
    Msg.prototype.genContainer = function (type) {
        var $container = $(this.templates.container);
        if (this.types.hasOwnProperty(type)) {
            $container.addClass('alert-' + this.types[type]);
        }
        return $container;
    };
    Msg.prototype.addChild = function (child) {
        if (typeof child === 'undefined' || child === null) {
            return;
        }
        if ($.isArray(child)) {
            for (var i = 0, ien = child.length; i < ien; i++) {
                this.childs.push(new Msg(child[i]));
            }
        }
        else {
            this.childs.push(new Msg(child));
        }
    };
    return Msg;
}());
//# sourceMappingURL=messages.js.map
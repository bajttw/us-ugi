class Msg {
    types = {
        w: 'warning',
        e: 'error',
        s: 'success',
        i: 'info'
    };
    classes = {
        w: 'warning',
        e: 'danger',
        s: 'success',
        i: 'info'
    };
    templates = {
        container: '<div class="alert py-1 mb-1"></div>',
        header: '<div class="card-header px-2 py-1"></div>',
        content: '<div class="alert-content p-2"></div>',
        title: '<h6 class="alert-heading mb-0"></h6>',
        label: '<strong></strong>',
        msg: '<li></li>',
        msgContainer: '<ul class="list-unstyled mb-0"></ul>',
        childsContainer: '<div class="msg-childs mt-1"></div>',
        btn:
            ' <button type="button" class="ml-4 btn btn-sm btn-light" data-toggle="collapse">szczegóły</button>'
    };
    message = '';
    type = 'i';
    label = '';
    title = '';
    data: any = null;
    childs: Array<Msg> = [];
    mapType(type?: string) {
        if (!type) {
            return 'i';
        } else if (this.types.hasOwnProperty(type)) {
            return type;
        }
        let typeSymbol;
        for (typeSymbol in this.types) {
            if (this.types[typeSymbol] === type) {
                return typeSymbol;
            }
        }
    }
    genTitle() {
        let $title = $(this.templates.title);
        if (this.label) {
            $title.append($(this.templates.label).append(this.label));
        }
        if (this.title) {
            $title.append(this.title);
        }
        return $title;
    }
    genBtn(id, expanded) {
        let $btn = $(this.templates.btn);
        $btn.attr('href', '#' + id).attr('aria-controls', id);
        if (expanded) {
            $btn.attr('aria-expanded', 'true');
        }
        return $btn;
    }
    genMsg(message, type) {
        let $msg = $(this.templates.msg).html(message);
        if (this.classes.hasOwnProperty(type)) {
            $msg.addClass('text-' + this.classes[type]);
        }
        return $msg;
    }
    genContainer() {
        let $container = $(this.templates.container);
        if (this.classes.hasOwnProperty(this.type)) {
            $container.addClass('alert-' + this.classes[this.type]);
        }
        return $container;
    }
    addChild(child: any) {
        if (typeof child === 'undefined' || child === null) {
            return;
        }
        if ($.isArray(child)) {
            for (let i = 0, ien = child.length; i < ien; i++) {
                this.childs.push(new Msg(child[i]));
            }
        } else {
            this.childs.push(new Msg(child));
        }
    }
    $html = function(parentId, index) {
        var i,
            id = parentId ? parentId + '_' + (index ? index : 0) : 'msg_0',
            $html = this.genContainer(),
            $title = this.genTitle().appendTo($html),
            $content = $(this.templates.content).appendTo($html),
            $msgContainer = $(this.templates.msgContainer).appendTo($content);
        if ($.isArray(this.message)) {
            for (i in this.message) {
                $msgContainer.append(this.genMsg(this.message[i]));
            }
        } else {
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
    constructor(message: any, type = 'i', data?: any) {
        if (message instanceof Msg) {
            this.type = message.type;
            this.data = message.data;
            this.label = message.label;
            this.title = message.title;
            this.message = message.message;
            this.addChild(message.childs);
            return;
        }
        this.type = this.mapType(type);
        this.data = data;
        if ($.isArray(message)) {
            for (let i = 0, ien = message.length; i < ien; i++) {
                this.childs.push(new Msg(message[i], type));
            }
        } else if (typeof message === 'object') {
            for (let k in message) {
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
        } else {
            this.message = message;
        }
    }   
}


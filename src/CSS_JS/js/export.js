



var Export = {
    labels: {
        lp: 'Lp.',
        summary: 'Łącznie',
        default: 'domyślne'
    },
    fields: {},
    _config: function(config) {
        this.config = $.extend(
            {},
            Bajt.obj.is(this.defaultConfig) ? this.defaultConfig : {},
            Bajt.obj.is(config) ? config : {}
        );
        return this.config;
    },
    /**
     * Get the file name for an exported file.
     *
     * @param {object}	config Button configuration
     * @param {boolean} incExtension Include the file name extension
     */
    _filename: function(config, incExtension) {
        // Backwards compatibility
        var filename =
            config.filename === '*' && config.title !== '*' && config.title !== undefined
                ? config.title
                : config.filename;
        if (typeof filename === 'function') {
            filename = filename();
        }
        if (filename.indexOf('*') !== -1) {
            filename = $.trim(filename.replace('*', $('title').text()));
        }
        // Strip characters which the OS will object to
        filename = filename.replace(/[^a-zA-Z0-9_\u00A1-\uFFFF\.,\-_ !\(\)]/g, '_');
        return incExtension === undefined || incExtension === true ? filename + config.extension : filename;
    },
    /**
     * Safari's data: support for creating and downloading files is really poor, so
     * various options need to be disabled in it. See
     * https://bugs.webkit.org/show_bug.cgi?id=102914
     *
     * @return {Boolean} `true` if Safari
     */
    _isSafari: function() {
        return (
            navigator.userAgent.indexOf('Safari') !== -1 &&
            navigator.userAgent.indexOf('Chrome') === -1 &&
            navigator.userAgent.indexOf('Opera') === -1
        );
    },
    /**
     * Get the newline character(s)
     *
     * @param {object}	config Button configuration
     * @return {string}				Newline character
     */
    _newLine: function(config) {
        return config.newline ? config.newline : navigator.userAgent.match(/Windows/) ? '\r\n' : '\n';
    },
    _saveAs: (function(view) {
        'use strict';
        // IE <10 is explicitly unsupported
        if (typeof navigator !== 'undefined' && /MSIE [1-9]\./.test(navigator.userAgent)) {
            return;
        }
        var doc = view.document,
            // only get URL when necessary in case Blob.js hasn't overridden it yet
            get_URL = function() {
                return view.URL || view.webkitURL || view;
            },
            save_link = doc.createElementNS('http://www.w3.org/1999/xhtml', 'a'),
            can_use_save_link = 'download' in save_link,
            click = function(node) {
                var event = new MouseEvent('click');
                node.dispatchEvent(event);
            },
            is_safari = /Version\/[\d\.]+.*Safari/.test(navigator.userAgent),
            webkit_req_fs = view.webkitRequestFileSystem,
            req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem,
            throw_outside = function(ex) {
                (view.setImmediate || view.setTimeout)(function() {
                    throw ex;
                }, 0);
            },
            force_saveable_type = 'application/octet-stream',
            fs_min_size = 0,
            // the Blob API is fundamentally broken as there is no "downloadfinished" event to subscribe to
            arbitrary_revoke_timeout = 1000 * 40, // in ms
            revoke = function(file) {
                var revoker = function() {
                    if (typeof file === 'string') {
                        // file is an object URL
                        get_URL().revokeObjectURL(file);
                    } else {
                        // file is a File
                        file.remove();
                    }
                };
                /* // Take note W3C:
				var
				  uri = typeof file === "string" ? file : file.toURL()
				, revoker = function(evt) {
					// idealy DownloadFinishedEvent.data would be the URL requested
					if (evt.data === uri) {
						if (typeof file === "string") { // file is an object URL
							get_URL().revokeObjectURL(file);
						} else { // file is a File
							file.remove();
						}
					}
				}
				;
				view.addEventListener("downloadfinished", revoker);
				*/
                setTimeout(revoker, arbitrary_revoke_timeout);
            },
            dispatch = function(filesaver, event_types, event) {
                event_types = [].concat(event_types);
                var i = event_types.length;
                while (i--) {
                    var listener = filesaver['on' + event_types[i]];
                    if (typeof listener === 'function') {
                        try {
                            listener.call(filesaver, event || filesaver);
                        } catch (ex) {
                            throw_outside(ex);
                        }
                    }
                }
            },
            auto_bom = function(blob) {
                // prepend BOM for UTF-8 XML and text/* types (including HTML)
                if (/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
                    return new Blob(['\ufeff', blob], {
                        type: blob.type
                    });
                }
                return blob;
            },
            FileSaver = function(blob, name, no_auto_bom) {
                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                // First try a.download, then web filesystem, then object URLs
                var filesaver = this,
                    type = blob.type,
                    blob_changed = false,
                    object_url,
                    target_view,
                    dispatch_all = function() {
                        dispatch(filesaver, 'writestart progress write writeend'.split(' '));
                    },
                    // on any filesys errors revert to saving with object URLs
                    fs_error = function() {
                        if (target_view && is_safari && typeof FileReader !== 'undefined') {
                            // Safari doesn't allow downloading of blob urls
                            var reader = new FileReader();
                            reader.onloadend = function() {
                                var base64Data = reader.result;
                                target_view.location.href =
                                    'data:attachment/file' + base64Data.slice(base64Data.search(/[,;]/));
                                filesaver.readyState = filesaver.DONE;
                                dispatch_all();
                            };
                            reader.readAsDataURL(blob);
                            filesaver.readyState = filesaver.INIT;
                            return;
                        }
                        // don't create more object URLs than needed
                        if (blob_changed || !object_url) {
                            object_url = get_URL().createObjectURL(blob);
                        }
                        if (target_view) {
                            target_view.location.href = object_url;
                        } else {
                            var new_tab = view.open(object_url, '_blank');
                            if (new_tab === undefined && is_safari) {
                                //Apple do not allow window.open, see http://bit.ly/1kZffRI
                                view.location.href = object_url;
                            }
                        }
                        filesaver.readyState = filesaver.DONE;
                        dispatch_all();
                        revoke(object_url);
                    },
                    abortable = function(func) {
                        return function() {
                            if (filesaver.readyState !== filesaver.DONE) {
                                return func.apply(this, arguments);
                            }
                        };
                    },
                    create_if_not_found = {
                        create: true,
                        exclusive: false
                    },
                    slice;
                filesaver.readyState = filesaver.INIT;
                if (!name) {
                    name = 'download';
                }
                if (can_use_save_link) {
                    object_url = get_URL().createObjectURL(blob);
                    setTimeout(function() {
                        save_link.href = object_url;
                        save_link.download = name;
                        click(save_link);
                        dispatch_all();
                        revoke(object_url);
                        filesaver.readyState = filesaver.DONE;
                    });
                    return;
                }
                // Object and web filesystem URLs have a problem saving in Google Chrome when
                // viewed in a tab, so I force save with application/octet-stream
                // http://code.google.com/p/chromium/issues/detail?id=91158
                // Update: Google errantly closed 91158, I submitted it again:
                // https://code.google.com/p/chromium/issues/detail?id=389642
                if (view.chrome && type && type !== force_saveable_type) {
                    slice = blob.slice || blob.webkitSlice;
                    blob = slice.call(blob, 0, blob.size, force_saveable_type);
                    blob_changed = true;
                }
                // Since I can't be sure that the guessed media type will trigger a download
                // in WebKit, I append .download to the filename.
                // https://bugs.webkit.org/show_bug.cgi?id=65440
                if (webkit_req_fs && name !== 'download') {
                    name += '.download';
                }
                if (type === force_saveable_type || webkit_req_fs) {
                    target_view = view;
                }
                if (!req_fs) {
                    fs_error();
                    return;
                }
                fs_min_size += blob.size;
                req_fs(
                    view.TEMPORARY,
                    fs_min_size,
                    abortable(function(fs) {
                        fs.root.getDirectory(
                            'saved',
                            create_if_not_found,
                            abortable(function(dir) {
                                var save = function() {
                                    dir.getFile(
                                        name,
                                        create_if_not_found,
                                        abortable(function(file) {
                                            file.createWriter(
                                                abortable(function(writer) {
                                                    writer.onwriteend = function(event) {
                                                        target_view.location.href = file.toURL();
                                                        filesaver.readyState = filesaver.DONE;
                                                        dispatch(filesaver, 'writeend', event);
                                                        revoke(file);
                                                    };
                                                    writer.onerror = function() {
                                                        var error = writer.error;
                                                        if (error.code !== error.ABORT_ERR) {
                                                            fs_error();
                                                        }
                                                    };
                                                    'writestart progress write abort'
                                                        .split(' ')
                                                        .forEach(function(event) {
                                                            writer['on' + event] = filesaver['on' + event];
                                                        });
                                                    writer.write(blob);
                                                    filesaver.abort = function() {
                                                        writer.abort();
                                                        filesaver.readyState = filesaver.DONE;
                                                    };
                                                    filesaver.readyState = filesaver.WRITING;
                                                }),
                                                fs_error
                                            );
                                        }),
                                        fs_error
                                    );
                                };
                                dir.getFile(
                                    name,
                                    {
                                        create: false
                                    },
                                    abortable(function(file) {
                                        // delete file if it already exists
                                        file.remove();
                                        save();
                                    }),
                                    abortable(function(ex) {
                                        if (ex.code === ex.NOT_FOUND_ERR) {
                                            save();
                                        } else {
                                            fs_error();
                                        }
                                    })
                                );
                            }),
                            fs_error
                        );
                    }),
                    fs_error
                );
            },
            FS_proto = FileSaver.prototype,
            saveAs = function(blob, name, no_auto_bom) {
                return new FileSaver(blob, name, no_auto_bom);
            };
        // IE 10+ (native saveAs)
        if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
            return function(blob, name, no_auto_bom) {
                if (!no_auto_bom) {
                    blob = auto_bom(blob);
                }
                return navigator.msSaveOrOpenBlob(blob, name || 'download');
            };
        }

        FS_proto.abort = function() {
            var filesaver = this;
            filesaver.readyState = filesaver.DONE;
            dispatch(filesaver, 'abort');
        };
        FS_proto.readyState = FS_proto.INIT = 0;
        FS_proto.WRITING = 1;
        FS_proto.DONE = 2;

        FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;

        return saveAs;
    })((typeof self !== 'undefined' && self) || (typeof window !== 'undefined' && window) || this.content),
    /**
     * Get the title for an exported file.
     *
     * @param {object} config	Button configuration
     */
    _title: function(config) {
        var title = config.title;
        if (typeof title === 'function') {
            title = title();
        }
        return title.indexOf('*') !== -1 ? title.replace('*', $('title').text() || 'Exported data') : title;
    },
    _labelFields: function(fields, entityClassName) {
        var labels = [];
        if ($.isArray(fields)) {
            for (var i = 0, ien = fields.length; i < ien; i++) {
                var name = fields[i].split('.');
                if (name.length === 1) {
                    labels.push(this._label(fields[i], entityClassName));
                } else {
                    //                    var en=validateEntityName(name[0]);
                    labels.push(this._label(name[1], name[0]));
                }
            }
        } else {
            labels = this._label(fields, entityClassName);
        }
        return labels;
    },
    _label: function(name, entityClassName) {
        return Bajt.obj.getValue([entityClassName, name], this.labels) || Bajt.obj.getValue(name, this.labels, name);
    },
    action: function(data, options) {
        var expData = null,
            config = $.extend(
                true,
                {
                    exp: options.exp,
                    exportOptions: options.eSettings.export || {}
                },
                options.config || {}
            );
        if (Bajt.obj.is(data)) {
            switch (options.ecn) {
                case 'Orders':
                    expData = Bajt.entity.fill(data, options.ecn, {
                        // checkDiff: ordersCheckParameters(data)
                    });
                    config.filename = 'zam_' + expData.number;
                    break;
                case 'Packages':
                    expData = Bajt.entity.fill(data, options.ecn, {});
                    config.filename = 'paleta_' + expData.number;
                    break;
                default:
                    expData = Bajt.entity.fill(data, options.ecn);
                    config.filename = 'pdf_' + expData.id;
            }
            switch (options.action) {
                case 'copy':
                    config.copyTextarea = options.copyTextarea;
                    break;
                case 'show':
                    config.showModal = options.showModal;
                    break;
                default:
            }
            this[options.action].action(options.$btn, expData, options.ecn, config);
        }
    },
    getConverter:function(name, entityClassName){
        if (this.converters.hasOwnProperty(entityClassName)){
            if(this.converters[entityClassName].hasOwnProperty(name)){
                return this.converters[entityClassName][name];
            }
            if(this.converters.hasOwnProperty(name)){
                return this.converters[name];
            }
            if(this.converters[entityClassName].hasOwnProperty('generic')){
                return this.converters[entityClassName].generic;
            }
        }
        if(this.converters.hasOwnProperty(name)){
            return this.converters[name];
        }
        return this.converters.generic;
    },
    convertField: function(value, name, options) {
        var val,
            convert = Export.getConverter.call(this, name, B.obj.getValue('ecn', options, this.ecn ));
            // B.obj.getValue(name, this, Export.pdf.converters.generic);
        if (Bajt.obj.is(value) && value.hasOwnProperty('Value')) {
            if (Bajt.obj.is(options)) {
                options.diff = value.diff;
            } else {
                options = { diff: value.diff };
            }
            value = value.Value;
        }
        if (typeof convert === 'function') {
            val = convert(value, name, options);
        }
        return typeof val !== 'undefined' ? val : typeof value === 'string' ? value : 'convert_error';
    },
    convertFields: function(data, fields, convert, convertOptions) {
        var result = [],
            caller = Bajt.obj.getValue('caller', convertOptions, this);
        if(typeof convert !== 'function'){
            convert = Export.convertField;
        }
        if (Bajt.obj.is(convertOptions)) {
            convertOptions.data = data;
        } else {
            convertOptions = { data: data };
        }
        if (typeof fields === 'string') {
            fields = [fields];
        }
        for (var k in fields) {
            if (typeof convert === 'function') {
                result.push(convert.call(caller, data[fields[k]], fields[k], convertOptions));
            } else {
                result.push(B.obj.getValue(fields[k], data, ''));
            }
        }
        return result;
    }
};

Export.xls = {
    defaultConfig: {
        filename: '*',
        extension: '.xlsx',
        exportOptions: {}
    },
    // _convertField: function (value, name, options) {
    // 	var val, diff;
    // 	if (Bajt.obj.is(value) && value.hasOwnProperty('Value') ) {
    // 		diff = value.diff;
    // 		value = value.Value;
    // 	}
    // 	if(typeof this.converters[name] === 'function')
    // 		val=this.converters[name](value, diff);
    // 	else if(typeof this.converters.generic === 'function'){
    // 		val=this.converters.generic(value, diff);
    // 	}else{
    // 		switch (name) {
    // 			case 'model':
    // 			case 'handle':
    // 			case 'size':
    // 			case 'cutter':
    // 			case 'doubleSide':
    // 				if (diff)
    // 					val = '* ' + value + ' *';
    // 				break;
    // 			case 'length':
    // 			case 'width':
    // 			case 'quantity':
    // 				val = value.toString();
    // 				break;
    // 			case 'area':
    // 				val = value.toFixed(3);
    // 				break;
    // 		}

    // 	}
    // 	return (typeof val !== 'undefined') ? val : value;
    // },
    _excelStrings: {
        // Excel - Pre-defined strings to build a basic XLSX file
        '_rels/.rels':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
            '</Relationships>',

        'xl/_rels/workbook.xml.rels':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
            '</Relationships>',

        '[Content_Types].xml':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
            '<Default Extension="xml" ContentType="application/xml" />' +
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />' +
            '<Default Extension="jpeg" ContentType="image/jpeg" />' +
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml" />' +
            '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml" />' +
            '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml" />' +
            '</Types>',

        'xl/workbook.xml':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
            '<fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="24816"/>' +
            '<workbookPr showInkAnnotation="0" autoCompressPictures="0"/>' +
            '<bookViews>' +
            '<workbookView xWindow="0" yWindow="0" windowWidth="25600" windowHeight="19020" tabRatio="500"/>' +
            '</bookViews>' +
            '<sheets>' +
            '<sheet name="" sheetId="1" r:id="rId1"/>' +
            '</sheets>' +
            '</workbook>',

        'xl/worksheets/sheet1.xml':
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
            '<sheetData/>' +
            '</worksheet>',

        'xl/styles.xml':
            '<?xml version="1.0" encoding="UTF-8"?>' +
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac">' +
            '<fonts count="5" x14ac:knownFonts="1">' +
            '<font>' +
            '<sz val="11" />' +
            '<name val="Calibri" />' +
            '</font>' +
            '<font>' +
            '<sz val="11" />' +
            '<name val="Calibri" />' +
            '<color rgb="FFFFFFFF" />' +
            '</font>' +
            '<font>' +
            '<sz val="11" />' +
            '<name val="Calibri" />' +
            '<b />' +
            '</font>' +
            '<font>' +
            '<sz val="11" />' +
            '<name val="Calibri" />' +
            '<i />' +
            '</font>' +
            '<font>' +
            '<sz val="11" />' +
            '<name val="Calibri" />' +
            '<u />' +
            '</font>' +
            '</fonts>' +
            '<fills count="6">' +
            '<fill>' +
            '<patternFill patternType="none" />' +
            '</fill>' +
            '<fill/>' + // Excel appears to use this as a dotted background regardless of values
            '<fill>' +
            '<patternFill patternType="solid">' +
            '<fgColor rgb="FFD9D9D9" />' +
            '<bgColor indexed="64" />' +
            '</patternFill>' +
            '</fill>' +
            '<fill>' +
            '<patternFill patternType="solid">' +
            '<fgColor rgb="FFD99795" />' +
            '<bgColor indexed="64" />' +
            '</patternFill>' +
            '</fill>' +
            '<fill>' +
            '<patternFill patternType="solid">' +
            '<fgColor rgb="ffc6efce" />' +
            '<bgColor indexed="64" />' +
            '</patternFill>' +
            '</fill>' +
            '<fill>' +
            '<patternFill patternType="solid">' +
            '<fgColor rgb="ffc6cfef" />' +
            '<bgColor indexed="64" />' +
            '</patternFill>' +
            '</fill>' +
            '</fills>' +
            '<borders count="2">' +
            '<border>' +
            '<left />' +
            '<right />' +
            '<top />' +
            '<bottom />' +
            '<diagonal />' +
            '</border>' +
            '<border diagonalUp="false" diagonalDown="false">' +
            '<left style="thin">' +
            '<color auto="1" />' +
            '</left>' +
            '<right style="thin">' +
            '<color auto="1" />' +
            '</right>' +
            '<top style="thin">' +
            '<color auto="1" />' +
            '</top>' +
            '<bottom style="thin">' +
            '<color auto="1" />' +
            '</bottom>' +
            '<diagonal />' +
            '</border>' +
            '</borders>' +
            '<cellStyleXfs count="1">' +
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" />' +
            '</cellStyleXfs>' +
            '<cellXfs count="56">' +
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="2" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="4" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="5" borderId="0" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="0" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="2" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="3" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="4" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="1" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="2" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="3" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="4" fillId="5" borderId="1" applyFont="1" applyFill="1" applyBorder="1"/>' +
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
            '<alignment horizontal="left"/>' +
            '</xf>' +
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
            '<alignment horizontal="center"/>' +
            '</xf>' +
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
            '<alignment horizontal="right"/>' +
            '</xf>' +
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
            '<alignment horizontal="fill"/>' +
            '</xf>' +
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
            '<alignment textRotation="90"/>' +
            '</xf>' +
            '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" applyFont="1" applyFill="1" applyBorder="1" xfId="0" applyAlignment="1">' +
            '<alignment wrapText="1"/>' +
            '</xf>' +
            '</cellXfs>' +
            '<cellStyles count="1">' +
            '<cellStyle name="Normal" xfId="0" builtinId="0" />' +
            '</cellStyles>' +
            '<dxfs count="0" />' +
            '<tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleMedium4" />' +
            '</styleSheet>'
    },
    _serialiser: new XMLSerializer(),
    _ieExcel: undefined,
    /**
     * Create an XML node and add any children, attributes, etc without needing to
     * be verbose in the DOM.
     *
     * @param  {object} doc      XML document
     * @param  {string} nodeName Node name
     * @param  {object} opts     Options - can be `attr` (attributes), `children`
     *   (child nodes) and `text` (text content)
     * @return {node}            Created node
     */
    _createNode: function(nodeName, opts) {
        var tempNode = this.rels.createElement(nodeName);
        if (opts) {
            if (opts.attr) {
                $(tempNode).attr(opts.attr);
            }

            if (opts.children) {
                $.each(opts.children, function(key, value) {
                    tempNode.appendChild(value);
                });
            }

            if (opts.text) {
                tempNode.appendChild(this.rels.createTextNode(opts.text));
            }
        }
        return tempNode;
    },
    /**
     * Convert from numeric position to letter for column names in Excel
     * @param  {int} n Column number
     * @return {string} Column letter(s) name
     */
    _createCellPos: function(n) {
        var ordA = 'A'.charCodeAt(0);
        var ordZ = 'Z'.charCodeAt(0);
        var len = ordZ - ordA + 1;
        var s = '';

        while (n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }

        return s;
    },
    /**
     * Get the sheet name for Excel exports.
     *
     */
    _sheetName: function() {
        var name = 'Sheet1';
        if (this.config.sheetName) {
            name = this.config.sheetName.replace(/[\[\]\*\/\\\?\:]/g, '');
        }
        return name;
    },
    /**
     * Get the width for an Excel column based on the contents of that column
     * @param  {object} data Data for export
     * @param  {int}    col  Column index
     * @return {int}         Column width
     */
    _colWidth: function(data, col) {
        var max = data.header[col].length;
        var len;
        if (data.footer && data.footer[col].length > max) {
            max = data.footer[col].length;
        }
        for (var i = 0, ien = data.body.length; i < ien; i++) {
            len = data.body[i][col].toString().length;

            if (len > max) {
                max = len;
            }

            // Max width rather than having potentially massive column widths
            if (max > 40) {
                break;
            }
        }

        // And a min width
        return max > 5 ? max : 5;
    },
    _getXml: function(type) {
        var str = this._excelStrings[type];
        //str = str.replace( /xmlns:/g, 'xmlns_' ).replace( /mc:/g, 'mc_' );
        return $.parseXML(str);
        //			return $.parseXML( str );
    },
    _cell: function(cellData, opt) {
        var cellNode, rowNode, cellIndex, rowIndex, cellId;
        if (Bajt.obj.is(opt)) {
            cellIndex = typeof opt.cellIndex === 'number' ? opt.cellIndex : this.current.cell.idx + 1;
            rowIndex = typeof opt.rowIndex === 'number' ? opt.rowIndex : this.current.row.idx;
        } else if (typeof opt === 'number') {
            cellIndex = opt;
        }
        if (typeof cellIndex !== 'number') {
            cellIndex = this.current.cell.idx + 1;
        }
        if (typeof rowIndex !== 'number') {
            rowIndex = this.current.row.idx;
        }
        cellId = this._createCellPos(cellIndex) + rowIndex;

        if (cellData === null || cellData === undefined) {
            cellData = '';
        }
        // Detect numbers - don't match numbers with leading zeros or a negative
        // anywhere but the start
        if (
            typeof cellData === 'number' ||
            (cellData.match && $.trim(cellData).match(/^-?\d+(\.\d+)?$/) && !$.trim(cellData).match(/^0\d+/))
        ) {
            cellNode = this._createNode('c', {
                attr: {
                    t: 'n',
                    r: cellId
                },
                children: [
                    this._createNode('v', {
                        text: cellData
                    })
                ]
            });
        } else {
            // Replace non standard characters for text output
            var text = !cellData.replace ? cellData : cellData.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
            cellNode = this._createNode('c', {
                attr: {
                    t: 'inlineStr',
                    r: cellId
                },
                children: {
                    row: this._createNode('is', {
                        children: {
                            row: this._createNode('t', {
                                text: text
                            })
                        }
                    })
                }
            });
        }

        if (!this.doc[rowIndex]) {
            this._row(rowIndex);
        }
        this.doc[rowIndex].cells[cellIndex] = cellNode;
        this.current.cell.node = cellNode;
        this.current.cell.id = cellIndex;
        return cellNode;
    },
    _row: function(rowIndex) {
        var rowNode;
        if (typeof rowIndex !== 'number') {
            rowIndex = this.current.row.idx;
        }
        if (this.doc[rowIndex]) {
            rowNode = this.doc[rowIndex];
        } else {
            rowNode = this._createNode('row', {
                attr: {
                    r: rowIndex
                }
            });
            this.doc[rowIndex] = {
                node: rowNode,
                cells: {}
            };
        }
        this.current.row.node = rowNode;
        this.current.row.idx = rowIndex;
        return rowNode;
    },
    blockData:function(data, options ){
        var i, 
            that=this,
            cellIndex =Bajt.obj.getValue('cellIndex', options),
            rowIndex =Bajt.obj.getValue('rowIndex', options),
            direction=Bajt.obj.getValue('direction', options, 'columns'),
            fields=Bajt.obj.getValue('fields', options),
            _cell=function(cellData){
                that._cell(cellData, {cellIndex: cellIndex, rowIndex: rowIndex });
                if(direction=== 'columns'){
                    cellIndex++;
                }else{
                    rowIndex++;
                }
            };
        if(Bajt.obj.is(fields)){
            for(i in fields){
                _cell(Bajt.obj.getValue(fields[i], data, ''));
            }
        }else{
            for(i in data){
                _cell(data[i]);
            }
        }
    },
    /**
     * Recursively add XML files from an object's structure to a ZIP file. This
     * allows the XSLX file to be easily defined with an object's structure matching
     * the files structure.
     *
     * @param {JSZip} zip ZIP package
     * @param {object} obj Object to add (recursive)
     */
    addToZip: function(zip, obj) {
        var that = this;
        if (this._ieExcel === undefined) {
            // Detect if we are dealing with IE's _awful_ serialiser by seeing if it
            // drop attributes
            this._ieExcel =
                this._serialiser
                    .serializeToString($.parseXML(this._excelStrings['xl/worksheets/sheet1.xml']))
                    .indexOf('xmlns:r') === -1;
        }
        $.each(obj, function(name, val) {
            if ($.isPlainObject(val)) {
                var newDir = zip.folder(name);
                that.addToZip(newDir, val);
            } else {
                if (that._ieExcel) {
                    // IE's XML serialiser will drop some name space attributes from
                    // from the root node, so we need to save them. Do this by
                    // replacing the namespace nodes with a regular attribute that
                    // we convert back when serialised. Edge does not have this
                    // issue
                    var worksheet = val.childNodes[0];
                    var i, ien;
                    var attrs = [];

                    for (i = worksheet.attributes.length - 1; i >= 0; i--) {
                        var attrName = worksheet.attributes[i].nodeName;
                        var attrValue = worksheet.attributes[i].nodeValue;

                        if (attrName.indexOf(':') !== -1) {
                            attrs.push({
                                name: attrName,
                                value: attrValue
                            });

                            worksheet.removeAttribute(attrName);
                        }
                    }

                    for (i = 0, ien = attrs.length; i < ien; i++) {
                        var attr = val.createAttribute(attrs[i].name.replace(':', '_dt_b_namespace_token_'));
                        attr.value = attrs[i].value;
                        worksheet.setAttributeNode(attr);
                    }
                }

                var str = that._serialiser.serializeToString(val);

                // Fix IE's XML
                if (that._ieExcel) {
                    // IE doesn't include the XML declaration
                    if (str.indexOf('<?xml') === -1) {
                        str = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + str;
                    }

                    // Return namespace attributes to being as such
                    str = str.replace(/_dt_b_namespace_token_/g, ':');
                }

                // Both IE and Edge will put empty name space attributes onto the
                // rows and columns making them useless
                str = str.replace(/<row xmlns="" /g, '<row ').replace(/<cols xmlns="">/g, '<cols>');

                zip.file(name, str);
            }
        });
    },
    converters: {
        toInt: function(value, diff) {
            return parseInt(value, 10);
        },
        generic: function(value, diff) {
            return value;
        },
        validateBarcode:function(value){
            if(typeof value === 'string'){
                return value.replace(/\s+$/, '').replace(/[^a-zA-Z0-9_-\u00A1-\uFFFF!\(\)]/g, '_');
            }
            return '';
        }
    },
    generators: {
        title: function(title) {
            Export.xls._cell(title);
        }
    },
    generate: function() {
        this.rels = this._getXml('xl/worksheets/sheet1.xml');
        var relsGet = this.rels.getElementsByTagName('sheetData')[0],
            xlsx = {
                _rels: {
                    '.rels': this._getXml('_rels/.rels')
                },
                xl: {
                    _rels: {
                        'workbook.xml.rels': this._getXml('xl/_rels/workbook.xml.rels')
                    },
                    'workbook.xml': this._getXml('xl/workbook.xml'),
                    'styles.xml': this._getXml('xl/styles.xml'),
                    worksheets: {
                        'sheet1.xml': this.rels
                    }
                },
                '[Content_Types].xml': this._getXml('[Content_Types].xml')
            };
        $('sheets sheet', xlsx.xl['workbook.xml']).attr('name', this._sheetName());
        this.doc = {};
        this.current = {
            sheet: {
                node: null,
                idx: 1
            },
            row: {
                node: null,
                idx: 1
            },
            cell: {
                node: null,
                idx: 0
            }
        };
        this.generators[this.ecn].generate(this);
        for (var ir in this.doc) {
            var rowNode = this.doc[ir].node,
                cells = this.doc[ir].cells;
            for (var ic in cells) {
                rowNode.appendChild(cells[ic]);
            }
            relsGet.appendChild(rowNode);
        }
        return xlsx;
    },
    action: function($btn, data, entityClassName, config) {
        Export._config.call(this, config);
        this.data = data;
        this.ecn = entityClassName;

        var jszip = window.JSZip;
        var zip = new jszip();
        var zipConfig = {
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        };
        this.addToZip(zip, this.generate());
        //!!!!!!!!!!!!!!!!! zrobić generator nazwy pliku ?
        if (this.config.filename === '*' || this.config.filename === '') {
            this.config.filename = 'zam_' + data.number;
        }

        if (zip.generateAsync) {
            // JSZip 3+
            zip.generateAsync(zipConfig).then(function(blob) {
                Export._saveAs(blob, Export._filename(this.config));
            });
        } else {
            // JSZip 2.5
            Export._saveAs(zip.generate(zipConfig), Export._filename(this.config));
        }
    }
};

Export.pdf = {
    defaultConfig: {
        filename: '*',
        extension: '.pdf',
        exportOptions: {
            //                        header: true,
            //                        footer: false
        },
        header: true,
        footer: false,
        message: null,
        customize: null,
        download: 'download'
    },
    _pdfMake: function() {
        return typeof pdfmake !== 'undefined' || window.pdfMake;
    },
    emptyDoc: {
        orientation: 'portrait',
        pageSize: 'A4',
        pageMargins: [10, 15, 10, 15],
        content: [],
        styles: {
            diff: {
                bold: true,
                fillColor: 'silver'
            },
            tableDefault: {
                margin: [0, 5, 0, 0]
            },
            tableLackers: {
                fontSize: 8
            },
            tableHeader: {
                bold: true,
                fillColor: '#f3f3f3'
            },
            rowSpecial: {
                bold: true,
                fontSize: 11,
                fillColor: 'silver'
            },
            bold: {
                bold: true
            },
            comment: {
                italic: true
            },
            rowEven: {},
            rowOdd: {
                //                                            fillColor: '#f3f3f3'
            },
            tablePosComments: {
                fontSize: 10,
                italic: true
            },
            tableFooter: {
                bold: true,
                fontSize: 12,
                color: 'white',
                fillColor: '#2d4154'
            },
            justify: {
                alignment: 'justify'
            },
            title: {
                alignment: 'center',
                fontSize: 15,
                bold: true,
                margin: [0, 5]
            },
            indent: {
                margin: [5, 0, 0, 0]
            },
            small: {
                fontSize: 9
            },
            h1: {
                alignment: 'left',
                bold: true,
                fontSize: 15,
                margin: [0, 5]
            },
            h2: {
                alignment: 'left',
                bold: true,
                fontSize: 12,
                margin: [0, 3]
            },
            h3: {
                alignment: 'left',
                bold: true,
                fontSize: 11,
                margin: [0, 3]
            },
            h: {
                alignment: 'left',
                bold: true,
                margin: [0, 3]
            },
            message: {}
        },
        defaultStyle: {
            fontSize: 11,
            alignment: 'center'
        }
    },
    config: {
        filename: '*',
        extension: '.pdf',
        exportOptions: {
            //                        header: true,
            //                        footer: false
        },
        header: true,
        footer: false,
        message: null,
        customize: null,
        download: 'download'
    },
    widths: {
        default: {
            lp: 15
        }
    },
    converters: {
        generic: function(value, name, options) {
            return value !== undefined ? value.toString() : '';
        },
        int: function(value, name, options) {
            return value.toString();
        },
        float: function(value, name, options) {
            return Bajt.str.fixed(value, Bajt.obj.getValue('precision', options, 3));
        },
        area: function(value, name, options) {
            return Bajt.str.fixed(value, 3);
        },
        price: function(value, name, options) {
            return Bajt.str.fixed(value, 2) + ' zł';
        },
        priceBrutto : function(value, name, options) {
            return Export.pdf.converters.price(B.str.toFloat(value) * 1.23, name, options);
        }
    },
    _cellsWidth: function(fields, tableName) {
        var widths = [];
        if (tableName === undefined) {
            tableName = 'default';
        }
        for (var i = 0, ien = fields.length; i < ien; i++) {
            widths.push(Bajt.obj.getValue([tableName, fields[i]], this.widths, 'auto'));
        }
        return widths;
    },
    _fillEmptyCells: function(row, count) {
        for (var i = 0; i < count; i++) {
            row.push('');
        }
        return row;
    },
    _rowStyle: function(rowData, style) {
        return $.map(rowData, function(cell) {
            if (Bajt.obj.is(cell)) {
                var oldStyle = $.isArray(cell['style']) ? cell['style'] : [cell['style']];
                cell['style'] = oldStyle.concat($.isArray(style) ? style : [style]);
            } else {
                cell = {
                    text: cell,
                    style: style
                };
            }
            return cell;
        });
    },
    _rowStripped: function(rowIndex, rowData, strippedStyles) {
        return this._rowStyle(rowData, strippedStyles[rowIndex % 2 ? 1 : 0]);
    },
    _styleText: function(text, style) {
        return typeof style === 'string'
            ? {
                  text: text,
                  style: style
              }
            : text;
    },
    _addPrefix: function(text, prefix) {
        return typeof text === 'string' && typeof prefix === 'string' ? prefix + text : text;
    },
    _addSufix: function(text, sufix) {
        return typeof text === 'string' && typeof sufix === 'string' ? text + sufix : text;
    },
    _table: function(rows, options) {
        var body = [],
            tab = {
                table: {
                    headerRows: 1
                }
            };
        if (!Bajt.obj.is(options)) {
            options = {};
        }
        if (Bajt.obj.is(options.options)) {
            $.extend(true, tab, options.options);
        }
        if (options.header) {
            body.push(
                $.map(options.header, function(val) {
                    return {
                        text: val,
                        style: 'tableHeader'
                    };
                })
            );
        }
        if (options.stripped) {
            var i, ien, stripped;
            if ($.isArray(options.stripped)) {
                stripped = typeof options.stripped === 'string' ? ['rowOdd', options.stripped] : ['rowEven', 'rowOdd'];
            } else {
                stripped = options.stripped;
            }
            for (i = 0, ien = rows.length; i < ien; i++) {
                body.push(this._rowStripped(i, rows[i], stripped));
            }
        } else {
            for (i = 0, ien = rows.length; i < ien; i++) {
                body.push(rows[i]);
            }
        }
        if (options.footer) {
            body.push(options.footer);
        }
        tab.table.body = body;
        return tab;
    },
    generators: {
        header: function(title) {
            return {
                text: title || 'nagłówek',
                style: 'title'
            };
        }
    },
    generate: function(generator, exportOptions) {
        var doc = $.extend(
            true,
            {},
            this.emptyDoc,
            Bajt.obj.is(generator.doc) ? generator.doc : {},
            Bajt.obj.is(this.config.doc) ? this.config.doc : {}
        );

        doc.content = generator.generate(this, exportOptions);

        if (this.config.message) {
            doc.content.unshift({
                text:
                    typeof this.config.message === 'function'
                        ? this.config.message($btn, data, this.config)
                        : this.config.message,
                style: 'message',
                margin: [0, 0, 0, 12]
            });
        }
        return doc;
    },
    action: function($btn, data, entityClassName, config) {
        Export._config.call(this, config);
        this.data = data;
        this.ecn = entityClassName;
        this.newLine = Export._newLine(this.config.exportOptions);
        var that = this,
            gen = this.generators[entityClassName],
            opt = this.config.exportOptions;

        if (Bajt.obj.is(this.config) && this.config.hasOwnProperty('exp')) {
            if (gen.hasOwnProperty(this.config.exp)) {
                gen = gen[this.config.exp];
            }
            if (opt.hasOwnProperty(this.config.exp)) {
                opt = opt[this.config.exp];
            }
        }

        if (this.config.filename === '*' || this.config.filename === '') {
            this.config.filename = 'zam_' + this.data.number;
        }
        var pdf = this._pdfMake().createPdf(this.generate(gen, opt));
        if (this.config.download === 'open' && !Export._isSafari()) {
            pdf.open();
        } else {
            pdf.getBuffer(function(buffer) {
                var blob = new Blob([buffer], {
                    type: 'application/pdf'
                });
                Export._saveAs(blob, Export._filename(that.config, 'pdf'));
            });
        }
    }
};

Export.copy = {
    action: function($btn, data, entityClassName, config) {
        var $textarea = $(config.copyTextarea);
        $textarea.copyTextarea('export', data);
    }
};

(function($) {
    $.fn.dtBtnAction = function() {
        var $btn = $(this),
            $row = $btn.closest('tr'),
            $table = $row.closest('table'),
            table = $table.DataTable(),
            row = table.row($row),
            rowData = row.data(),
            eData = null,
            ot = table.settings()[0].oInit,
            eSettings = Bajt.obj.is(ot.entitySettings) ? ot.entitySettings : Bajt.getEntitySettings(ot.ecn),
            o = {
                $btn: $btn,
                action: $btn.data('action') || 'copy',
                exp: $btn.data('exp'),
                eSettings: eSettings,
                ecn: eSettings.ecn,
                en: eSettings.en,
                config: {}
            };
        o.copyTextarea = ot.copyTextarea || '#' + o.en + '_exp_copy';
        o.showModal = ot.showModal || '#' + o.en + '_show_modal';
        switch (o.ecn) {
            case 'Orders':
                if (o.details) {
                    eData = rowData;
                }
                break;
        }
        if (eData) {
            Export.action(eData, o);
        } else {
            var param = {},
                eUrls = ot.entityUrls,
                $modal = $('#my_modal'),
                $modalContent = $modal.find('.modal-content'),
                url = eUrls[o.action] || eUrls.data;
            url = isSet(url) ? url.replace('__id__', rowData.id) : $btn.data('url');
            $.ajax({
                type: 'POST',
                url: url,
                data: param || {}
            })
                .done(function(data) {
                    if (Bajt.obj.is(data.entity)) {
                        Export.action(data.entity, o);
                    } else if (data.messages) {
                        $modalContent.showMessages(data.messages);
                        $modal.modal('show');
                    } else {
                        alert('Błąd - brak danych z serwera');
                    }
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    if (typeof jqXHR.responseJSON !== 'undefined') {
                        $modalContent.showMessages(jqXHR.responseJSON.errors);
                        $modal.modal('show');
                    } else if (jqXHR.responseText) {
                        $modalContent.html(jqXHR.responseText);
                        $modal.modal('show');
                    } else {
                        alert(errorThrown);
                    }
                });
        }
    };

    $.fn.initExpBtns = function(options) {
        var $this = $(this),
            ecn = $this.data('ecn'),
            eSettings = Bajt.obj.is(options.entitySettings) ? options.entitySettings : Bajt.getEntitySettings(ecn),
            en = eSettings.en,
            copyTextarea = options.copyTextarea || '#' + en + '_exp_copy';
        $(copyTextarea).initCopyTextarea({
            entitySettings: eSettings
        });
        $this.find('[data-exp]').each(function(idx, btn) {
            var $btn = $(btn),
                o = {
                    $btn: $btn,
                    action: $btn.data('action') || 'copy',
                    exp: $btn.data('exp'),
                    eSettings: eSettings,
                    ecn: ecn,
                    en: en,
                    copyTextarea: copyTextarea,
                    config: {}
                };
            $btn.click(function() {
                Export.action($this.data('entity-data'), o);
            });
        });
    };

    $.fn.toggleExpBtns = function(show) {
        if (show === undefined) {
            show = Bajt.obj.is(this.data('entity-data'));
        }
        if (show) {
            this.find('.btn[data-exp]').show();
        } else {
            this.find('.btn[data-exp]').hide();
        }
    };
})(jQuery);

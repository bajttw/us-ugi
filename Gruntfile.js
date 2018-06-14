/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function(grunt) {
    // Project configuration.
    var projectPath = 'src/';
    var webPath = 'web/bundles/';
    var bundlePath = function(type, name) {
        var n = name ? name.toLowerCase() : '',
            path = '';
        switch (type) {
            case 'src':
                path = projectPath + (n.length > 0 ? n.charAt(0).toUpperCase() + n.slice(1) + 'Bundle/' : '');
                break;
            case 'web':
                path = webPath + (n.length > 0 ? n + '/' : '');
                break;
            case 'public':
                path = (n.length > 0 ? bundlePath('src', n) : 'app/') + 'Resources/public/';
                break;
            case 'CSS_JS':
                path = bundlePath('src', n) + 'CSS_JS/';
                break;
            case 'dist':
                path = bundlePath('CSS_JS', n) + 'dist/';
                break;
        }
        return path;
    };
    var pathTypes = ['src', 'web', 'public', 'CSS_JS', 'dist'];
    var bundles = ['', 'app'];
    var paths = {};
    for (var i = 0, ien = bundles.length; i < ien; i++) {
        var p = paths;
        if (bundles[i].length > 0) {
            paths[bundles[i]] = {};
            p = paths[bundles[i]];
        }
        for (var j = 0, jen = pathTypes.length; j < jen; j++) {
            p[pathTypes[j]] = bundlePath(pathTypes[j], bundles[i]);
        }
    }
    var src_js = (function(p, files) {
        var fjs = [];
        for (var i = 0; i < files.length; i++) {
            fjs.push(p + 'js/' + files[i] + '.js');
        }
        return fjs;
    })(paths.CSS_JS, [
        'variables',
        'utilities',
        'bajt/main',
        'bajt/utils/settings',
        'bajt/utils/strings',
        'bajt/utils/objects',
        'bajt/utils/jsons',
        'bajt/utils/dictionaries',
        'bajt/utils/urls',
        'bajt/utils/html',
        'bajt/utils/messages',
        'bajt/events/basicevents',
        'bajt/events/keypress',
        'bajt/events/forms',
        'bajt/events/modals',
        'bajt/widgets/basicWidget',
        'bajt/widgets/combobox',
        'bajt/widgets/nettoinput',
        'bajt/widgets/copytextarea',
        'bajt/datatables/datatables',
        'bajt/datatables/dtimport',
        'bajt/forms/fields',
        'bajt/forms/basicForm',
        'bajt/forms/formPositions',
        'bajt/modals/modalField',
        'bajt/modals/modalImport',
        'bajt/modals/modalTableImport',
        'bajt/modals/modalTableImportDT',
        'bajt/modals/modalTableExport',
        'uploads',
        'export'
    ]);

    var src_ts = (function(p, files) {
        var fjs = [];
        for (var i = 0; i < files.length; i++) {
            fjs.push(p + 'ts/' + files[i] + '.js');
        }
        return fjs;
    })(paths.CSS_JS, ['messages', 'valid']);
    var app_js = (function(p, files) {
        var fjs = [];
        for (var i = 0; i < files.length; i++) {
            fjs.push(p + 'js/' + files[i] + '.js');
        }
        return fjs;
    })(paths.app.CSS_JS, [
        'appvariables',
        'entities',
        'appdatatables',
        'clients',
        'services',
        'serviceorders',
        'pricelistedit',
        'app',
        'appcustom'
    ]);
    var appexp_js = (function(p, files) {
        var fjs = [];
        for (var i = 0; i < files.length; i++) {
            fjs.push(p + 'js/export/exp_' + files[i] + '.js');
        }
        return fjs;
    })(paths.app.CSS_JS, [
        'app',
        'services',
        'materials',
        'externalservices',
        'serviceorders'
    ]);
    var develop = true;
    // grunt.log.write('debug: ' + JSON.stringify(paths));
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concurrent: {
            target: {
                tasks: [ 'watch' ],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        clean: {
            dist: [paths.dist + '*'],
            distApp: [paths.app.dist + '*'],
            publicApp: [paths.app.public + '*'],
            web: [paths.web + '*'],
            var: [ 'var/logs/*', 'var/sessions/dev/*', 'var/sessions/prod/*', 'var/cache/dev/*', 'var/cache/prod/*']
        },
        concat: {
            js: {
                src: src_js,
                dest: paths.dist + 'js/bajt_main.js'
            },
            js_map: {
                options: {
                    sourceMap: true
                },
                src: src_js,
                dest: paths.web + 'js/bajt_main.js'
            },
            jsTS: {
                src: src_ts,
                dest: paths.dist + 'js/bajt_ts.js'
            },
            jsTS_map: {
                options: {
                    sourceMap: true
                },
                src: src_ts,
                dest: paths.web + 'js/bajt_ts.js'
            },
            jsApp: {
                src: app_js,
                dest: paths.app.dist + 'js/bajt_app.js'
            },
            jsApp_map: {
                options: {
                    sourceMap: true
                },
                src: app_js,
                dest: paths.web + 'js/bajt_app.js'
            },
            jsAppExp: {
                src: appexp_js,
                dest: paths.app.dist + 'js/bajt_exp.js'
            },
            jsAppExp_map: {
                options: {
                    sourceMap: true
                },
                src: appexp_js,
                dest: paths.web + 'js/bajt_exp.js'
            }
        },
        copy: {
            public: {
                expand: true,
                cwd: paths.dist,
                src: ['**/*'],
                dest: paths.app.public
            },
            publicApp: {
                expand: true,
                cwd: paths.app.dist,
                src: ['**/*'],
                dest: paths.app.public
            },
            webApp: {
                expand: true,
                cwd: paths.app.public,
                src: ['**/*'],
                dest: paths.web
            },
            scssApp: {
                files: [
                    {
                        expand: true,
                        cwd: paths.app.CSS_JS + 'scss/',
                        src: ['*.scss'],
                        dest: paths.CSS_JS + 'scss/'
                    }
                ]
            },
            assets: {
                files: [
                    {
                        expand: true,
                        cwd: paths.CSS_JS + 'assets/font-awesome-5.0.8/',
                        src: ['css/*', 'js/*'],
                        dest: paths.app.public + 'assets/font-awesome/'
                    },
                    {
                        expand: true,
                        cwd: paths.CSS_JS + 'assets/bootstrap4/dist',
                        src: ['js/*'],
                        dest: paths.app.public + 'assets/bootstrap/'
                    },
                    {
                        expand: true,
                        cwd: paths.CSS_JS + 'assets/popper',
                        src: ['*.js'],
                        dest: paths.app.public + 'assets/js'
                    },
                    {
                        expand: true,
                        cwd: paths.CSS_JS + 'assets/tether-1.3.3/dist',
                        src: ['**/*'],
                        dest: paths.app.public + 'assets/tether/'
                    },
                    {
                        expand: true,
                        cwd: paths.CSS_JS + 'assets/DataTables/',
                        src: ['**/*'],
                        dest: paths.app.public + 'assets/DataTables/'
                    },
                    {
                        expand: true,
                        cwd: paths.CSS_JS + 'assets/jq/',
                        src: ['**/*'],
                        dest: paths.app.public + 'assets/jq/'
                    },
                    {
                        expand: true,
                        cwd: paths.CSS_JS + 'assets/jsoneditor/dist/',
                        src: ['*.css', '*.js', '*.map', 'img/**'],
                        dest: paths.app.public + 'assets/jsoneditor/'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: [paths.CSS_JS + 'assets/widgets/**/*.js'],
                        dest: paths.app.public + 'assets/js/',
                        filter: 'isFile'
                    },
                    {
                        expand: true,
                        flatten: true,
                        src: [paths.CSS_JS + 'assets/widgets/**/*.css'],
                        dest: paths.app.public + 'assets/css/',
                        filter: 'isFile'
                    }
                ]
            },
            images: {
                files: [
                    {
                        expand: true,
                        flatten: true,
                        src: [paths.CSS_JS + 'images/*.*'],
                        dest: paths.app.public + 'images/',
                        filter: 'isFile'
                    }
                ]
            }
        },
        uglify:{
            assets:{
                files: (function(){
                    var 
                        p=paths.app.public+'assets/',
                        dest=p+'js/bajt_assets.min.js',
                        files={},
                        f =[
                            'jq/jquery-3.2.1.min.js',
                            'jq/ui/jquery-ui.min.js',
                            'tether/js/tether.min.js',
                            'js/moment.min.js',
                            'js/popper.min.js',
                            'bootstrap/js/bootstrap.min.js',  
                            'js/bootstrap-switch.js',
                            'js/bootstrap-multiselect.js',
                            'js/bootstrap-confirmation.js',
                            'js/linedtextarea.js',
                            'js/daterangepicker.js',
                            'DataTables/JSZip-2.5.0/jszip.min.js',
                            'DataTables/pdfmake-0.1.18/build/pdfmake.min.js',
                            'DataTables/pdfmake-0.1.18/build/vfs_fonts.js',
                            'DataTables/DataTables-1.10.13/js/jquery.dataTables.min.js',
                            'DataTables/DataTables-1.10.13/js/dataTables.bootstrap4.min.js',
                            'DataTables/Buttons-1.2.4/js/dataTables.buttons.min.js',
                            'DataTables/Buttons-1.2.4/js/buttons.bootstrap4.min.js',
                            'DataTables/Buttons-1.2.4/js/buttons.colVis.min.js',
                            'DataTables/Buttons-1.2.4/js/buttons.flash.min.js',
                            'DataTables/Buttons-1.2.4/js/buttons.html5.min.js',
                            'DataTables/Buttons-1.2.4/js/buttons.print.min.js',               
                            'DataTables/KeyTable-2.2.0/js/dataTables.keyTable.min.js',
                            'DataTables/Responsive-2.1.1/js/dataTables.responsive.min.js',
                            'DataTables/Responsive-2.1.1/js/responsive.bootstrap4.min.js',
                            'DataTables/Scroller-1.4.2/js/dataTables.scroller.min.js',
                            'DataTables/Select-1.2.0/js/dataTables.select.min.js',
                            // 'jq/upload/js/vendor/jquery.ui.widget.js',
                            'jq/upload/js/extra/load-image.all.min.js',
                            'jq/upload/js/extra/canvas-to-blob.min.js',
                            'jq/upload/js/jquery.iframe-transport.js',
                            'jq/upload/js/jquery.fileupload.js',
                            'jq/upload/js/jquery.fileupload-process.js',
                            'jq/upload/js/jquery.fileupload-image.js',
                            'jq/upload/js/jquery.fileupload-validate.js',
                            'jsoneditor/jsoneditor.min.js'
                        ];
                    files[dest]=[];            
                    for(var i in f){
                        files[dest].push(p+f[i]);
                    }
                    return files;
                })()
            },
            bajt:{
                files: (function(){
                    var 
                        p=paths.app.public+'js/',
                        files={};
                    files[p+'bajt.min.js']=[
                        p+'bajt_main.js',
                        p+'bajt_ts.js',
                        p+'bajt_app.js',
                        p+'bajt_exp.js'
                    ];            
                    return files;
                })()
            }
        },
        cssmin:{
            assets:{
                files: (function(){
                    var 
                        p=paths.app.public+'assets/',
                        dest=p+'css/bajt_assets.min.css',
                        files={},
                        f =[
                            'bootstrap/css/bootstrap.css',
                            'tether/css/tether.min.css',
                            'jq/ui/jquery-ui.min.css',
                            'jsoneditor/jsoneditor.min.css',
                            'DataTables/Responsive-2.1.1/css/responsive.bootstrap4.min.css',
                            'DataTables/Buttons-1.2.4/css/buttons.bootstrap4.min.css',
                            'DataTables/Scroller-1.4.2/css/scroller.bootstrap.min.css',
                            'css/daterangepicker.css',
                            'css/linedtextarea.css'
                        ];
                    files[dest]=[];            
                    for(var i in f){
                        files[dest].push(p+f[i]);
                    }
                    return files;
                })()
            },
            bajt:{
                files: (function(){
                    var 
                        p=paths.app.public+'css/',
                        dest=p+'bajt.min.css',
                        files={},
                        f =[
                            'dataTables-bootstrap4.css',
                            'main.css'
                        ];
                    files[dest]=[];            
                    for(var i in f){
                        files[dest].push(p+f[i]);
                    }
                    return files;
                })()
            }
        },
        sass: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: paths.CSS_JS + 'scss/',
                        src: ['**/*.scss', '!/bootstrap/*.scss'],
                        dest: paths.CSS_JS + 'sass/',
                        ext: '.css'
                    }
                ]
            },
            bootstrap: {
                files: [
                    {
                        expand: true,
                        cwd: paths.CSS_JS + 'scss/bootstrap',
                        src: ['**/*.scss'],
                        dest: paths.CSS_JS + 'sass/bootstrap',
                        ext: '.css'
                    }
                ]
            }
        },
        postcss: {
            options: {
                map: false,
                //                map: {
                //                    inline: false, // save all sourcemaps as separate files...
                //                    annotation: projectPath+'CSS_JS/dist/css/maps/' // ...to the specified directory
                //                },
                processors: [
                    require('pixrem')(), // add fallbacks for rem units
                    require('autoprefixer')({ browsers: 'last 2 versions' }), // add vendor prefixes
                    require('cssnano')() // minify the result
                ]
            },
            dist: {
                expand: true,
                flatten: true,
                src: [paths.CSS_JS + 'sass/**/*.css', '!' + paths.CSS_JS + 'sass/bootstrap/*.css'],
                dest: paths.dist + 'css/'
            },
            distBootstrap: {
                expand: true,
                flatten: true,
                src: paths.CSS_JS + 'sass/bootstrap/*.css',
                dest: paths.dist + 'assets/bootstrap/css/'
            }
        },
        watch: {
            images:{
                files: [paths.CSS_JS + 'images/*.*'],
                tasks: ['newer:copy:images', 'never:copy:webApp']
            },
            scssApp: {
                files: [paths.app.CSS_JS + 'scss/*.scss'],
                tasks: ['copy:scssApp']
            },
            scss: {
                files: [paths.CSS_JS + 'scss/**/*.scss'],
                tasks: ['sass:dist', 'postcss:dist', 'newer:copy:public', 'newer:copy:webApp']
            },
            scssBootstrap: {
                files: [paths.CSS_JS + 'scss/bootstrap/**/*.scss', '!' + paths.CSS_JS + 'scss/bootstrap/*.scss'],
                tasks: ['sass', 'postcss', 'newer:copy:public', 'newer:copy:webApp']
            },
            // sass: {
            //     files: [paths.CSS_JS + 'sass/**/*.css', '!' + paths.CSS_JS + 'sass/bootstrap/*.css'],
            //     tasks: ['postcss:dist', 'newer:copy:public', 'newer:copy:webApp']
            // },
            // sassBootstrap: {
            //     files: [paths.CSS_JS + 'sass/bootstrap/*.css'],
            //     tasks: ['postcss',  'newer:copy:public', 'newer:copy:webApp']
            // },
            js: {
                files: paths.CSS_JS + 'js/**/*.js',
                tasks: ['concat:js_map']
            },
            jsTS: {
                files: paths.CSS_JS + 'ts/**/*.js',
                tasks: ['concat:jsTS_map']
            },
            jsApp: {
                files: [paths.app.CSS_JS + 'js/*.js', '!' + paths.CSS_JS + 'js/export/*.js' ],
                tasks: ['concat:jsApp_map']
            },
            jsAppExp: {
                files: [paths.app.CSS_JS + 'js/export/*.js'],
                tasks: ['concat:jsAppExp_map']
            }
        }
    });
    grunt.registerTask('clean_dist', 'Clean dist folders', ['clean:dist', 'clean:distApp']);
    grunt.registerTask('clean_var', 'Clean var folders', ['clean:var']);
    grunt.registerTask('copy_public', 'Copy public', ['newer:copy:public', 'newer:copy:publicApp']);
    grunt.registerTask('compile_js', 'compile all js', [ 
        'concat:js',
        'concat:jsApp',
        'concat:jsTS',
        'concat:jsAppExp'
    ]);
    grunt.registerTask('compile_js_map', 'compile all js', [ 
        'concat:js_map',
        'concat:jsApp_map',
        'concat:jsTS_map',
        'concat:jsAppExp_map'
    ]);
    grunt.registerTask('!Default', 'watching and compile', ['concurrent']);
    grunt.registerTask('!Compile', 'Compile', [
        'clean:web',
        'clean:publicApp',
        'clean_dist',
        'compile_js',
        'sass',
        'postcss',
        'copy_public',
        'copy:images',
        'copy:assets',
        'cssmin',
        'uglify',
        'copy:webApp'
    ]);
    grunt.registerTask('!Compile_maps', 'Compile with maps', [
        '!Compile',
        'compile_js_map'
    ]);
    grunt.registerTask('!Production', 'To production', [
        '!Compile',
        'clean:var'
    ]);
};


(function($) {
    /**
     * sendAsBinary
     * 
     * @url http://stackoverflow.com/questions/3743047/uploading-a-binary-string-in-webkit-chrome-using-xhr-equivalent-to-firefoxs-se
     */
    if (!('sendAsBinary' in XMLHttpRequest.prototype)) {
        XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
            function byteValue(x) {
                return x.charCodeAt(0) & 0xff;
            }

            var ords = Array.prototype.map.call(datastr, byteValue);
            var ui8a = new Uint8Array(ords);
            this.send(ui8a.buffer);
        };
    }

    if (!('from' in Array)) {
        Array.from = function(aryLike) {
            return [].slice.call(aryLike);
        };
    }

    if (!('keys' in Object)) {
        Object.keys = function(obj) {
            var keys = [];

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    keys.push(key);
                }
            }

            return keys;
        };
    }

    var WebDAV = (function() {
        var _request = function(type, url, headers, allowCache) {
            // could add support for other versions here. lazy
            var xhr =  new XMLHttpRequest();

            // bust some cache
            if (!allowCache) {
                url += (url.indexOf('?') > -1 ? '&' : '?') + '_=' + Date.now();
            }

            xhr.open(type, url, true);

            if (headers) {
                Object.keys(headers).forEach(function(header) {
                    xhr.setRequestHeader(header, headers[header]);
                });
            }

            return xhr;
        },
        _showSize = function(i) {
            var size = '';

            ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'].forEach(function(text, index) {
                if (!size && (i < Math.pow(1024, index + 1))) {
                    size += (i / Math.pow(1024, index)).toFixed((index > 0) ? 1 : 0) + ' ' + ((i == 1) ? 'byte' : text);
                }
            });

            return size;
        },
        _sortFiles = function() {
            if (files.length) {
                files.sort(function(a, b) {
                    if (a.directory == b.directory) {
                        return a.name.replace(/\/$/, '') < b.name.replace(/\/$/, '') ? -1 : 1;
                    }
                    else {
                        return a.directory ? -1 : 1;
                    }
                });
            }

            $.each(files, function(i) {
                this.index = i;
            });

            return files;
        },
        _createListItem = function(file) {
            file.item = $('<li/>').data('file', file);

            if (file.directory) {
                file.item.addClass('directory');
            }
            else {
                file.item.addClass('file');

                if (file.type) {
                    file.item.addClass(file.type);
                }
                else {
                    file.item.addClass('unknown');
                }
            }

            if (!file.directory) {
                file.item.addClass(file.name.replace(/^.+\.([^\.]+)$/, '$1'));
            }

            file.item.append('<a href="' + file.path + file.name + '" class="title">' + file.title + '</a>');

            if (!file.directory) {
                file.item.append('<span class="size">' + _showSize(file.size) + '</span>');
            }

            // parent folder doesn't have a 'name'
            if (file.name) {
                if (file['delete']) {
                    file.item.append('<a href="#delete" class="delete">&times;</a>');
                    file.item.append('<a href="#move" class="move">move</a>');
                }

                file.item.append('<a href="#rename" class="rename">rename</a>');
                file.item.append('<a href="#copy" class="copy">copy</a>');
            }

            _bindEvents(file);

            return file;
        },
        _bindEvents = function(file) {
            if (file.directory) {
                file.item.find('.title').on('click', function() {
                    history.pushState(history.state, file.path + file.name, file.path + file.name);
                    WebDAV.list(file.path + file.name);

                    return false;
                });
            }
            else {
                file.item.find('.title').on('click', function(event) {
                    event.stopPropagation();

                    var options = {
                        href: file.path + file.name
                    };

                    if (file.type == 'video') {
                        options.wrapCSS = 'fancybox-video';
                        options.content = '<style type="text/css">.fancybox-video{width:auto !important;height:auto !important}.fancybox-inner{width:auto !important;height:auto !important}video{max-width:90%;max-height:90%}</style><video autoplay controls><source src="' + file.path + file.name + '"/></video>';
                        options.afterShow = function() {
                            $.fancybox.update();
                        };
                    }
                    else if (file.type == 'font') {
                        var formats = {
                            eot: 'embedded-opentype',
                            otf: 'opentype',
                            ttf: 'truetype'
                        },
                        extension = file.name.replace(/^.+\.([^\.]+)$/, '$1');

                        options.content = '<style>@font-face{font-family:"f";src:url("' + file.path + file.name + '") format("' + (formats[extension] || extension) + '")}.fancybox-inner *{font-family:"f"}.a:before{content:"The quick brown fox jumps over the lazy dog. 0123456789";display:block;padding:0 0 .5em}.a:after{content:"Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz"}.l{font-size:2em}</style><h1>' + file.name + '</h1><p class="l"><span class="a"></span></p><p><span class="a"></span></p><p><strong class="a"></strong></p><p><em class="a"></em></p>';
                    }
                    else if (file.type == 'text') {
                        options.type = 'iframe';

                        // the following will only work if you're using the apache solution
                        options.beforeShow = function() {
                            // access the frame's document object
                            var w = $('.fancybox-iframe').prop('contentWindow'),
                            d = w.document;
                            $('pre', d).addClass('prettyprint').addClass('lang-' + file.name.replace(/^.+\.([^\.]+)$/, '$1'));

                            // if we haven't loaded the script yet, lets just exit quietly
                            if (!prettyPrint) {
                                $.get('https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js', function(code) {
                                    prettyPrint = code;

                                    w.eval(code);
                                });
                            }
                            else {
                                w.eval(prettyPrint);
                            }
                        };
                    }

                    if (file.type != 'unknown') {
                        $.fancybox(options);

                        return false;
                    }
                });
            }

            if (file['delete']) {
                file.item.find('.delete').on('click', function() {
                    if (confirm('Are you sure you want to delete "' + file.name + '"?')) {
                        WebDAV.del(file);
                    }

                    return false;
                });

                file.item.find('.rename').on('click', function() {
                    var to = prompt('Please enter the new name for "' + file.name + '":', file.name);

                    if (!to.match(/^[a-z0-9_\-\.]+$/i)) {
                        // TODO
                        alert('Bad file name.');
                        to = false;
                    }

                    if (to) {
                        WebDAV.rename(file, file.path + to);
                    }

                    return false;
                });

                file.item.find('.copy').on('click', function() {
                    alert('Currently not implemented.');

                    return false;
                });

                file.item.find('.move').on('click', function() {
                    alert('Currently not implemented.');

                    return false;
                });
            }

            file.item.on('click', function() {
                file.item.find('a.title').click();

                return false;
            });

            return file.item;
        },
        _renderFiles = function() {
            _sortFiles();

            list.empty();

            $.each(files, function(i, file) {
                if (!file) {
                    return;
                }

                list.append(file.item);
            });

            return list;
        },
        _checkFile = function(file) {
            var r = false;

            $.each(files, function() {
                if (this.name == file.name) {
                    r = this;

                    return false;
                }
            });

            return r;
        },
        _getType = function(file) {
            var types = {
                // displayed in an iframe, using google prettify
                'text': /\.(?:te?xt|i?nfo|php|pl|cgi|faq|ini|htaccess|log|sql|sfv|conf|sh|pm|py|rb|(?:s?c|sa)ss|js|java|coffee|[sx]?html?|xml|svg)$/i,
                // displayed in fancybox as an image
                'image': /\.(?:jpe?g|gif|a?png)/i,
                'video': /\.(?:mp(?:e?g)?4|mov|avi|webm|ogv)/i,
                'font': /\.(?:woff2?|eot|[ot]tf)/i
            },
            // downloaded
            type = 'unknown';

            $.each(types, function(key, value) {
                if (file.match(value)) {
                    type = key;

                    return false;
                }
            });

            return type;
        },
        _getURL = function() {
            var url = '/';

            $('script[src$="src/webdav-min.js"], script[src$="src/webdav.js"]').each(function() {
                url = $(this).attr('src').replace(/src\/webdav(-min)?.js$/, '');
            });

            return url;
        },
        _getTag = function(doc, tag) {
            if (doc.querySelector) {
                return doc.querySelector(tag);
            }

            return doc.getElementsByTagName(tag)[0];
        },
        _getTagContent = function(doc, tag) {
            var node = _getTag(doc, tag);

            return node ? node.textContent : '';
        },
        _getTags = function(doc, tag) {
            if (doc.querySelectorAll) {
                return Array.from(doc.querySelectorAll(tag));
            }

            return Array.from(doc.getElementsByTagName(tag));
        },
        _updateDisplay = function() {
            _sortFiles();
            _renderFiles();
        },
        _refreshDisplay = function() {
            return WebDAV.list(path);
        },
        _getFileName = function(path) {
            path = path.replace(/\/$/, '');

            return path.split('/').pop();
        },
        list = $('<ul class="list"/>'),
        dropper,
        path = window.location.pathname,
        files = [],
        prettyPrint = '',

        WebDAV = {
            init: function() {
                // save the pretty print script so we only request it once
                $.getScript(_getURL() + 'external/prettify/prettify.js', function(script) {
                    prettyPrint = script;
                });

                $('<div class="content"></div><div class="upload">Drop files here to upload or <a href="#createDirectory" class="create-directory">create a new directory</a></div>').appendTo($('body').empty());

                $('div.content').append(list);

                dropper = $('div.upload');

                this.list(path);

                // render the nice list
                _renderFiles();

                // drag and drop area
                dropper.on('dragover', function() {
                    dropper.addClass('active');

                    return false;
                });

                dropper.on('dragend dragleave', function(event) {
                    dropper.removeClass('active');

                    return false;
                });

                dropper.on('drop', function(event) {
                    dropper.removeClass('active');

                    var newFiles = event.originalEvent.target.files || event.originalEvent.dataTransfer.files;

                    $.each(newFiles, function(i, file) {
                        if (existingFile = _checkFile(file)) {
                            if (!confirm('A file called "' + existingFile.name + '" already exists, would you like to overwrite it?')) {
                                return false;
                            }
                            else {
                                delete files[existingFile.index];
                            }
                        }

                        if (typeof FileReader != 'undefined') {
                            var fileReader = new FileReader();

                            fileReader.addEventListener('load', function(event) {
                                file.data = event.target.result;

                                WebDAV.upload(file);
                            }, false);

                            fileReader.context = WebDAV;
                            fileReader.filename = file.name;
                            fileReader.readAsBinaryString(file);
                        }
                        else {
                            // TODO: support other browsers - flash fallback
                            alert('Sorry, your browser isn\'t currently suppored.');
                        }
                    });

                    return false;
                });

                // TODO: if drag/drop unsupported, regular file upload box - also needed for flash fallback of FileReader

                // create directory
                $('a.create-directory').on('click', function() {
                    var name = prompt('New folder name:'), file;

                    if (!name.match(/^[\w\d_\-\.]+$/)) {
                        alert('Name contains non-standard characters, aborting.');

                        return false;
                    }
                    else if (name.match(/^\.\.?$/)) {
                        alert('Cannot use a reserved name for your directory.');

                        return false;
                    }

                    if (file = _checkFile(name)) {
                        if (file.directory) {
                            alert('Directory "' + file.name + '" already exists.');
                        }
                        else {
                            alert('A file called "' + file.name + '" exists, unable to create folder.');
                        }

                        return false;
                    }

                    var file = {
                        directory: true,
                        name: name,
                        title: name + '/',
                        path: path,
                        modified: Date.now(),
                        size: false,
                        type: _getType(name),
                        mimeType: '',
                        request: null,
                        item: null,
                        data: null,
                        delete: true
                    };

                    file.request = _request('MKCOL', file.path + file.name);

                    file.request.addEventListener('loadstart', function(event) {
                        file.item.addClass('loading');
                    }, false);

                    file.request.addEventListener('load', function(event) {
                        file.item.removeClass('loading');
                    }, false);

                    file.request.addEventListener('error', function(event) {
                        delete files[file.index];

                        _updateDisplay();

                        console.log('Error'); // TODO
                    }, false);

                    file.request.addEventListener('abort', function(event) {
                        delete files[file.index];

                        _updateDisplay();

                        console.log('Aborted'); // TODO
                    }, false);

                    files.push(_createListItem(file));

                    _updateDisplay();

                    file.request.send(null);

                    return false;
                });

                $(window).on("popstate", function(e) {
                    WebDAV.list(window.location.pathname);
                });
            },
            list: function(_path) {
                var list = _request('PROPFIND', _path, {
                    Depth: 1
                });

                files = [];

                list.addEventListener('loadstart', function(event) {
                    $('div.content').addClass('loading');
                }, false);

                list.addEventListener('load', function(event) {
                    var parser = new DOMParser(),
                    xml = parser.parseFromString(list.responseText, 'application/xml');

                    path = _path.match(/\/$/) ? _path : _path + '/';

                    _getTags(xml, 'response').forEach(function(entry, i) {
                        var file = _getTagContent(entry, 'href'),
                        name = _getFileName(file);

                        if (!i) {
                            if (_path != '/') {
                                files.push(_createListItem({
                                    directory: true,
                                    name: '',
                                    title: '&larr;',
                                    path: _path.replace(/[^\/]+\/?$/, ''),
                                    modified: '',
                                    size: '',
                                    type: '',
                                    mimeType: '',
                                    request: null,
                                    item: null,
                                    data: null,
                                    delete: false
                                }));
                            }
                            return;
                        }

                        files.push(_createListItem({
                            directory: !!_getTag(entry, 'collection'),
                            name: name,
                            title: name,
                            path: path,
                            modified: new Date(_getTagContent(entry, 'getlastmodified')),
                            size: _getTagContent(entry, 'getcontentlength'),
                            type: _getType(name),
                            mimeType: _getTagContent(entry, 'getcontenttype'),
                            request: null,
                            item: null,
                            data: null,
                            delete: true
                        }));
                    });

                    _updateDisplay();

                    $('div.content').removeClass('loading');
                }, false);

                list.addEventListener('error', function(event) {
                    // TODO
                }, false);

                list.addEventListener('abort', function(event) {
                    // TODO
                }, false);

                list.send(null);
            },
            upload: function(file) {
                if (!file.name) {
                    return false;
                }

                file = $.extend({
                    directory: false,
                    title: file.name,
                    path: this.path(),
                    modified: new Date(),
                    size: file.data.length,
                    request: null,
                    item: null,
                    delete: true
                }, file);

                file.request = _request('PUT', file.path + file.name, {
                    'Content-Type': file.type
                });

                file.request.addEventListener('loadstart', function(event) {
                    file.item.addClass('loading');
                    file.item.find('span.size').after('<span class="uploading"><span class="progress"><span class="meter"></span></span><span class="cancel-upload">&times;</span></span>');
                    file.item.find('span.cancel-upload').on('click', function() {
                        file.request.abort();

                        return false;
                    });
                }, false);

                file.request.addEventListener('progress', function(event) {
                    file.item.find('span.meter').width('' + ((event.position / event.total) * 100) + '%');
                }, false);

                file.request.addEventListener('load', function(event) {
                    _refreshDisplay();
                }, false);

                file.request.addEventListener('error', function(event) {
                    delete files[file.index];

                    _updateDisplay();

                    console.log('Error', event); // TODO
                }, false);

                file.request.addEventListener('abort', function(event) {
                    delete files[file.index];

                    _updateDisplay();

                    console.log('Aborted', event); // TODO
                }, false);

                files.push(_createListItem(file));

                _updateDisplay();

                file.request.sendAsBinary(file.data);

                return true;
            },
            del: function(file) {
                if (!file.name) {
                    return false;
                }

                if (!('path' in file)) {
                    file.path = this.path();
                }

                file.request = _request('DELETE', file.path + file.name);

                file.request.addEventListener('load', function(event) {
                    delete files[file.index];

                    _refreshDisplay();
                }, false);

                file.request.addEventListener('error', function(event) {
                    console.log('Error', event); // TODO
                }, false);

                file.request.addEventListener('abort', function(event) {
                    console.log('Aborted', event); // TODO
                }, false);

                file.request.send(null);

                return true;
            },
            copy: function(from, to) {
                // TODO
                from.request = _request('COPY', from.path + from.name, {
                    Destination: to
                });

                from.request.addEventListener('load', function(event) {
                    _refreshDisplay();
                }, false);

                from.request.addEventListener('error', function(event) {
                    console.log('Error', event); // TODO
                }, false);

                from.request.addEventListener('abort', function(event) {
                    console.log('Aborted', event); // TODO
                }, false);

                from.request.send(null);

                return true;
            },
            move: function(from, to) {
                // TODO
                from.request = _request('MOVE', from.path + from.name, {
                    Destination: window.location.protocol + '//' + window.location.host + to
                });

                from.request.addEventListener('load', function(event) {
                    _refreshDisplay();
                }, false);

                from.request.addEventListener('error', function(event) {
                    console.log('Error', event); // TODO
                }, false);

                from.request.addEventListener('abort', function(event) {
                    console.log('Aborted', event); // TODO
                }, false);

                from.request.send(null);

                return true;
            },
            rename: function(from, to) {
                return this.move(from, to);
            }
        };

        return WebDAV;
    })();

    $(function() {
        WebDAV.init();
    });
})(jQuery);

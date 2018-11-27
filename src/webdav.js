(function($) {
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
        // internal methods
        var _bindEvents = function(file) {
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

                    if (file.type == 'video') {
                        $.featherlight('<video autoplay controls><source src="' + file.path + file.name + '"/></video>');

                        event.preventDefault();
                    }
                    else if (file.type == 'audio') {
                        $.featherlight('<audio autoplay controls><source src="' + file.path + file.name + '"/></audio>');

                        event.preventDefault();
                    }
                    else if (file.type == 'image') {
                        $.featherlight({
                            image: file.path + file.name
                        });

                        event.preventDefault();
                    }
                    else if (file.type == 'font') {
                        var formats = {
                            eot: 'embedded-opentype',
                            otf: 'opentype',
                            ttf: 'truetype'
                        },
                        extension = file.name.replace(/^.+\.([^\.]+)$/, '$1'),
                        fontName = (file.path + file.name).replace(/\W+/g, '_'),
                        demoText = 'The quick brown fox jumps over the lazy dog. 0123456789<br/>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz';

                        if (!$('[data-path="' + (file.path + file.name) + '"]').is('style')) {
                            $('body').appendChild('<style type="text/css" data-path="' + (file.path + file.name) + '">@font-face{font-family:"' + fontName + '";src:url("' + file.path + file.name + '") format("' + (formats[extension] || extension) + '")}</style>');
                        }

                        $.featherlight('<h1 style="font-family:"' + fontName + '">' + file.name + '</h1><p style="font-family:\'' + fontName + '\';font-size:1.5em">' + demoText + '</p><p style="font-family:\'' + fontName + '\'">' + a + '</p><p style="font-family:\'' + fontName + '\'"><strong>' + demoText + '</strong></p><p style="font-family:\'' + fontName + '\'"><em>' + demoText + '</em></p><p><a href="' + file.path + file.name + '" style="display:inline-block;padding:.5em;background:#000;font-family:sans-serif;border-radius:.5em;color:#fff">Download</a></p>');

                        event.preventDefault();
                    }
                    else if (file.type == 'text') {
                        if (!('code' in $.featherlight.contentFilters)) {
                            $.extend($.featherlight.contentFilters, {
                                code: {
                                    process: function(url) {
                                        var deferred = $.Deferred(),
                                        $container = $('<pre class="prettyprint"></pre>');
                                        $.ajax(url, {
                                            complete: function(response, status) {
                                                if ( status !== "error" ) {
                                                    $container.text(response.responseText);
                                                    deferred.resolve($container);

                                                    // prettify the code
                                                    PR.prettyPrint();
                                                }

                                                deferred.fail();
                                            }
                                        });

                                        return deferred.promise();
                                    }
                                }
                            }); 
                        }

                        $.featherlight({
                            code: file.path + file.name
                        });

                        event.preventDefault();
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

                    if (!to.match(/^[a-z0-9_\-\. ]+$/i)) {
                        _message('Bad file name.');
                        to = false;
                    }

                    if (to) {
                        WebDAV.rename(file, file.path + to);
                    }

                    return false;
                });

                file.item.find('.copy').on('click', function() {
                    _message('Currently not implemented.');

                    return false;
                });

                file.item.find('.move').on('click', function() {
                    _message('Currently not implemented.');

                    return false;
                });

                file.item.find('.download').on('click', function(event) {
                    event.stopPropagation();

                    return true;
                });
            }

            file.item.on('click', function() {
                file.item.find('a.title').click();

                return false;
            });

            return file.item;
        },
        _checkFile = function(file) {
            var r = false;

            $.each(_files, function() {
                if (this.name == file.name) {
                    r = this;

                    return false;
                }
            });

            return r;
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

            file.item.append('<a href="' + file.path + file.name + '" target="_blank" class="title">' + file.title + '</a>');

            if (!file.directory) {
                file.item.append('<span class="size">' + _showSize(file.size) + '</span>');
            }

            // parent folder doesn't have a 'name'
            if (file.name) {
                if (file['delete']) {
                    file.item.append('<a href="#delete" title="Delete" class="delete">delete</a>');
                    file.item.append('<a href="#move" title="Move" class="move">move</a>');
                }

                file.item.append('<a href="#rename" title="Rename" class="rename">rename</a>');
                file.item.append('<a href="#copy" title="Copy" class="copy">copy</a>');

                if (!file.directory) {
                    file.item.append('<a href="' + file.path + file.name + '" download="' + file.name + '" class="download">download</a>');
                }
            }

            _bindEvents(file);

            return file;
        },
        _getFileName = function(path) {
            path = path.replace(/\/$/, '');

            return path.split('/').pop();
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
        _getType = function(file) {
            if (file.mimeType && file.mimeType.split('/').shift()) {
                return file.mimeType.split('/').shift();
            }

            var types = {
                // displayed in an iframe, using google prettify
                text: /\.(?:te?xt|i?nfo|php|pl|cgi|faq|ini|htaccess|log|md|sql|sfv|conf|sh|pl|pm|py|rb|(?:s?c|sa)ss|js|java|coffee|[sx]?html?|xml)$/i,
                // displayed in fancybox as an image
                image: /\.(?:jpe?g|gif|a?png|svg)/i,
                video: /\.(?:mp(?:e?g)?4|mov|avi|webm|ogv)/i,
                audio: /\.(?:mp3|wav|ogg)/i,
                font: /\.(?:woff2?|eot|[ot]tf)/i
            },
            // pushed to browser
            type = 'unknown';

            $.each(types, function(key, value) {
                if (file.match(value)) {
                    type = key;

                    return false;
                }
            });

            return type;
        },
        _listContents = function(path, events) {
            var req = _request('PROPFIND', path, {
                Depth: 1
            });

            Object.keys(events).forEach(function(event) {
                req.addEventListener(event, events[event], true);
            });

            req.send(null);

            return req;
        },
        _message = function(message, type) {
            if ('notify' in $) {
                $.notify(message, {
                    className: (type || 'error')
                });
            }
            else {
                console.log(message);
            }
        },
        _refreshDisplay = function() {
            return WebDAV.list(_path);
        },
        _renderFiles = function() {
            _sortFiles();

            _list.empty();

            $.each(_files, function(i, file) {
                if (!file) {
                    return;
                }

                _list.append(file.item);
            });

            return _list;
        },
        _request = function(type, url, headers, allowCache) {
            // could add support for other versions here. lazy
            var xhr =  new XMLHttpRequest();

            // bust some cache
            if (!allowCache) {
                url += (url.indexOf('?') > -1 ? '&' : '?') + '_=' + Date.now();
            }

            xhr.addEventListener('loadstart', function() {
                _busy = true;
            });

            xhr.addEventListener('loadend', function() {
                _busy = true;
            });

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
            if (_files.length) {
                _files.sort(function(a, b) {
                    if (a.directory == b.directory) {
                        return a.name.replace(/\/$/, '') < b.name.replace(/\/$/, '') ? -1 : 1;
                    }
                    else {
                        return a.directory ? -1 : 1;
                    }
                });
            }

            $.each(_files, function(i) {
                this.index = i;
            });

            return _files;
        },
        _updateDisplay = function() {
            document.title = _path + ' - ' + window.location.host;

            _sortFiles();
            _renderFiles();
        },

        // private vars
        _busy = false,
        _cache = {},
        _dropper,
        _files = [],
        _list = $('<ul class="list"/>'),
        _path = window.location.pathname,

        // exposed API
        WebDAV = {
            init: function() {
                $('<div class="content"></div><div class="upload">Drop files here to upload or <a href="#createDirectory" class="create-directory">create a new directory</a></div>').appendTo($('body').empty());

                $('div.content').append(_list);

                _dropper = $('div.upload');

                WebDAV.list(_path);

                // render the nice list
                _renderFiles();

                // drag and drop area
                _dropper.on('dragover', function() {
                    _dropper.addClass('active');

                    return false;
                });

                _dropper.on('dragend dragleave', function(event) {
                    _dropper.removeClass('active');

                    return false;
                });

                _dropper.on('drop', function(event) {
                    var newFiles = event.originalEvent.target.files || event.originalEvent.dataTransfer.files;

                    _dropper.removeClass('active');

                    $.each(newFiles, function(i, fileObject) {
                        if (existingFile = _checkFile(fileObject)) {
                            if (!confirm('A file called "' + existingFile.name + '" already exists, would you like to overwrite it?')) {
                                return false;
                            }
                            else {
                                delete _files[existingFile.index];
                            }
                        }

                        if (typeof FileReader != 'undefined') {
                            var fileReader = new FileReader();

                            fileReader.addEventListener('load', function(event) {
                                fileObject.data = event.target.result;

                                WebDAV.upload(fileObject);
                            }, false);

                            fileReader.context = WebDAV;
                            fileReader.filename = fileObject.name;
                            fileReader.readAsArrayBuffer(fileObject);
                        }
                        else {
                            // TODO: support other browsers - flash fallback?
                            _message('Sorry, your browser isn\'t currently suppored.');
                        }
                    });

                    return false;
                });

                // TODO: if drag/drop unsupported, regular file upload box - also needed for flash fallback of FileReader

                // create directory
                $('a.create-directory').on('click', function() {
                    var name = prompt('New folder name:'), file;

                    if (!name.match(/^[\w\d_\-\. ]+$/)) {
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
                        path: _path,
                        modified: Date.now(),
                        size: false,
                        type: _getType(name),
                        mimeType: '',
                        request: null,
                        item: null,
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
                        delete _files[file.index];

                        _updateDisplay();

                        _message('Error creating directory ' + file.name + '.');
                    }, false);

                    file.request.addEventListener('abort', function(event) {
                        delete _files[file.index];

                        _updateDisplay();

                        _message('Aborted as requested.', 'success');
                    }, false);

                    _files.push(_createListItem(file));

                    _updateDisplay();

                    file.request.send(null);

                    return false;
                });

                $(window).on("popstate", function(e) {
                    WebDAV.list(window.location.pathname);
                });

                // replace refresh key with force reload
                $(document).on('keydown', function(e) {
                    var keyCode = e.which || e.keyCode;

                    if ((keyCode == 116) || ((keyCode == 82) && (e.metaKey || e.ctrlKey))) {
                        e.preventDefault();

                        WebDAV.list(_path, true);

                        return false;
                    }

                    return true;
                });
            },
            list: function(path, refresh) {
                path = path.match(/\/$/) ? path : path + '/'; // ensure we have a trailing slash for some platforms

                if ((path in _cache) && !refresh) {
                    _files = [];

                    _cache[_path = path].forEach(function(file) {
                        // events need to be re-bound
                        _files.push(_createListItem(file));
                    });

                    return _updateDisplay();
                }

                _listContents(path, {
                    loadstart: function() {
                        $('div.content').addClass('loading');
                    },
                    loadend: function() {
                        $('div.content').removeClass('loading');
                    },
                    load: function(event) {
                        var list = event.target,
                        parser = new DOMParser(),
                        xml = parser.parseFromString(list.responseText, 'application/xml');

                        _path = path;
                        _files = [];

                        _getTags(xml, 'response').forEach(function(entry, i) {
                            var file = _getTagContent(entry, 'href'),
                            name = _getFileName(file);

                            if (!i) {
                                if (path != '/') {
                                    _files.push(_createListItem({
                                        directory: true,
                                        name: '',
                                        title: '&larr;',
                                        path: path.replace(/[^\/]+\/?$/, ''),
                                        modified: '',
                                        size: '',
                                        type: '',
                                        mimeType: '',
                                        request: null,
                                        item: null,
                                        delete: false
                                    }));
                                }
                                return;
                            }

                            _files.push(_createListItem({
                                directory: !!_getTag(entry, 'collection'),
                                name: name,
                                title: decodeURIComponent(name),
                                path: _path,
                                modified: new Date(_getTagContent(entry, 'getlastmodified')),
                                size: _getTagContent(entry, 'getcontentlength'),
                                type: _getType(name),
                                mimeType: _getTagContent(entry, 'getcontenttype'),
                                request: null,
                                item: null,
                                delete: true
                            }));
                        });

                        _files.timestamp = Date.now();

                        _cache[_path] = _files;

                        _updateDisplay();
                    },
                    error: function() {
                        _message('There was an error getting details for ' + path + '.');
                    },
                    abort: function() {
                        _message('Aborted as requested. ' + path, 'success');
                    }
                });
            },
            upload: function(fileObject) {
                if (!fileObject.name) {
                    return false;
                }

                var file = {
                    directory: false,
                    name: fileObject.name,
                    title: decodeURIComponent(fileObject.name),
                    path: _path,
                    modified: new Date(),
                    size: fileObject.data.byteLength,
                    type: _getType(fileObject.name),
                    mineType: fileObject.type,
                    request: null,
                    item: null,
                    delete: true
                };

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

                    _message(file.name + ' uploaded successfully.', 'sucess');
                }, false);

                file.request.addEventListener('error', function(event) {
                    delete _files[file.index];

                    _updateDisplay();

                    _message('Error uploading file.');
                }, false);

                file.request.addEventListener('abort', function(event) {
                    delete _files[file.index];

                    _updateDisplay();

                    _message('Aborted as requested.', 'sucess');
                }, false);

                _files.push(_createListItem(file));

                _updateDisplay();

                file.request.send(fileObject.data);

                return true;
            },
            del: function(file) {
                if (!file.name) {
                    return false;
                }

                if (!('path' in file)) {
                    file.path = _path;
                }

                file.request = _request('DELETE', file.path + file.name);

                file.request.addEventListener('load', function(event) {
                    delete _files[file.index];
                    _cache[_path] = _files;
                    _refreshDisplay();
                }, false);

                file.request.addEventListener('error', function(event) {
                    _message('Error deleting file ' + file.name + '.');
                }, false);

                file.request.addEventListener('abort', function(event) {
                    _message('Aborted as requested.', 'success');
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
                    _message('Error copying file ' + file.name + '.');
                }, false);

                from.request.addEventListener('abort', function(event) {
                    _message('Aborted as requested.', 'success');
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
                    _message('Error moving file ' + file.name + '.');
                }, false);

                from.request.addEventListener('abort', function(event) {
                    _message('Aborted as requested.', 'success');
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

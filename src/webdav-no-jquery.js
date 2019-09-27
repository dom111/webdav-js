(function(_document, _decodeURIComponent, _querySelector, _addEventListener) {
  if (!('from' in Array)) {
    Array.from = function(arrayLike) {
      return [].slice.call(arrayLike);
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
        file.item[_querySelector]('.title')[_addEventListener]('click', function() {
          WebDAV.list(file.path + file.name);

          return false;
        });
      }
      else {
        file.item[_querySelector]('.title')[_addEventListener]('click', function(event) {
          event.stopPropagation();

          if (file.type === 'video') {
            basicLightbox.create('<video autoplay controls><source src="' + file.path + file.name + '"/></video>').show();

            event.preventDefault();
          }
          else if (file.type === 'audio') {
            basicLightbox.create('<audio autoplay controls><source src="' + file.path + file.name + '"/></audio>').show();

            event.preventDefault();
          }
          else if (file.type === 'image') {
            basicLightbox.create({
              image: file.path + file.name
            }).show();

            event.preventDefault();
          }
          else if (file.type === 'font') {
            var formats = {
              eot: 'embedded-opentype',
              otf: 'opentype',
              ttf: 'truetype'
            },
            extension = file.name.replace(/^.+\.([^\.]+)$/, '$1').toLowerCase(),
            fontName = (file.path + file.name).replace(/\W+/g, '_'),
            demoText = 'The quick brown fox jumps over the lazy dog. 0123456789<br/>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz';

            if (!_document[_querySelector]('style[data-path="' + (file.path + file.name) + '"]')) {
              _document.body.appendChild((function(style) {
                style.setAttribute('data-path', file.path + file.name);
                style.appendChild(_document.createTextNode('@font-face{font-family:"' + fontName + '";src:url("' +       file.path + file.name + '") format("' + (formats[extension] || extension) + '")}'));
                return style;
              })(_document.createElement('style')));
            }

            basicLightbox.create('<h1 style="font-family:\'' + fontName + '\'">' + file.name + '</h1><p style="font-family:\'' + fontName + '\';font-size:1.5em">' + demoText + '</p><p style="font-family:\'' + fontName + '\'">' + demoText + '</p><p style="font-family:\'' + fontName + '\'"><strong>' + demoText + '</strong></p><p style="font-family:\'' + fontName + '\'"><em>' + demoText + '</em></p><p><a href="' + file.path + file.name + '" style="display:inline-block;padding:.5em;background:#000;font-family:sans-serif;border-radius:.5em;color:#fff">Download</a></p>').show();

            event.preventDefault();
          }
          else if (file.type === 'text') {
            var textRequest = _request('GET', file.path + file.name);

            textRequest[_addEventListener]('loadstart', function(event) {
              _addClass(file.item, 'loading');
            }, false);

            textRequest[_addEventListener]('load', function(event) {
              _removeClass(file.item, 'loading');

              var preview = _createElement('div', {}, [_createElement('pre', {
                className: 'prettyprint'
              }, [this.responseText])]);

              basicLightbox.create(preview, {
                className: 'code'
              }).show(function() {
                'PR' in window && PR && PR.prettyPrint && PR.prettyPrint();
              });
            }, false);

            textRequest[_addEventListener]('error', function(event) {
              _removeClass(file.item, 'loading');

              _message('Error getting "' + file.title + '".');
            }, false);

            textRequest[_addEventListener]('abort', function(event) {
              _removeClass(file.item, 'loading');
            }, false);

            textRequest.send(null);

            event.preventDefault();
          }
        });
      }

      if (file['delete']) {
        file.item[_querySelector]('.delete')[_addEventListener]('click', function() {
          if (confirm('Are you sure you want to delete "' + file.title + '"?')) {
            WebDAV.del(file);
          }

          return false;
        });

        file.item[_querySelector]('.rename')[_addEventListener]('click', function() {
          var to = prompt('Please enter the new name for "' + file.title + '":', file.title);

          if (!to) {
            return false;
          }

          if (!_validateFileName(to)) {
            _message('Bad file name.');
            return false;
          }

          WebDAV.rename(file, file.path + to);

          return false;
        });

        if (file.item[_querySelector]('.copy')) {
          file.item[_querySelector]('.copy')[_addEventListener]('click', function() {
            _message('Currently not implemented.');

            return false;
          });
        }

        if (file.item[_querySelector]('.move')) {
          file.item[_querySelector]('.move')[_addEventListener]('click', function() {
            _message('Currently not implemented.');

            return false;
          });
        }

        if (file.item[_querySelector]('.download')) {
          file.item[_querySelector]('.download')[_addEventListener]('click', function(event) {
            event.stopPropagation();

            return true;
          });
        }
      }

      file.item[_addEventListener]('click', function() {
        file.item[_querySelector]('a.title').click();

        return false;
      });

      return file.item;
    },
    _checkFile = function(fileToCheck) {
      var foundFile = false;

      _files.forEach(function(file) {
        if (file.title === fileToCheck.title) {
          foundFile = file;

          return false;
        }
      });

      return foundFile;
    },
    _createElement = function(tagName, properties, children) {
      var element = _document.createElement(tagName);

      if (properties) {
        Object.keys(properties).forEach(function(key) {
          element[key] = properties[key];
        });
      }

      if (children && children.length) {
        children.forEach(function(child) {
          if ('string' === typeof child) {
            element.appendChild(_document.createTextNode(_decodeHTMLEntities(child)));
          }
          else if (child instanceof Node) {
            element.appendChild(child);
          }
        });
      }

      return element;
    },
    _decodeHTMLEntities = function(string) {
      var tempElement = _document.createElement('div');
      tempElement.innerHTML = string;
      return tempElement.innerText;
    },
    _createListItem = function(file) {
      file.item = _document.createElement('li');
      file.item.fileData = file;

      if (file.directory) {
        _addClass(file.item, 'directory');
      }
      else {
        _addClass(file.item, 'file');

        if (file.type) {
          _addClass(file.item, file.type);
        }
        else {
          _addClass(file.item.className, 'unknown');
        }
      }

      if (!file.directory) {
        _addClass(file.item, file.name.replace(/^.+\.([^\.]+)$/, '$1'));
      }

      file.item.appendChild(_createElement('a', {
        href: file.path + file.name,
        target: '_blank',
        className: 'title'
      }, [file.title]));

      if (!file.directory) {
        file.item.appendChild(_createElement('span', {
          className: 'size'
        }, [_showSize(file.size)]));
      }

      // parent folder doesn't have a 'name'
      if (file.name) {
        if (file['delete']) {
          file.item.appendChild(_createElement('a', {
            href: '#delete',
            title: 'Delete',
            className: 'delete'
          }, ['delete']));
          // file.item.appendChild('a', {
          //   href: '#move',
          //   title: 'Move',
          //   className: 'move'
          // }, ['move']);
        }

        file.item.appendChild(_createElement('a', {
          href: '#rename',
          title: 'Rename',
          className: 'rename'
        }, ['rename']));
        // file.item.appendChild('a', {
        //   href: '#copy',
        //   title: 'Copy',
        //   className: 'copy'
        // }, ['copy']);

        if (!file.directory) {
          file.item.appendChild(_createElement('a', {
            href: file.path + file.name,
            download: file.title,
            title: 'Download',
            className: 'download'
          }, ['download']));
        }
      }

      _bindEvents(file);

      return file;
    },
    _validateFileName = function(filename) {
      if (!filename) {
        return false;
      }
      else if (!filename.match(/^[\w \-\.]+$/)) {
        return false;
      }
      else if (filename.match(/^\.\.?$/)) {
        return false;
      }

      return true;
    },
    _makeSafePath = function(path) {
      return _decodeURIComponent(path).replace(/[^\w\/\-\.]/g, function(char) {
        return encodeURIComponent(char);
      });
    },
    _getFileName = function(path) {
      path = path.replace(/\/$/, '');

      return path.split('/').pop();
    },
    _getTag = function(doc, tag) {
      if (doc[_querySelector]) {
        return doc[_querySelector](tag);
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

      Object.keys(types).forEach(function(key) {
        if (file.match(types[key])) {
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
        req[_addEventListener](event, events[event], true);
      });

      req.send(null);

      return req;
    },
    _message = function(message, type) {
      if ('notify' in $) {
        // TODO: jQuery-free notify alternative
        $.notify(message, {
          className: (type || 'error')
        });
      }
      else {
        console.log(message);
      }
    },
    _refreshDisplay = function(forceRefresh) {
      return WebDAV.list(_path, forceRefresh);
    },
    _renderFiles = function() {
      _sortFiles();

      _emptyElement(_list);

      _files.forEach(function(file) {
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

      xhr[_addEventListener]('loadstart', function() {
        _busy = true;
      });

      xhr[_addEventListener]('loadend', function() {
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
          size += (i / Math.pow(1024, index)).toFixed((index > 0) ? 1 : 0) + ' ' + ((i === 1) ? 'byte' : text);
        }
      });

      return size;
    },
    _sortFiles = function() {
      if (_files.length) {
        _files.sort(function(a, b) {
          if (a.directory === b.directory) {
            return a.name.replace(/\/$/, '') < b.name.replace(/\/$/, '') ? -1 : 1;
          }
          else {
            return a.directory ? -1 : 1;
          }
        });
      }

      _files.forEach(function(file, i) {
        file.index = i;
      });

      return _files;
    },
    _updateDisplay = function() {
      _document.title = _decodeURIComponent(_path) + ' - ' + window.location.host;

      _renderFiles();
    },
    _handleUpload = function(newFiles) {
      if (newFiles && newFiles.length) {
        Array.from(newFiles).forEach(function(fileObject) {
          var existingFile = _checkFile(fileObject)
          if (existingFile) {
            if (!confirm('A file called "' + existingFile.name + '" already exists, would you like to overwrite it?')) {
              return false;
            }
            else {
              delete _files[existingFile.index];
            }
          }

          if (typeof FileReader != 'undefined') {
            var fileReader = new FileReader();

            fileReader[_addEventListener]('load', function(event) {
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
      }
    },
    _emptyElement = function(element) {
      if (element && element instanceof Node) {
        while (element.children.length) {
          element.removeChild(element.children[0]);
        }
      }
    },
    _setUpViewport = function() {
      var element = _document.createElement('meta');
      element.name = "viewport";
      element.content = "width=device-width, initial-scale=1";
      _document.head.appendChild(element);
    },
    _addClass = function(element, className) {
      if (element.classList) {
        if (!element.classList.contains(className)) {
          element.classList.add(className);
        }
      }
      else {
        if (!element.className.match(new RegExp(className + ' | ' + className + '|^' + className + '$'))) {
          element.className += className;
        }
      }
    },
    _removeClass = function(element, className) {
      if (element.classList) {
        if (element.classList.contains(className)) {
          element.classList.remove(className);
        }
      }
      else {
        var expression = new RegExp(className + ' | ' + className + '|^' + className + '$');
        if (element.className.match(expression)) {
          element.className += element.className.replace(expression, '');
        }
      }

    },

    // private vars
    _busy = false,
    _cache = {},
    _files = [],
    _list = _createElement('ul', {
      className: 'list'
    }),
    _path = window.location.pathname,

    // exposed API
    WebDAV = {
      init: function() {
        _emptyElement(_document.body);

        _setUpViewport();

        var _content = _createElement('div', {
          className: 'content'
        });
        _document.body.appendChild(_content);

        var _createDirectory = _createElement('a', {
          href: '#createDirectory',
          className: 'create-directory'
        }, ['create&nbsp;a&nbsp;new directory']);

        var _dropper = _createElement('div', {
          className: 'upload'
        }, [_createElement('span', {
          className: 'droppable'
        }, ['Drop&nbsp;files&nbsp;anywhere to&nbsp;upload']), ' or ', _createDirectory]);
        _document.body.appendChild(_dropper);

        if ('ontouchstart' in _document.body) {
          _dropper[_querySelector]('span.droppable').replaceWith(_createElement('span', null, ['Upload files ', _createElement('input', {
            type: 'file',
            multiple: null
          })]));

          // TODO: event listener
          _dropper[_querySelector]('input[type="file"]')[_addEventListener]('change', function(event) {
            var newFiles = event.originalEvent.target.files || event.originalEvent.dataTransfer.files;
            _handleUpload(newFiles);
            this.value = null;
          });
        }

        _content.appendChild(_list);

        WebDAV.list(_path);

        // render the nice list
        _renderFiles();

        // drag and drop area
        // TODO: event listeners
        _document.body[_addEventListener]('dragover dragenter', function(event) {
          if (event.targetElement.matches('.directory')) {
            event.stopPropagation();

            _addClass(this, 'active');

            return false;            
          }
        });

        _document.body[_addEventListener]('dragleave', function(event) {
          if (event.targetElement.matches('.directory')) {
            _removeClass(this, 'active');

            return false;
          }
        });

        _document.body[_addEventListener]('dragover', function(event) {
          _addClass(_document.body, 'active');

          return false;
        });

        _document.body[_addEventListener]('dragleave dragend', function(event) {
          _removeClass(_document.body, 'active');

          return false;
        });

        _document.body[_addEventListener]('drop', function(event) {
          var dropFile = event.target.fileData;
          var newFiles = event.originalEvent.target.files || event.originalEvent.dataTransfer.files;

          _removeClass(document.body, 'active');

          if (dropFile && dropFile.directory) {
            var path = dropFile.path + dropFile.name;
            path = path.match(/\/$/) ? path : path + '/'; // ensure we have a trailing slash for some platforms

            WebDAV.list(path, false, function() {
              _handleUpload(newFiles);
            });
          }
          else {
            _handleUpload(newFiles);
          }

          return false;
        });

        // create directory
        // TODO: event listeners
        _createDirectory[_addEventListener]('click', function() {
          var name = prompt('New folder name:'),
          file = _checkFile(name);

          if (!name) {
            return false;
          }

          if (!_validateFileName(name)) {
            alert('Name contains unsupported characters, aborting.');

            return false;
          }

          if (file) {
            if (file.directory) {
              alert('Directory "' + file.title + '" already exists.');
            }
            else {
              alert('A file called "' + file.title + '" exists, unable to create folder.');
            }

            return false;
          }

          file = {
            directory: true,
            name: _makeSafePath(name),
            title: name,
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

          file.request[_addEventListener]('loadstart', function(event) {
            _addClass(file.item, 'loading');
          }, false);

          file.request[_addEventListener]('load', function(event) {
            _removeClass(file.item, 'loading');
          }, false);

          file.request[_addEventListener]('error', function(event) {
            delete _files[file.index];

            _updateDisplay();

            _message('Error creating directory ' + file.title + '.');
          }, false);

          file.request[_addEventListener]('abort', function(event) {
            delete _files[file.index];

            _updateDisplay();

            _message('Aborted as requested.', 'success');
          }, false);

          _files.push(_createListItem(file));

          _updateDisplay();

          file.request.send(null);

          return false;
        });

        // TODO: event listeners
        window[_addEventListener]('popstate', function(e) {
          WebDAV.list(window.location.pathname);
        });

        // replace refresh key with force reload
        _document[_addEventListener]('keydown', function(e) {
          var keyCode = e.which || e.keyCode;

          if ((keyCode === 116) || ((keyCode === 82) && (e.metaKey || e.ctrlKey))) {
            e.preventDefault();

            WebDAV.list(_path, true);

            return false;
          }

          return true;
        });
      },
      list: function(path, refresh, callback) {
        path = path.match(/\/$/) ? path : path + '/'; // ensure we have a trailing slash for some platforms

        history.pushState(history.state, path, path);

        if ((path in _cache) && !refresh) {
          _files = [];

          _cache[_path = path].forEach(function(file) {
            // events need to be re-bound
            _files.push(_createListItem(file));
          });

          _updateDisplay();

          if (callback && callback.call) {
            callback();
          }

          return;
        }

        _listContents(path, {
          loadstart: function() {
            _addClass(_document[_querySelector]('div.content'), 'loading');
          },
          loadend: function() {
            _removeClass(_document[_querySelector]('div.content'), 'loading');
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
                title: _decodeURIComponent(name),
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

            if (callback && callback.call) {
              callback();
            }
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
          title: _decodeURIComponent(fileObject.name),
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

        file.request[_addEventListener]('loadstart', function(event) {
          _addClass(file.item, 'loading');
          file.item[_querySelector]('span.size').after('<span class="uploading"><span class="progress"><span class="meter"></span></span><span class="cancel-upload">&times;</span></span>');
          file.item[_querySelector]('span.cancel-upload')[_addEventListener]('click', function() {
            file.request.abort();

            return false;
          });
        }, false);

        file.request[_addEventListener]('progress', function(event) {
          file.item[_querySelector]('span.meter').width('' + ((event.position / event.total) * 100) + '%');
        }, false);

        file.request[_addEventListener]('load', function(event) {
          var success = this.status < 400; // basic check for now, could do more with these and print more meaningful error messages...

          if (success) {
            _message(file.title + ' uploaded successfully.', 'success');
          }
          else {
            delete _files[file.index];

            _message('Error uploading file. (' + this.status + ')');
          }

          _refreshDisplay(true);
        }, false);

        file.request[_addEventListener]('error', function(event) {
          delete _files[file.index];

          _message('Error uploading file.');
        }, false);

        file.request[_addEventListener]('abort', function(event) {
          delete _files[file.index];

          _message('Aborted as requested.', 'success');
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

        file.request[_addEventListener]('load', function(event) {
          _refreshDisplay(true);
        }, false);

        file.request[_addEventListener]('error', function(event) {
          _message('Error deleting file ' + file.title + '.');
        }, false);

        file.request[_addEventListener]('abort', function(event) {
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

        from.request[_addEventListener]('load', function(event) {
          _refreshDisplay();
        }, false);

        from.request[_addEventListener]('error', function(event) {
          _message('Error copying file ' + file.title + '.');
        }, false);

        from.request[_addEventListener]('abort', function(event) {
          _message('Aborted as requested.', 'success');
        }, false);

        from.request.send(null);

        return true;
      },
      move: function(from, to) {
        // TODO
        from.request = _request('MOVE', from.path + from.name, {
          Destination: window.location.protocol + '//' + window.location.host + _makeSafePath(to)
        });

        from.request[_addEventListener]('load', function(event) {
          _refreshDisplay(true);
        }, false);

        from.request[_addEventListener]('error', function(event) {
          _message('Error moving file ' + file.title + '.');
        }, false);

        from.request[_addEventListener]('abort', function(event) {
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

  if (_document.readyState === "complete") {
    WebDAV.init();
  }
  else {
    _document[_addEventListener]("DOMContentLoaded", function() {
      WebDAV.init();
    });

    window.addEventListener('load', function() {
      WebDAV.init();
    })
  }
})(document, decodeURIComponent, 'querySelector', 'addEventListener');

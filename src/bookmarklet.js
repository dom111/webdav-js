javascript:(function() {
    var head = document.getElementsByTagName('head')[0],
    _createScript = function(path, onload) {
        var element = document.createElement('script');
        element.src = path;
        element.type = 'text/javascript';

        if (onload) {
            element.onload = onload;
        }

        head.appendChild(element);
    },
    _createStyle = function(path) {
        var element = document.createElement('link');
        element.href = path;
        element.rel = 'stylesheet';
        head.appendChild(element);
    };

    _createScript('https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', function() {
        ['https://cdn.rawgit.com/dom111/webdav-js/master/src/webdav-min.js', 'https://cdn.rawgit.com/dom111/webdav-js/master/external/fancybox/jquery.fancybox.js', 'https://cdn.rawgit.com/dom111/webdav-js/master/external/fancybox/jquery.fancybox.css', 'https://cdn.rawgit.com/dom111/webdav-js/master/assets/css/style-min.css'].forEach(function(file) {
            file.match(/js$/) ? _createScript(file) : _createStyle(file);
        });
    });
})();


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

    _createScript('https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js', function() {
        ['https://cdn.rawgit.com/noelboss/featherlight/1.7.1/release/featherlight.min.js', 'https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?autorun=false', 'https://cdn.rawgit.com/notifyjs/notifyjs/master/dist/notify.js', 'https://cdn.rawgit.com/noelboss/featherlight/1.7.1/release/featherlight.min.css', 'https://cdn.rawgit.com/dom111/webdav-js/master/assets/css/style-min.css', 'https://cdn.rawgit.com/dom111/webdav-js/master/src/webdav-min.js'].forEach(function(file) {
            file.match(/css$/) ? _createStyle(file) : _createScript(file);
        });
    });
})();

// NOTE: this bookmarklet assumes you have a standard Apache directory listing
(function() {
    var head = document.getElementsByTagName('head')[0],
    body = document.getElementsByTagName('body')[0],
    script = document.createElement('script'),
    link = document.createElement('link');

    // TODO: test if document is fully loaded

    var mainStyle = link.cloneNode(),
    fancyboxStyle = link.cloneNode();
    mainStyle.href = 'https://raw.github.com/dom111/webdav-js/master/assets/css/style-min.css';
    fancyboxStyle.href = 'https://raw.github.com/dom111/webdav-js/master/external/fancybox/jquery.fancybox.css?v=2.0.6';
    fancyboxStyle.rel = mainStyle.rel = 'stylesheet';
    fancyboxStyle.type = mainStyle.type = 'text/css';
    fancyboxStyle.media = mainStyle.media = 'screen';
    head.appendChild(mainStyle);
    head.appendChild(fancyboxStyle);

    var jqueryScript = script.cloneNode(),
    fancyboxScript = script.cloneNode(),
    webdavScript = script.cloneNode();
    jqueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js';
    fancyboxScript.src = 'https://raw.github.com/dom111/webdav-js/master/external/fancybox/jquery.fancybox.js?v=2.0.6';
    webdavScript.src = 'https://raw.github.com/dom111/webdav-js/master/src/webdav-min.js';
    jqueryScript.type = fancyboxScript.type = webdavScript.type = 'text/javascript';
    head.appendChild(jqueryScript);
    head.appendChild(fancyboxScript);

    var header = '\
<div class="content">\
    <div style="display: none;">',
    footer = '\
    </div> <!-- hider -->\
</div> <!-- .content -->\
<div class="upload">\
    Drop files here to upload or <a href="#createDirectory" class="create-directory">create a new directory</a>\
</div>\
',
    content = body.innerHTML;

    body.innerHTML = header + content + footer;

    // need to wait for jQuery before launching the main script
    var interval = window.setInterval(function() {
        if (typeof jQuery != 'undefined') {
            head.appendChild(webdavScript);
            window.clearInterval(interval);
        }
    }, 100);
})();

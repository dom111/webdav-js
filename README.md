webdav-js
=========
A simple way to administer a WebDAV filesystem in a browser.

Currently Supported
-------------------
Firefox (Unsure of specific version, works on latest)
Chrome (Unsure of specific version, works on latest)

Implementations
---------------
Add this to your Bookmarks Bar:

    javascript:!function(){var e=document.getElementsByTagName('head')[0],t=function(t,a){var s=document.createElement('script');s.src=t,s.type='text/javascript',a&&(s.onload=a),e.appendChild(s)},a=function(t){var a=document.createElement('link');a.href=t,a.rel='stylesheet',e.appendChild(a)};t('https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js',function(){['https://cdn.rawgit.com/dom111/webdav-js/master/src/webdav-min.js','https://cdn.rawgit.com/dom111/webdav-js/master/external/fancybox/jquery.fancybox.js','https://cdn.rawgit.com/dom111/webdav-js/master/external/fancybox/jquery.fancybox.css','https://cdn.rawgit.com/dom111/webdav-js/master/assets/css/style-min.css'].forEach(function(e){e.match(/js$/)?t(e):a(e)})})}()

Another use could be to implement the above bookmarklet in-line using `Apache`'s `Indexes` option using the `HeaderName` directive.

[Blog post](https://dom.hastin.gs/blog/uncategorized/wevdav-js-update/475)
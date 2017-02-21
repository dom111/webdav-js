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

    javascript:!function(){var t=document.getElementsByTagName("head")[0],e=function(e,s){var a=document.createElement("script");a.src=e,a.type="text/javascript",s&&(a.onload=s),t.appendChild(a)},s=function(e){var s=document.createElement("link");s.href=e,s.rel="stylesheet",t.appendChild(s)};e("https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js",function(){["https://cdn.rawgit.com/noelboss/featherlight/1.7.1/release/featherlight.min.js","https://cdn.rawgit.com/google/code-prettify/master/loader/run_prettify.js?autorun=false","https://cdn.rawgit.com/notifyjs/notifyjs/master/dist/notify.js","https://cdn.rawgit.com/noelboss/featherlight/1.7.1/release/featherlight.min.css","https://cdn.rawgit.com/dom111/webdav-js/master/assets/css/style.min.css","https://cdn.rawgit.com/dom111/webdav-js/master/src/webdav-min.js"].forEach(function(t){t.match(/css$/)?s(t):e(t)})})}()

Another use could be to implement the above bookmarklet in-line using `Apache`'s `Indexes` option using the `HeaderName` directive.

[Blog post](https://dom.hastin.gs/blog/uncategorized/wevdav-js-update/475)


## Supports

 - Browsing WebDAV shares by folder
 - Previewing font, image, video, audio and anything supplied by the server with `text/` mime-types
 - Directory creation
 - Drag and drop file upload


## TODO

 - jsTree navigation for Copy/Move
 - jsDoc

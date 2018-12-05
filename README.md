webdav-js
=========
A simple way to administer a WebDAV filesystem in a browser.

Currently Tested
----------------
Firefox
Chrome
Edge

Implementations
---------------
Add this to your Bookmarks Bar:

    javascript:!function(){var e;e=["https://cdn.jsdelivr.net/gh/noelboss/featherlight@1.7.1/release/featherlight.min.js","https://cdn.jsdelivr.net/gh/google/code-prettify/loader/run_prettify.js?autorun=false","https://cdn.jsdelivr.net/gh/notifyjs/notifyjs/dist/notify.js","https://cdn.jsdelivr.net/gh/noelboss/featherlight@1.7.1/release/featherlight.min.css","https://cdn.jsdelivr.net/gh/dom111/webdav-js/assets/css/style-min.css","https://cdn.jsdelivr.net/gh/dom111/webdav-js/src/webdav-min.js"];var t,n=document.getElementsByTagName("head")[0],a=function(e,t){var s=document.createElement("script");s.src=e,s.type="text/javascript",t&&(s.onload=t),n.appendChild(s)};a("https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js",function(){e.forEach(function(e){var t,s;e.match(/css$/)?(t=e,(s=document.createElement("link")).href=t,s.rel="stylesheet",n.appendChild(s)):a(e)})}),(t=document.createElement("meta")).name="viewport",t.content="width=device-width, initial-scale=1",n.appendChild(t)}()

There are supplied examples for how to set up `Apache` in the `examples/` directory and a working example (using Docker) usable via the scripts in the `test/` directory.

[Blog post](https://dom.hastin.gs/blog/uncategorized/wevdav-js-update/475)


## Supports

 - Browsing WebDAV shares by folder
 - Previewing font, image, video, audio and anything supplied by the server with `text/` mime-types
 - Directory creation
 - Drag and drop file upload


## TODO

 - jsTree navigation for Copy/Move
 - jsDoc

!function(o){"from"in Array||(Array.from=function(e){return[].slice.call(e)}),"keys"in Object||(Object.keys=function(e){var t=[];for(var n in e)e.hasOwnProperty(n)&&t.push(n);return t});var n,r,s,l,i,d,c,u,p,f,e,m,t,y,h,v,g,q,w,b,E=(r=function(e){var t=!1;return o.each(g,function(){if(decodeURIComponent(this.name)===decodeURIComponent(e.name))return t=this,!1}),t},s=function(e){var i;return e.item=o("<li/>").data("file",e),e.directory?e.item.addClass("directory"):(e.item.addClass("file"),e.type?e.item.addClass(e.type):e.item.addClass("unknown")),e.directory||e.item.addClass(e.name.replace(/^.+\.([^\.]+)$/,"$1")),e.item.append('<a href="'+e.path+e.name+'" target="_blank" class="title">'+e.title+"</a>"),e.directory||e.item.append('<span class="size">'+t(e.size)+"</span>"),e.name&&(e.delete&&(e.item.append('<a href="#delete" title="Delete" class="delete">delete</a>'),e.item.append('<a href="#move" title="Move" class="move">move</a>')),e.item.append('<a href="#rename" title="Rename" class="rename">rename</a>'),e.item.append('<a href="#copy" title="Copy" class="copy">copy</a>'),e.directory||e.item.append('<a href="'+e.path+e.name+'" download="'+e.name+'" class="download">download</a>')),(i=e).directory?i.item.find(".title").on("click",function(){return history.pushState(history.state,i.path+i.name,i.path+i.name),b.list(i.path+i.name),!1}):i.item.find(".title").on("click",function(e){if(e.stopPropagation(),"video"===i.type)o.featherlight('<video autoplay controls><source src="'+i.path+i.name+'"/></video>'),e.preventDefault();else if("audio"===i.type)o.featherlight('<audio autoplay controls><source src="'+i.path+i.name+'"/></audio>'),e.preventDefault();else if("image"===i.type)o.featherlight({image:i.path+i.name}),e.preventDefault();else if("font"===i.type){var t=i.name.replace(/^.+\.([^\.]+)$/,"$1").toLowerCase(),n=(i.path+i.name).replace(/\W+/g,"_"),r="The quick brown fox jumps over the lazy dog. 0123456789<br/>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz";o('[data-path="'+(i.path+i.name)+'"]').is("style")||o("body").appendChild('<style type="text/css" data-path="'+(i.path+i.name)+'">@font-face{font-family:"'+n+'";src:url("'+i.path+i.name+'") format("'+({eot:"embedded-opentype",otf:"opentype",ttf:"truetype"}[t]||t)+'")}</style>'),o.featherlight('<h1 style="font-family:"'+n+'">'+i.name+"</h1><p style=\"font-family:'"+n+"';font-size:1.5em\">"+r+"</p><p style=\"font-family:'"+n+"'\">"+a+"</p><p style=\"font-family:'"+n+"'\"><strong>"+r+"</strong></p><p style=\"font-family:'"+n+"'\"><em>"+r+'</em></p><p><a href="'+i.path+i.name+'" style="display:inline-block;padding:.5em;background:#000;font-family:sans-serif;border-radius:.5em;color:#fff">Download</a></p>'),e.preventDefault()}else"text"===i.type&&("code"in o.featherlight.contentFilters||o.extend(o.featherlight.contentFilters,{code:{process:function(e){var n=o.Deferred(),r=o('<pre class="prettyprint"></pre>');return o.ajax(e,{complete:function(e,t){"error"!==t&&(r.text(e.responseText),n.resolve(r),PR.prettyPrint()),n.fail()}}),n.promise()}}}),o.featherlight({code:i.path+i.name}),e.preventDefault())}),i.delete&&(i.item.find(".delete").on("click",function(){return confirm('Are you sure you want to delete "'+i.name+'"?')&&b.del(i),!1}),i.item.find(".rename").on("click",function(){var e=prompt('Please enter the new name for "'+i.name+'":',decodeURIComponent(i.name));return e&&(l(e)?b.rename(i,i.path+e):p("Bad file name.")),!1}),i.item.find(".copy").on("click",function(){return p("Currently not implemented."),!1}),i.item.find(".move").on("click",function(){return p("Currently not implemented."),!1}),i.item.find(".download").on("click",function(e){return e.stopPropagation(),!0})),i.item.on("click",function(){return i.item.find("a.title").click(),!1}),i.item,e},l=function(e){return!!e&&!!e.match(/^[\w \-\.]+$/)&&!e.match(/^\.\.?$/)},i=function(e){return decodeURIComponent(e).replace(/[^\w\/\-\.]/g,function(e){return encodeURIComponent(e)})},d=function(e,t){return e.querySelector?e.querySelector(t):e.getElementsByTagName(t)[0]},c=function(e,t){var n=d(e,t);return n?n.textContent:""},u=function(n){if(n.mimeType&&n.mimeType.split("/").shift())return n.mimeType.split("/").shift();var r="unknown";return o.each({text:/\.(?:te?xt|i?nfo|php|pl|cgi|faq|ini|htaccess|log|md|sql|sfv|conf|sh|pl|pm|py|rb|(?:s?c|sa)ss|js|java|coffee|[sx]?html?|xml)$/i,image:/\.(?:jpe?g|gif|a?png|svg)/i,video:/\.(?:mp(?:e?g)?4|mov|avi|webm|ogv)/i,audio:/\.(?:mp3|wav|ogg)/i,font:/\.(?:woff2?|eot|[ot]tf)/i},function(e,t){if(n.match(t))return r=e,!1}),r},p=function(e,t){"notify"in o?o.notify(e,{className:t||"error"}):console.log(e)},f=function(e){return b.list(w,e)},e=function(){return y(),q.empty(),o.each(g,function(e,t){t&&q.append(t.item)}),q},m=function(e,t,n,r){var a=new XMLHttpRequest;return r||(t+=(-1<t.indexOf("?")?"&":"?")+"_="+Date.now()),a.addEventListener("loadstart",function(){}),a.addEventListener("loadend",function(){}),a.open(e,t,!0),n&&Object.keys(n).forEach(function(e){a.setRequestHeader(e,n[e])}),a},t=function(n){var r="";return["bytes","KB","MB","GB","TB","PB"].forEach(function(e,t){!r&&n<Math.pow(1024,t+1)&&(r+=(n/Math.pow(1024,t)).toFixed(0<t?1:0)+" "+(1===n?"byte":e))}),r},y=function(){return g.length&&g.sort(function(e,t){return e.directory===t.directory?e.name.replace(/\/$/,"")<t.name.replace(/\/$/,"")?-1:1:e.directory?-1:1}),o.each(g,function(e){this.index=e}),g},h=function(){document.title=decodeURIComponent(w)+" - "+window.location.host,y(),e()},v={},g=[],q=o('<ul class="list"/>'),w=window.location.pathname,b={init:function(){o('<div class="content"></div><div class="upload">Drop&nbsp;files&nbsp;here to&nbsp;upload&nbsp;or <a href="#createDirectory" class="create-directory">create&nbsp;a&nbsp;new directory</a></div>').appendTo(o("body").empty()),o("div.content").append(q),n=o("div.upload"),b.list(w),e(),n.on("dragover",function(){return n.addClass("active"),!1}),n.on("dragend dragleave",function(e){return n.removeClass("active"),!1}),n.on("drop",function(e){var t=e.originalEvent.target.files||e.originalEvent.dataTransfer.files;return n.removeClass("active"),o.each(t,function(e,t){if(existingFile=r(t)){if(!confirm('A file called "'+existingFile.name+'" already exists, would you like to overwrite it?'))return!1;delete g[existingFile.index]}if("undefined"!=typeof FileReader){var n=new FileReader;n.addEventListener("load",function(e){t.data=e.target.result,b.upload(t)},!1),n.context=b,n.filename=t.name,n.readAsArrayBuffer(t)}else p("Sorry, your browser isn't currently suppored.")}),!1}),o("a.create-directory").on("click",function(){var e=prompt("New folder name:"),t=r(e);return e&&(l(e)?t?t.directory?alert('Directory "'+t.name+'" already exists.'):alert('A file called "'+t.name+'" exists, unable to create folder.'):((t={directory:!0,name:i(e),title:e,path:w,modified:Date.now(),size:!1,type:u(e),mimeType:"",request:null,item:null,delete:!0}).request=m("MKCOL",t.path+t.name),t.request.addEventListener("loadstart",function(e){t.item.addClass("loading")},!1),t.request.addEventListener("load",function(e){t.item.removeClass("loading")},!1),t.request.addEventListener("error",function(e){delete g[t.index],h(),p("Error creating directory "+t.name+".")},!1),t.request.addEventListener("abort",function(e){delete g[t.index],h(),p("Aborted as requested.","success")},!1),g.push(s(t)),h(),t.request.send(null)):alert("Name contains unsupported characters, aborting.")),!1}),o(window).on("popstate",function(e){b.list(window.location.pathname)}),o(document).on("keydown",function(e){var t=e.which||e.keyCode;return 116!==t&&(82!==t||!e.metaKey&&!e.ctrlKey)||(e.preventDefault(),b.list(w,!0),!1)})},list:function(i,e){if((i=i.match(/\/$/)?i:i+"/")in v&&!e)return g=[],v[w=i].forEach(function(e){g.push(s(e))}),h();var t,n;t={loadstart:function(){o("div.content").addClass("loading")},loadend:function(){o("div.content").removeClass("loading")},load:function(e){var t,n,r=e.target,a=(new DOMParser).parseFromString(r.responseText,"application/xml");w=i,g=[],(t=a,n="response",t.querySelectorAll?Array.from(t.querySelectorAll(n)):Array.from(t.getElementsByTagName(n))).forEach(function(e,t){var n=c(e,"href"),r=n.replace(/\/$/,"").split("/").pop();t?g.push(s({directory:!!d(e,"collection"),name:r,title:decodeURIComponent(r),path:w,modified:new Date(c(e,"getlastmodified")),size:c(e,"getcontentlength"),type:u(r),mimeType:c(e,"getcontenttype"),request:null,item:null,delete:!0})):"/"!=i&&g.push(s({directory:!0,name:"",title:"&larr;",path:i.replace(/[^\/]+\/?$/,""),modified:"",size:"",type:"",mimeType:"",request:null,item:null,delete:!1}))}),g.timestamp=Date.now(),v[w]=g,h()},error:function(){p("There was an error getting details for "+i+".")},abort:function(){p("Aborted as requested. "+i,"success")}},n=m("PROPFIND",i,{Depth:1}),Object.keys(t).forEach(function(e){n.addEventListener(e,t[e],!0)}),n.send(null)},upload:function(e){if(!e.name)return!1;var t={directory:!1,name:e.name,title:decodeURIComponent(e.name),path:w,modified:new Date,size:e.data.byteLength,type:u(e.name),mineType:e.type,request:null,item:null,delete:!0};return t.request=m("PUT",t.path+t.name,{"Content-Type":t.type}),t.request.addEventListener("loadstart",function(e){t.item.addClass("loading"),t.item.find("span.size").after('<span class="uploading"><span class="progress"><span class="meter"></span></span><span class="cancel-upload">&times;</span></span>'),t.item.find("span.cancel-upload").on("click",function(){return t.request.abort(),!1})},!1),t.request.addEventListener("progress",function(e){t.item.find("span.meter").width(e.position/e.total*100+"%")},!1),t.request.addEventListener("load",function(e){f(),p(t.name+" uploaded successfully.","sucess")},!1),t.request.addEventListener("error",function(e){delete g[t.index],h(),p("Error uploading file.")},!1),t.request.addEventListener("abort",function(e){delete g[t.index],h(),p("Aborted as requested.","sucess")},!1),g.push(s(t)),h(),t.request.send(e.data),!0},del:function(t){return!!t.name&&("path"in t||(t.path=w),t.request=m("DELETE",t.path+t.name),t.request.addEventListener("load",function(e){f(!0)},!1),t.request.addEventListener("error",function(e){p("Error deleting file "+t.name+".")},!1),t.request.addEventListener("abort",function(e){p("Aborted as requested.","success")},!1),t.request.send(null),!0)},copy:function(e,t){return e.request=m("COPY",e.path+e.name,{Destination:t}),e.request.addEventListener("load",function(e){f()},!1),e.request.addEventListener("error",function(e){p("Error copying file "+file.name+".")},!1),e.request.addEventListener("abort",function(e){p("Aborted as requested.","success")},!1),e.request.send(null),!0},move:function(e,t){return e.request=m("MOVE",e.path+e.name,{Destination:window.location.protocol+"//"+window.location.host+i(t)}),e.request.addEventListener("load",function(e){f(!0)},!1),e.request.addEventListener("error",function(e){p("Error moving file "+file.name+".")},!1),e.request.addEventListener("abort",function(e){p("Aborted as requested.","success")},!1),e.request.send(null),!0},rename:function(e,t){return this.move(e,t)}});o(function(){E.init()})}(jQuery);
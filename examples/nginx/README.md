# Nginx Directory List Example

To utilise this example, you'll need a running nginx server with the fancyindex
module and (obviously) WebDAV enabled.

Copy the files in this directory to /usr/local/share/webdavjs-nginx/, and add
the following line to your server config:

```
include /usr/local/share/webdavjs-nginx/webdavindex.conf;
```

By using the fancyindex module and having the module's generated index under
\<noscript\> tags, a directory index is still available to clients that can not
use JavaScript, including `wget` or MPD's curl storage plugin backend.

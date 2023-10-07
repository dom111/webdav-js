# lighttpd Directory List Example

To utilise this lighttpd directory list replacement, you'll need to have your
own server set up and configured with WevDAV (hopefully that's a given!).

Clone this repository to a desirable location (e.g. `/var/www/webdav-js`) then
modify the example `webdav.conf` file to your liking, updating the references
to the `webdav-js` repo if you've checked it out elsewhere.

Include `webdav.conf` in your lighttpd.conf or symlink in /etc/lighttpd/conf.d/
(or similar directory, depending on the convention used by the lighttpd package
in your OS distribution).

From then on you should be able to upload and browse at your leisure.

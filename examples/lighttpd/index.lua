--
-- serve page with webdav-js for GET and HEAD requests for collection
--

local r = lighty.r

local method = r.req_attr["request.method"]
if (method ~= "GET" and method ~= "HEAD") then
  return 0
end

local path = r.req_attr["physical.path"]
-- check that path ends in '/'
if (not path or not string.match(path, "/$")) then
  return 0
end
-- check that path exists and is a directory
local st = lighty.c.stat(path)
if (not st or not st.is_dir) then
  return 0
end

-- Use webdav-js to generate index page for WebDAV collection
-- If not self-hosting webdav-js git checkout, could use these URLs below:
-- https://cdn.jsdelivr.net/gh/dom111/webdav-js/assets/css/style-min.css
-- https://cdn.jsdelivr.net/gh/dom111/webdav-js/src/webdav-min.js
r.resp_body:set({ [=[
<!DOCTYPE html>
<html>
<head>
<link rel="stylesheet" href="/webdav-js/assets/css/style-min.css">
</head>
<body>
<script src="/webdav-js/src/webdav-min.js"></script>
</body>
</html>
]=] })
r.resp_header["Content-Type"] = "text/html; charset=utf-8"
r.resp_header["Cache-Control"] = "max-age=3600"

return 200

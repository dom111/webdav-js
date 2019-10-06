[ ! -d ./tmp ] && mkdir -p ./tmp;

yarn -s node src/example.generator.js > ./tmp/example-local.js;
yarn -s terser ./tmp/example-local.js -c -m -e > ./tmp/example-local-min.js;
yarn -s node src/example.generator.js --cdn > ./tmp/example-cdn.js;
yarn -s terser ./tmp/example-cdn.js -c -m -e > ./tmp/example-cdn-min.js;

printf 'javascript:' > ./examples/bookmarklet/source-min.js;
cat ./tmp/example-cdn.js >> ./examples/bookmarklet/source-min.js;

printf '<script type="text/javascript">' > ./examples/apache-directory-list/header.html;
cat ./tmp/example-cdn-min.js >> ./examples/apache-directory-list/header.html;
printf '</script><!--' >> ./examples/apache-directory-list/header.html;

printf '<script type="text/javascript">' > ./examples/apache-directory-list-local/header.html;
cat ./tmp/example-local-min.js >> ./examples/apache-directory-list-local/header.html;
printf '</script><!--' >> ./examples/apache-directory-list-local/header.html;
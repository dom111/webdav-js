[ ! -d ./tmp ] && mkdir -p ./tmp;

VERSION="$1";

node build/example.generator.js --cdn --version "$VERSION" > ./tmp/example-cdn.js;
npm run --silent terser -- ./tmp/example-cdn.js -c -m -e > ./tmp/example-cdn-min.js;

printf 'javascript:' > ./examples/bookmarklet/source-min.js;
cat ./tmp/example-cdn-min.js >> ./examples/bookmarklet/source-min.js;

printf '<script type="text/javascript">' > ./examples/apache-directory-list/header.html;
cat ./tmp/example-cdn-min.js >> ./examples/apache-directory-list/header.html;
printf '</script><!--' >> ./examples/apache-directory-list/header.html;
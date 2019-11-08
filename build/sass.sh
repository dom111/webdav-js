> assets/css/style.css;
for file in node_modules/{basiclightbox/src/styles/main.scss,prismjs/themes/prism.css} assets/scss/style.scss; do
  echo '/* '$file' */' >> assets/css/style.css;
  npm run --silent node-sass -- --output-style=expanded $file >> assets/css/style.css;
done
rm -rf dist/*
yarn minify src/main.js > tmpfile; sed '1d' tmpfile > dist/main.js
yarn minify src/style.css > tmpfile; sed '1d' tmpfile > dist/style.css
yarn minify src/index.html > tmpfile; sed '1d' tmpfile > index.html
rm tmpfile

sed -i "s/style.css/dist\/style.css/" index.html
sed -i "s/main.js/dist\/main.js/" index.html

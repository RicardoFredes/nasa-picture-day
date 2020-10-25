GREEN="\e[1;32m"
RESET="\e[1;0m"
echo "$GREEN[Start process]$RESET"
echo "- Clear dist"
rm -rf dist/*
echo "- Minify files"
yarn minify src/main.js > tmpfile; sed '1d' tmpfile > dist/main.js
yarn minify src/style.css > tmpfile; sed '1d' tmpfile > dist/style.css
yarn minify src/index.html > tmpfile; sed '1d' tmpfile > index.html
rm tmpfile
echo "- Replace paths"
sed -i "s/style.css/dist\/style.css/" index.html
sed -i "s/main.js/dist\/main.js/" index.html
echo "$GREEN- Success $RESET"
echo "$GREEN[Finish process]$RESET"

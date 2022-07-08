#build webpage.h
#this involves gzip-ing the files and building byte arrays of them that
# can be stored in PROGMEM

echo '' > ./src/ESPRGB/Webpage.h
cd ./src/web-interface/
rm -rf dist
mkdir temp
mkdir dist

echo "======================="
echo "gzip-ing html files"
echo "======================="

for i in ./*.html; do
    n=$(echo "$i" | sed -e 's/^..//g')
    u=$(echo ${n^^} | sed -e 's/\.HTML//g')
    echo "processing $n"
    html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-script-type-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true ${i} > temp/temp.html
    echo "static const char HTML_$u[] PROGMEM = {" >> ../ESPRGB/Webpage.h
    gzip temp/temp.html -c | xxd -i >> ../ESPRGB/Webpage.h
    gzip temp/temp.html -c > ./dist/${n}.gz
    echo "};" >> ../ESPRGB/Webpage.h
done

echo "======================="
echo "gzip-ing js files"
echo "======================="

for i in ./*.js; do
    n=$(echo "$i" | sed -e 's/^..//g')
    u=$(echo ${n^^} | sed -e 's/\.JS//g')
    echo "processing $n"
    uglifyjs ${i} > temp/temp.js
    echo "static const char JS_$u[] PROGMEM = {" >> ../ESPRGB/Webpage.h
    gzip temp/temp.js -c | xxd -i >> ../ESPRGB/Webpage.h
    gzip temp/temp.js -c > ./dist/${n}.gz
    echo "};" >> ../ESPRGB/Webpage.h
done

echo "======================="
echo "gzip-ing css files"
echo "======================="

for i in ./*.css; do
    n=$(echo "$i" | sed -e 's/^..//g')
    u=$(echo ${n^^} | sed -e 's/\.CSS//g')
    echo "processing $n"
    uglifycss ${i} > temp/temp.css
    echo "static const char CSS_$u[] PROGMEM = {" >> ../ESPRGB/Webpage.h
    gzip temp/temp.css -c | xxd -i >> ../ESPRGB/Webpage.h
    gzip temp/temp.css -c > ./dist/${n}.gz
    echo "};" >> ../ESPRGB/Webpage.h
done

rm -rf temp


echo "done!"

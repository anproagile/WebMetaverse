#!/bin/bash
rm -rf build|| exit 0;
mkdir build; 
bash build.sh
( cd build
 git init
 git config --global user.name "WM Bot"
 git config --global user.email "bot@webmetaverse.com"
# cp ../CNAME ./CNAME
 cp ../lib/peer.js ./peer.js
 cp ../lib/minilog.js ./minilog.js
 cp ../static/index.html ./index.html
 cp ../static/app.css ./app.css
 git add .
 git commit -m "Deploy to Github Pages"
 git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)
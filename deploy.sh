#!/bin/bash
rm -rf build|| exit 0;
mkdir build
cd site
grunt
( cd dist
 git init
 git config --global user.name "WM Bot"
 git config --global user.email "bot@webmetaverse.com"
 git add .
 git commit -m "Deploy to Github Pages"
 git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:gh-pages > /dev/null 2>&1
)
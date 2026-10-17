#!/usr/bin/bash
packages=(
  "packages/basic-auth"
  "packages/blacklist"
  "packages/body-parser"
  "packages/compress"
  "packages/conditional-get"
  "packages/cors"
  "packages/index"
  "packages/json"
  "packages/log"
  "packages/mime"
  "packages/range"
  "packages/request-monitor"
  "packages/rewrite"
  "packages/spa"
  "packages/static"
)
npm test
for PACKAGE in ${packages[@]}; do
  cd $PACKAGE
  echo -e "\nRUNNING $PACKAGE\n\n"
  if ! npm test; then
    echo "TEST SUITE FAILED"
    exit 1
  fi
  cd ../../
done

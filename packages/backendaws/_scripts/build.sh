#!/bin/bash
set -e

echo "Cleaning dist..."
rm -rf dist build
mkdir build

echo "Bundling with esbuild..."
npx esbuild src/index.ts \
  --bundle \
  --platform=node \
  --target=esnext \
  --outfile=dist/index.js \
  --external:@aws-sdk/* \
  --external:aws-sdk --external:mock-aws-s3 \
  --external:node-pre-gyp --external:@mapbox/node-pre-gyp \
  --minify

echo "Zipping..."
cd dist && zip -r ../build/lambda.zip index.js && cd ..

echo "Build complete → ./build/lambda.zip"

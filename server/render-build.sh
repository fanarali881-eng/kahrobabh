#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Ensure the Puppeteer cache directory exists
PUPPETEER_CACHE_DIR=/opt/render/.cache/puppeteer
mkdir -p $PUPPETEER_CACHE_DIR

# Install Puppeteer and download Chrome
npx puppeteer browsers install chrome

# Store/pull Puppeteer cache with build cache
if [[ ! -d $PUPPETEER_CACHE_DIR/chrome ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  cp -R /opt/render/project/src/.cache/puppeteer/chrome/ $PUPPETEER_CACHE_DIR/ 2>/dev/null || true
else
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R $PUPPETEER_CACHE_DIR/chrome/ /opt/render/project/src/.cache/puppeteer/ 2>/dev/null || true
fi

echo "Puppeteer Chrome installed successfully!"
echo "Cache dir contents:"
ls -la $PUPPETEER_CACHE_DIR/ 2>/dev/null || echo "Cache dir empty"
find $PUPPETEER_CACHE_DIR -name "chrome" -type f 2>/dev/null || echo "Chrome binary not found in cache"

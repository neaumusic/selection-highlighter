#!/bin/bash

# check if xcode is installed
if ! command -v xcode-select &> /dev/null; then
    echo "Xcode is not installed; please install it from the App Store"
    exit 1
fi
# check if the build folder exists
if [ ! -d "./build/safari_extension" ]; then
    echo "Build folder does not exist; please run 'yarn build' first"
    exit 1
fi

# final build location
XCODEPROJ_PATH="./dist/safari_extension/Selection Highlighter/Selection Highlighter.xcodeproj"
echo "Checking if Safari project exists"
if [ ! -d "$XCODEPROJ_PATH" ]; then
    echo "Safari project does not exist; creating it..."
    # see webpack.config.ts for initial build
    xcrun safari-web-extension-converter \
    --copy-resources \
    --no-open \
    --force \
    --bundle-identifier "com.neaumusic.selection-highlighter" \
    --project-location "./dist/safari_extension" \
    "./build/safari_extension/"
else
    echo "Retaining existing Safari project"
fi

echo "Splicing in new files"
rm -r "./dist/safari_extension/Selection Highlighter/Shared (Extension)/Resources/"
cp -r \
  "./build/safari_extension/" \
  "./dist/safari_extension/Selection Highlighter/Shared (Extension)/Resources/"

echo "Safari build complete (open with Xcode and deploy to a target)"

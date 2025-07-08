#!/bin/bash

XCODEPROJ_PATH="./dist/safari_extension/Selection Highlighter/Selection Highlighter.xcodeproj"

# ONLY RUN ONCE (otherwise have to specify Signing & Capabilities -> Team in Xcode again)
echo "Checking if Safari project exists"
if [ ! -d "$XCODEPROJ_PATH" ]; then
    echo "Safari project does not exist; creating it..."
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

# RUN EVERY TIME
echo "Splicing in new files"
rm -r "./dist/safari_extension/Selection Highlighter/Shared (Extension)/Resources/"
cp -r \
  "./build/safari_extension/" \
  "./dist/safari_extension/Selection Highlighter/Shared (Extension)/Resources/"

echo "Safari build complete (open with Xcode and deploy to a target)"

# JUST DEPLOY VIA XCODE FOR NOW (IOS // MACOS)
# XCODE LIKES TO SIGN/DEPLOY WITH CERTIFICATES

# WORKS (macOS Safari schema)
# xcodebuild \
# -project "./dist/safari_extension/Selection Highlighter/Selection Highlighter.xcodeproj" \
# -scheme "Selection Highlighter (macOS)" \
# -allowProvisioningUpdates \
# CODE_SIGNING_ALLOWED=YES \
# build

# DOESNT WORK (iOS Safari schema)
# xcodebuild \
# -project "./dist/safari_extension/Selection Highlighter/Selection Highlighter.xcodeproj" \
# -scheme "Selection Highlighter (iOS)" \
# -allowProvisioningUpdates \
# CODE_SIGNING_ALLOWED=YES \
# install

# DOESNT WORK (iOS Safari Simulator schema)
# xcodebuild \
# -project "./dist/safari_extension/Selection Highlighter/Selection Highlighter.xcodeproj" \
# -scheme "Selection Highlighter (iOS)" \
# -sdk iphonesimulator \
# CODE_SIGNING_ALLOWED=NO \
# build

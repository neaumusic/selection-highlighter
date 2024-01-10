#!/bin/bash

XCODEPROJ_PATH="./dist/safari_extension/Selection Highlighter/Selection Highlighter.xcodeproj"

# ONLY RUN ONCE (otherwise have to specify Signing & Capabilities -> Team in Xcode again)
if [ ! -d "$XCODEPROJ_PATH" ]; then
    xcrun safari-web-extension-converter \
    --copy-resources \
    --no-open \
    --force \
    --bundle-identifier "com.neaumusic.selection-highlighter" \
    --project-location "./dist/safari_extension" \
    "./build/safari_extension/"
fi

# RUN EVERY TIME
rm -r "./dist/safari_extension/Selection Highlighter/Shared (Extension)/Resources/"
cp -r \
  "./build/safari_extension/" \
  "./dist/safari_extension/Selection Highlighter/Shared (Extension)/Resources/"
rm -r "./build/safari_extension/"

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

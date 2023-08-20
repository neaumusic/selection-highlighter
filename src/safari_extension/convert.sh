#!/bin/bash

# safari-web-extension-converter
xcrun /Applications/Xcode-beta.app/Contents/Developer/usr/bin/safari-web-extension-converter \
--copy-resources \
--no-open \
--force \
--bundle-identifier "com.neaumusic.selection-highlighter" \
--project-location "./dist/safari_extension" \
"./build/safari_extension/"

# macOS Safari schema
/Applications/Xcode-beta.app/Contents/Developer/usr/bin/xcodebuild \
-project "./dist/safari_extension/Selection Highlighter/Selection Highlighter.xcodeproj" \
-scheme "Selection Highlighter (macOS)" \
-configuration Release \
build

# iOS Safari schema
/Applications/Xcode-beta.app/Contents/Developer/usr/bin/xcodebuild \
-project "./dist/safari_extension/Selection Highlighter/Selection Highlighter.xcodeproj" \
-scheme "Selection Highlighter (iOS)" \
-configuration Release \
-sdk iphonesimulator \
CODE_SIGNING_ALLOWED=NO \
build

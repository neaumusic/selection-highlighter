#!/bin/bash

# Deployment Instructions:
# - The "Team" for code signing must be specified in the Xcode project settings.
# - To deploy the extension to a device or simulator, open the generated Xcode project.
# - In Xcode, select the desired target (iOS or macOS) in the scheme selector at the top.
# - Click the "Play" (Run) button to build and run the extension on the selected platform.

# NOTE: Xcode and safari-web-extension-converter have issues
# - After converting the extension, to match App Store Connect you may need to update the version number in the Xcode.
# - The bundle identifier must be all lowercase (e.g., "com.neaumusic.selection-highlighter").
#   If the converter or Xcode generates an uppercase or mixed-case identifier, change it to match the App Store Connect details.
# - For macOS targets, ensure the (macOS) Info.plist includes the "App Category".
# - For actual distribution (App Store or TestFlight), use Product > Archive in Xcode for the appropriate target (iOS or macOS).
# - After archiving, Xcode will guide you through uploading the build to App Store Connect (https://appstoreconnect.apple.com/).
# - App Store Connect is where you manage your app's store listing, metadata, and push builds to TestFlight for beta testing.

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

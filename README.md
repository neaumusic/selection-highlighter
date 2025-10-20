## Summary

Highlight all occurrences of selected text, with or without a keypress.

For code inspection and document analysis: search for and find keywords.

- No need to press CMD+F
- Maintains current selection
- Open source and configurable options (JavaScript)
- Ensure a "gate" key is pressed
- Match whole word and/or case-insensitive
- Blacklist bad hosts and ancestor HTML nodes

Highlight works on all sites, including GitHub, StackOverflow, HackerNews, etc.

<img src='src/images/screenshot_example.png' width='640' />

## Installation

Chrome Webstore (packed, .crx):

1. Visit the [Chrome Webstore page](https://chrome.google.com/webstore/detail/selection-highlighter/nepmkgohgoagfgcoegjaggacodcpdibj)
2. Click "+ Add To Chrome", click "Add Extension"

Firefox Add-ons (packed, .xpi):

1. Visit the [Firefox Addons page](https://addons.mozilla.org/en-US/firefox/addon/selection-highlighter-v2/)
2. Click "Add to Firefox", click "Add"

Safari (Mac/iOS)
1. Visit the [App Store page](https://apps.apple.com/us/app/selection-highlighter/id6476020741)
2. Click "Get", confirm purchase (supports the yearly developer license)

GitHub (latest release):

1. Click [Releases](https://github.com/neaumusic/selection-highlighter/releases), download the latest `selection_highlighter_chrome_extension.zip` or `selection_highlighter_firefox_extension.zip` asset, unzip the folder to a permanent location
2. Add to browser
   - Chrome: go to `chrome://extensions`, click "Load Unpacked", select the `chrome_extension` folder
   - Firefox: go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select `firefox_extension/manifest.json`
   - Safari: see "build source" steps below

GitHub (build source):

1. Click green button "Clone Or Download", "[Download Zip](https://github.com/neaumusic/selection-highlighter/archive/master.zip)", and unzip the folder to a permanent location
2. I recommend [volta](https://volta.sh) before `cd` into the directory, otherwise just see package.json for pinned versions (yarn 4, node 20)
3. Run `yarn` in the root (see package.json scripts)
4. Run `yarn build` (and optionally `yarn build:safari` once you have Xcode)
5. Install in browser
   - Chrome: go to `chrome://extensions`, click "Load Unpacked", select the `dist/chrome_extension` folder
   - Firefox: go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", select `dist/firefox_extension/manifest.json`
   - Safari: a bit more complicated, Google is your friend
     - you will need to allow unsigned extensions in macOS Safari - Settings - Advanced
     - for iOS you will likely need to create an Apple Developer account for signing/deploying to your connected device (and Simulator?) via Xcode
     - see `build_safari.sh` for more details
6. For development, I use `yarn watch` and refresh the extension or re-deploy to iOS/Safari

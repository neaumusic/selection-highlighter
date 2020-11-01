// ------------------------------------------------------
//            see highlighter.js userOptions
// ------------------------------------------------------
const defaultOptions = `({
  // ------------------------------------------------------------------------------
  //       Hello, and thanks for trying my extension, this is all JavaScript
  // ------------------------------------------------------------------------------

  isSelectionValid: function ({ selectionString, selection }) {
    return (
      selectionString.length >= 3 &&
      selection.type !== 'None' &&
      selection.type !== 'Caret'
    );
  },

  isWindowLocationValid: function (windowLocation) {
    const blacklistedHosts = [
      'linkedin.com',
      'collabedit.com',
      'coderpad.io',
      'jsbin.com',
      'plnkr.co',
      'youtube.com',
    ];
    return !blacklistedHosts.some(h => windowLocation.host.includes(h));
  },

  areKeysPressed: function (pressedKeys = []) {
    // return pressedKeys.includes('Meta'); // CMD key
    // return pressedKeys.includes('Alt'); // Option key
    return true;
  },

  occurrenceRegex: function (selectionString) {
    return new RegExp(selectionString, 'i'); // partial word, case insensitive
    // return new RegExp(selectionString); // partial word, case sensitive
    // return new RegExp(\`\\\\b\${selectionString}\\\\b\`, 'i'); // whole word, case insensitive
    // return new RegExp(\`\\\\b\${selectionString}\\\\b\`); // whole word, case sensitive
  },

  isAncestorNodeValid: (
    function isAncestorNodeValid (ancestorNode) {
      return (
        (!ancestorNode) ||
        (!ancestorNode.classList || !ancestorNode.classList.contains('CodeMirror')) &&
        (ancestorNode.nodeName !== 'SCRIPT') &&
        (ancestorNode.nodeName !== 'STYLE') &&
        (ancestorNode.nodeName !== 'HEAD') &&
        (ancestorNode.nodeName !== 'TITLE') &&
        (ancestorNode.nodeName !== 'INPUT') &&
        (ancestorNode.nodeName !== 'TEXTAREA') &&
        (ancestorNode.contentEditable !== 'true') &&
        (isAncestorNodeValid(ancestorNode.parentNode))
      );
    }
  ),

  trimRegex: function () {
    // leading, selectionString, trailing
    // trim parts maintained for offset analysis
    return /^(\\s*)(\\S+(?:\\s+\\S+)*)(\\s*)$/;
  },

  highlightedClassName: 'highlighted_selection',

  styles: {
    backgroundColor: 'rgb(255,255,0,1)', // yellow 100%
    margin: '0',
    padding: '0',
    lineHeight: '1',
    // display: 'inline',
  },

  areScrollMarkersEnabled: function () {
    return true;
  },

  scrollMarkerClassName: 'highlighted_selection_scroll_marker',

  scrollMarkerStyles: function ({ window, document, highlightedNode }) {
    const clientRect = highlightedNode.getBoundingClientRect();
    if (!clientRect.width || !clientRect.height) {
      return false;
    }

    return {
      height: '2px',
      width: '16px',
      boxSizing: 'content-box',
      border: '1px solid grey',
      position: 'fixed',
      top: (
        // window height times percent of element position in document
        window.innerHeight * (
          + window.scrollY
          + clientRect.top
          + (0.5 * (clientRect.top - clientRect.bottom))
        ) / document.body.clientHeight
      ) + 'px',
      right: '0px',
      backgroundColor: 'yellow',
      zIndex: '2147483647',
    };
  },
})`;

const optionsTextArea = document.querySelector('textarea#options-text');

chrome.storage.sync.get('optionsText', e => {
  optionsTextArea.value = (e.optionsText || defaultOptions);
});

document.querySelector('button#submit-button').addEventListener('click', e => {
  chrome.storage.sync.set({ optionsText: optionsTextArea.value, });
});

document.querySelector('button#reset-button').addEventListener('click', e => {
  if (window.confirm('Are you sure?')) {
    chrome.storage.sync.clear(() => window.location.reload());
  }
});
